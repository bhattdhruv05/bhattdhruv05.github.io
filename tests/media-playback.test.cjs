const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
function setup({ reduce = false, storageFails = false, savedPause = false } = {}) {
  const listeners = new Map(), values = new Map(savedPause ? [['portfolio-motion','off']] : []);
  const reduced = { matches: reduce, addEventListener: (type, fn) => listeners.set('reduced', fn) };
  const document = { hidden: false, documentElement: { dataset: {} }, querySelectorAll: () => [], createElement: () => ({}), addEventListener: (type, fn) => listeners.set(type, fn) };
  const window = { addEventListener: (type, fn) => listeners.set(type, fn) };
  const localStorage = { getItem: key => { if(storageFails) throw Error('Storage unavailable'); return values.get(key) ?? null; }, setItem: (key,value) => { if(storageFails) throw Error('Storage unavailable'); values.set(key,value); } };
  vm.runInNewContext(readFileSync(require.resolve('../media-playback.js'), 'utf8'), { window, document, matchMedia: () => reduced, localStorage, Promise });
  const events = new Map(); let resolve, reject, playCount = 0;
  const video = { paused: true, readyState: 1, isConnected: true,
    setAttribute() {}, addEventListener(type, fn) { events.set(type, fn); },
    play() { playCount++; return new Promise((yes,no) => { resolve = () => { this.paused = false; yes(); }; reject = no; }); },
    pause() { this.paused = true; }
  };
  return { ...window.portfolioMedia, motion: window.portfolioMotion, video, document, reduced, listeners, events, resolve: () => resolve(), reject: error => reject(error), count: () => playCount };
}
const settle = async () => { await new Promise(resolve => setImmediate(resolve)); };
test('duplicate playback requests share one pending promise', async () => {
  const x=setup(); x.play(x.video);x.play(x.video);assert.equal(x.count(),1);x.resolve();await settle();assert.equal(x.video.paused,false);
});
test('a late resolution cannot restart a dismissed preview', async () => {
  const x=setup();x.play(x.video);x.pause(x.video);x.resolve();await settle();assert.equal(x.video.paused,true);
});
test('rapid field switching recovers an interrupted promise', async () => {
  const x=setup();x.play(x.video);x.pause(x.video);x.play(x.video);x.reject({name:'AbortError'});await settle();assert.equal(x.count(),2);x.resolve();await settle();assert.equal(x.video.paused,false);
});
test('system reduced motion cannot silently disable interactive previews', async () => {
  const x=setup({reduce:true});x.play(x.video);assert.equal(x.count(),1);x.resolve();await settle();assert.equal(x.video.paused,false);x.motion.setEnabled(false);assert.equal(x.video.paused,true);x.motion.setEnabled(true);assert.equal(x.count(),2);
});
test('Play/Pause works when browser storage is unavailable', async () => {
  const x=setup({storageFails:true});x.play(x.video);x.resolve();await settle();x.motion.setEnabled(false);assert.equal(x.video.paused,true);x.motion.setEnabled(true);assert.equal(x.count(),2);
});
test('rapid global Pause/Play recovers a pending request', async () => {
  const x=setup();x.play(x.video);x.motion.setEnabled(false);x.motion.setEnabled(true);x.reject({name:'AbortError'});await settle();assert.equal(x.count(),2);x.resolve();await settle();assert.equal(x.video.paused,false);
});
test('page visibility resumes only requested and connected videos', async () => {
  const x=setup();x.play(x.video);x.resolve();await settle();x.document.hidden=true;x.listeners.get('visibilitychange')();assert.equal(x.video.paused,true);x.pause(x.video);x.document.hidden=false;x.listeners.get('visibilitychange')();assert.equal(x.count(),1);
});
test('BFCache page restoration resumes an active preview', async () => {
  const x=setup();x.play(x.video);x.resolve();await settle();x.listeners.get('pagehide')();assert.equal(x.video.paused,true);x.listeners.get('pageshow')();assert.equal(x.count(),2);
});

test('obsolete saved Pause does not suppress automatic playback', async () => {
  const x=setup({savedPause:true});x.play(x.video);assert.equal(x.count(),1);x.resolve();await settle();assert.equal(x.video.paused,false);
});
test('an isolated browser AbortError gets one automatic recovery', async () => {
  const x=setup();x.play(x.video);x.reject({name:'AbortError'});await settle();assert.equal(x.count(),2);x.resolve();await settle();assert.equal(x.video.paused,false);
});
test('repeated AbortErrors stop retrying instead of spinning', async () => {
  const x=setup();x.play(x.video);x.reject({name:'AbortError'});await settle();x.reject({name:'AbortError'});await settle();assert.equal(x.count(),2);
});
