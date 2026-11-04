const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function setup() {
  const listeners = new Map();
  const reduced = { matches: false, addEventListener: (type, fn) => listeners.set('reduced', fn) };
  const document = { hidden: false, querySelectorAll: () => [], createElement: () => ({}), addEventListener: (type, fn) => listeners.set(type, fn) };
  const window = { addEventListener: (type, fn) => listeners.set(type, fn) };
  vm.runInNewContext(readFileSync(require.resolve('../media-playback.js'), 'utf8'), { window, document, matchMedia: () => reduced, Promise });
  const events = new Map();
  let resolve, reject, playCount = 0;
  const video = {
    paused: true, readyState: 1, isConnected: true,
    setAttribute() {}, addEventListener(type, fn) { events.set(type, fn); },
    play() { playCount++; return new Promise((yes, no) => { resolve = () => { this.paused = false; yes(); }; reject = no; }); },
    pause() { this.paused = true; }
  };
  return { ...window.portfolioMedia, video, document, reduced, listeners, events,
    resolve: () => resolve(), reject: error => reject(error), count: () => playCount };
}
const settle = async () => { await new Promise(resolve => setImmediate(resolve)); };

test('duplicate playback requests share one pending promise', async () => {
  const x = setup(); x.play(x.video); x.play(x.video);
  assert.equal(x.count(), 1); x.resolve(); await settle(); assert.equal(x.video.paused, false);
});
test('a late play resolution cannot restart a dismissed preview', async () => {
  const x = setup(); x.play(x.video); x.pause(x.video); x.resolve(); await settle();
  assert.equal(x.video.paused, true);
});
test('a rapid return recovers after an interrupted play promise', async () => {
  const x = setup(); x.play(x.video); x.pause(x.video); x.play(x.video);
  x.reject({ name: 'AbortError' }); await settle(); assert.equal(x.count(), 2);
  x.resolve(); await settle(); assert.equal(x.video.paused, false);
});
test('hidden pages and reduced motion suppress playback', () => {
  const x = setup(); x.document.hidden = true; x.play(x.video); assert.equal(x.count(), 0);
  x.document.hidden = false; x.reduced.matches = true; x.play(x.video); assert.equal(x.count(), 0);
});
test('returning to a visible page resumes only requested videos', async () => {
  const x = setup(); x.play(x.video); x.resolve(); await settle();
  x.document.hidden = true; x.listeners.get('visibilitychange')(); assert.equal(x.video.paused, true);
  x.pause(x.video); x.document.hidden = false; x.listeners.get('visibilitychange')(); assert.equal(x.count(), 1);
});
