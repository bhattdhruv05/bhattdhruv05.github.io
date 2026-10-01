/* Muted previews: explicit playback, visibility control and recovery after interruption. */
(() => {
  'use strict';
  const states = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function note(video, message) {
    const element = video.parentElement?.querySelector('.media-error');
    if (!element) return;
    if (message) element.textContent = message;
    element.hidden = !message;
  }

  function register(video) {
    if (states.has(video)) return states.get(video);
    const state = { wanted: false, pending: false, generation: 0 };
    states.set(video, state);
    video.muted = video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.addEventListener('playing', () => note(video));
    for (const event of ['loadeddata', 'canplay']) {
      video.addEventListener(event, () => attempt(video, state));
    }
    return state;
  }

  function attempt(video, state) {
    if (!state.wanted || state.pending || document.hidden || reduced.matches || !video.isConnected) return;
    if (!video.paused && video.readyState >= 2) return;
    const generation = state.generation;
    state.pending = true;
    video.muted = true;
    let playback;
    try { playback = video.play(); }
    catch (error) { playback = Promise.reject(error); }
    Promise.resolve(playback).then(() => {
      if (!state.wanted || document.hidden || reduced.matches) video.pause();
      else note(video);
    }).catch(error => {
      if (generation !== state.generation || !state.wanted || !video.isConnected) return;
      if (error.name !== 'AbortError') note(video, 'Tap the animation to start playback.');
    }).finally(() => {
      state.pending = false;
      // A rapid field switch can interrupt an earlier play promise. Retry only
      // after that transition has settled, never in a rejected-play loop.
      if (generation !== state.generation && state.wanted) attempt(video, state);
    });
  }

  function play(video) {
    const state = register(video);
    if (!state.wanted) state.generation++;
    state.wanted = true;
    attempt(video, state);
  }

  function pause(video) {
    const state = register(video);
    state.wanted = false;
    state.generation++;
    video.pause();
  }
  window.portfolioMedia = { play, pause };

  const media = [...document.querySelectorAll('.project-media')];
  function setVisible(root, visible) {
    root.dataset.motionVisible = String(visible);
    root.querySelectorAll('video').forEach(video => visible ? play(video) : pause(video));
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setVisible(entry.target, entry.isIntersecting));
    }, { threshold: 0, rootMargin: '40px 0px' });
    media.forEach(root => {
      setVisible(root, false);
      observer.observe(root);
    });
  } else media.forEach(root => setVisible(root, true));

  media.forEach(root => {
    if (!root.querySelector('video')) return;
    const error = document.createElement('div');
    error.className = 'media-error';
    error.hidden = true;
    root.appendChild(error);
    root.addEventListener('click', () => root.querySelectorAll('video').forEach(play));
  });
  function sync() {
    states.forEach((state, video) => {
      if (document.hidden || reduced.matches) video.pause();
      else attempt(video, state);
    });
  }
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', () => states.forEach((_, video) => video.pause()));
  reduced.addEventListener('change', sync);
})();
