/* Automatic, visibility-aware playback for both portfolio pages. */
(() => {
  'use strict';
  const subscribers = new Set();
  let pageVisible = !document.hidden;
  // Start every visit automatically, including visitors who paused an older build.
  // Playback only suspends while the page or an individual preview is hidden.
  let enabled = true;

  function publish() {
    document.documentElement.dataset.motionEnabled = String(enabled);
    document.documentElement.dataset.pageVisible = String(pageVisible && !document.hidden);
    subscribers.forEach(listener => listener());
  }
  const motion = window.portfolioMotion = {
    get enabled() { return enabled; },
    get running() { return enabled && pageVisible && !document.hidden; },
    setEnabled(value) {
      enabled = Boolean(value);
      publish();
    },
    subscribe(listener) { subscribers.add(listener); return () => subscribers.delete(listener); }
  };
  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; publish(); });
  window.addEventListener('pagehide', () => { pageVisible = false; publish(); });
  window.addEventListener('pageshow', () => { pageVisible = true; publish(); });
  publish();

  // Warm the other document on navigation intent without blocking the click.
  const prefetched = new Set();
  document.querySelectorAll('a[href]').forEach(link => {
    const warm = () => {
      if (navigator.connection?.saveData) return;
      const target = new URL(link.href, location.href);
      if (target.origin !== location.origin || target.pathname === location.pathname || prefetched.has(target.pathname)) return;
      if (!target.pathname.endsWith('/')) return;
      prefetched.add(target.pathname);
      const hint = document.createElement('link');
      hint.rel = 'prefetch';
      hint.href = target.origin + target.pathname;
      document.head.appendChild(hint);
    };
    link.addEventListener('pointerenter', warm, { once: true });
    link.addEventListener('focus', warm, { once: true });
  });

  const states = new Map();
  function feedback(video, message = '') {
    const element = video.parentElement?.querySelector('.media-error');
    if (!element) return;
    element.hidden = !message;
    if (!message) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'media-retry';
    button.textContent = 'Play preview';
    button.setAttribute('aria-label', 'Play ' + (video.getAttribute('aria-label') || 'project preview'));
    button.addEventListener('click', event => {
      event.stopPropagation();
      const state = register(video);
      state.blocked = false;
      motion.setEnabled(true);
      if (video.error) video.load();
      play(video);
    });
    element.replaceChildren(button);
  }
  function register(video) {
    if (states.has(video)) return states.get(video);
    const state = { wanted: false, pending: false, generation: 0, blocked: false, abortRetries: 0 };
    states.set(video, state);
    video.muted = video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.addEventListener('playing', () => { state.abortRetries = 0; feedback(video); });
    video.addEventListener('error', () => { if (state.wanted) feedback(video, 'retry'); });
    for (const event of ['loadeddata', 'canplay']) {
      video.addEventListener(event, () => attempt(video, state));
    }
    return state;
  }

  function prepare(video, src) {
    register(video);
    video.preload = navigator.connection?.saveData ? 'metadata' : 'auto';
    if (src) video.src = src;
    return video;
  }

  function attempt(video, state) {
    if (!state.wanted || state.pending || state.blocked || !motion.running || !video.isConnected) return;
    if (!video.paused && video.readyState >= 2) return;
    state.pending = true;
    const generation = state.generation;
    let result;
    try { result = video.play(); } catch (error) { result = Promise.reject(error); }
    Promise.resolve(result).then(() => {
      if (!state.wanted || !motion.running || !video.isConnected) video.pause();
      else feedback(video);
    }).catch(error => {
      if (generation !== state.generation || !state.wanted || !video.isConnected) return;
      if (error.name === 'AbortError') {
        // A browser may interrupt play without a field switch. Recover once;
        // persistent failures expose the local retry control instead of looping.
        if (state.abortRetries++ > 0) { state.blocked = true; feedback(video, 'retry'); }
      } else {
        state.blocked = true;
        feedback(video, 'retry');
      }
    }).finally(() => {
      state.pending = false;
      if (state.wanted && (generation !== state.generation || state.abortRetries === 1)) attempt(video, state);
    });
  }
  function play(video) {
    const state = register(video);
    if (!state.wanted) {
      state.generation++;
      state.abortRetries = 0;
      state.blocked = false;
    }
    state.wanted = true;
    if (video.error) {
      feedback(video, 'retry');
      return;
    }
    attempt(video, state);
  }
  function pause(video) {
    const state = states.get(video);
    if (state) { state.wanted = false; state.generation++; }
    video.pause();
  }
  window.portfolioMedia = { prepare, play, pause };
  motion.subscribe(() => states.forEach((state, video) => {
    if (!motion.running || !state.wanted || !video.isConnected) { state.generation++; video.pause(); }
    else { state.blocked = false; attempt(video, state); }
  }));

  const media = [...document.querySelectorAll('.project-media')];
  function setVisible(root, visible) {
    root.dataset.motionVisible = String(visible);
    root.querySelectorAll('video').forEach(visible ? play : pause);
  }
  media.forEach(root => {
    const video = root.querySelector('video');
    if (!video) return;
    const error = document.createElement('div');
    error.className = 'media-error';
    error.hidden = true;
    root.appendChild(error);
    prepare(video);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setVisible(entry.target, entry.isIntersecting));
    }, { rootMargin: '80px 0px' });
    media.forEach(root => { setVisible(root, false); observer.observe(root); });
  } else media.forEach(root => setVisible(root, true));
})();
