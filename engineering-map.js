/* One owner for selection, dismissal and the lifecycle of map previews. */
(() => {
  'use strict';
  const map = document.getElementById('explorer');
  const space = document.getElementById('project-space');
  const wires = document.getElementById('connections');
  const status = document.getElementById('map-status');
  if (!map || !space || !window.portfolioMapData) return;
  const { entries, groups, scopes } = window.portfolioMapData;
  const fields = [...map.querySelectorAll('[data-field]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = new Map();
  let active = null, leaveTimer = 0, dismissTimer = 0, geometryFrame = 0;
  let pointer = null, inView = true, keyboard = false, scrollFrame = 0;

  function pause() {
    space.querySelectorAll('video').forEach(window.portfolioMedia.pause);
    window.portfolioAnimations.pause();
    space.dataset.motionVisible = 'false';
  }

  function play() {
    if (!active || document.hidden || !inView || space.classList.contains('is-leaving')) return;
    space.dataset.motionVisible = String(!reduced.matches);
    window.portfolioAnimations.play();
    space.querySelectorAll('video').forEach(window.portfolioMedia.play);
  }

  function draw() {
    geometryFrame = 0;
    wires.replaceChildren();
    if (!active) return;
    const box = map.getBoundingClientRect(), stage = space.getBoundingClientRect();
    const field = fields.find(f => f.dataset.field === active).getBoundingClientRect();
    const x = field.left - box.left + field.width / 2, y = field.top - box.top + field.height / 2;
    const cx = stage.left - box.left + stage.width / 2, cy = stage.top - box.top + stage.height / 2;
    wires.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x} ${y} C ${x + (cx - x) * .4} ${y}, ${cx} ${cy}, ${cx} ${cy}`);
    wires.appendChild(path);
  }
  function scheduleDraw() {
    if (!geometryFrame) geometryFrame = requestAnimationFrame(draw);
  }
  function keepVisible() {
    clearTimeout(leaveTimer);
    clearTimeout(dismissTimer);
    space.classList.remove('is-leaving');
  }
  function hide(immediate = false) {
    clearTimeout(leaveTimer);
    clearTimeout(dismissTimer);
    if (!active) return;
    pause();
    const finish = () => {
      active = null;
      space.replaceChildren();
      space.classList.remove('visible', 'is-leaving');
      map.classList.remove('has-selection');
      fields.forEach(f => f.setAttribute('aria-expanded', 'false'));
      status.textContent = '';
      scheduleDraw();
    };
    if (immediate || reduced.matches) finish();
    else {
      space.classList.add('is-leaving');
      dismissTimer = setTimeout(finish, 150);
    }
  }

  function makeCard(key, id) {
    const data = entries[id];
    const card = document.createElement('article');
    card.className = 'preview-card';
    const square = document.createElement('div');
    square.className = 'square';
    const animation = key === 'data' && id === 'gripper' ? 'analytics' : id === 'irp' ? 'copper' : id === 'iep' ? 'fatigue' : null;
    if (id === 'ifs') window.mountFemVisual(square);
    else if (id === 'elmex') {
      square.classList.add('scan-visual');
      const frame = document.createElement('span');
      frame.className = 'scan-frame';
      const img = document.createElement('img');
      img.src = 'elmex/inspection-bed.webp';
      img.alt = 'Concept visualization of a terminal link beneath a scanner with three surrounding cameras';
      img.decoding = 'async';
      const beam = document.createElement('span');
      beam.className = 'scan-beam';
      beam.setAttribute('aria-hidden', 'true');
      frame.append(img, beam);
      square.append(frame);
    } else if (animation) {
      const canvas = document.createElement('canvas');
      canvas.className = 'concept-animation';
      canvas.dataset.animation = animation;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', animation === 'analytics'
        ? 'Reported robotic arm energy model R squared: random split 0.92, chronological split 0.50'
        : animation === 'copper' ? 'Measured versus fitted notch support factors for four copper alloy specimens; model R squared 0.953'
        : 'Illustrative moving load signal on a graph');
      square.append(canvas);
    } else if (data.video) {
      const video = document.createElement('video');
      // Fetch media only when its field is selected. Reuse the node on return.
      video.src = key === 'mechanical' && id === 'gripper' ? data.mechanismVideo : data.video;
      video.muted = video.defaultMuted = video.loop = video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', id === 'assembly' ? 'Illustrative spring assembly sequence over the final CAD rendering' : data.title + ' simulation');
      video.poster = id === 'assembly' ? data.image : id === 'cam' ? 'mcd/assets/cam-poster-v2.jpg' : key === 'mechanical' ? 'mcd/assets/mechanism-poster.jpg' : 'mcd/assets/gripper-poster-v2.jpg';
      const error = document.createElement('div');
      error.className = 'media-error';
      error.hidden = true;
      video.addEventListener('error', () => {
        error.textContent = 'Preview unavailable. The full project is still available below.';
        error.hidden = false;
      });
      square.append(video, error);
    }
    const copy = document.createElement('div');
    copy.className = 'card-copy';
    const title = document.createElement('h2');
    title.textContent = key === 'data' && id === 'gripper' ? 'Data Analytics for Robotic Arm' : data.title;
    const description = document.createElement('p');
    description.textContent = scopes[key][id];
    const link = document.createElement('a');
    link.className = 'explore';
    link.href = 'projects/#' + encodeURIComponent(id);
    link.textContent = 'Explore project ↗';
    link.setAttribute('aria-label', 'Explore ' + title.textContent);
    copy.append(title, description, link);
    card.append(square, copy);
    return card;
  }

  function select(key) {
    if (!groups[key]) return;
    keepVisible();
    if (active === key) { play(); return; }
    pause();
    active = key;
    if (!cards.has(key)) cards.set(key, groups[key].map(id => makeCard(key, id)));
    space.replaceChildren(...cards.get(key));
    space.classList.add('visible');
    map.classList.add('has-selection');
    fields.forEach(f => f.setAttribute('aria-expanded', String(f.dataset.field === key)));
    const field = fields.find(f => f.dataset.field === key);
    status.textContent = field.querySelector('strong').textContent + ': ' + groups[key].length + ' related projects.';
    scheduleDraw();
    play();
  }

  fields.forEach(field => {
    field.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && (event.movementX || event.movementY)) {
        keyboard = false;
        select(field.dataset.field);
      }
    });
    field.addEventListener('pointermove', event => {
      // A stationary cursor must not select fields that move beneath it on scroll.
      if (event.pointerType === 'mouse' && (!pointer || pointer.x !== event.clientX || pointer.y !== event.clientY)) {
        keyboard = false;
        if (active !== field.dataset.field || space.classList.contains('is-leaving')) select(field.dataset.field);
        else keepVisible();
      }
    });
    field.addEventListener('focus', () => { if (keyboard) select(field.dataset.field); });
    field.addEventListener('click', () => select(field.dataset.field));
  });
  document.addEventListener('pointermove', event => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
  map.addEventListener('pointerenter', () => { keepVisible(); play(); });
  map.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || map.contains(document.activeElement) && keyboard) return;
    leaveTimer = setTimeout(() => hide(), 220);
  });
  map.addEventListener('focusout', () => {
    queueMicrotask(() => { if (keyboard && !map.contains(document.activeElement)) hide(); });
  });
  document.addEventListener('pointerdown', event => {
    keyboard = false;
    if (!map.contains(event.target)) hide();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') keyboard = true;
    if (event.key === 'Escape' && active) {
      const field = fields.find(f => f.dataset.field === active);
      if (space.contains(document.activeElement)) field.focus({ preventScroll: true });
      hide(true);
    }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) hide(true);
    }).observe(map);
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) play();
      else pause();
    }).observe(space);
  }
  // One check per animation frame; no repeated layout reads on every scroll event.
  window.addEventListener('scroll', () => {
    if (!active || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const rect = map.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight) hide(true);
    });
  }, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());
  window.addEventListener('pageshow', () => { scheduleDraw(); play(); });
  window.addEventListener('pagehide', pause);
  reduced.addEventListener('change', () => { pause(); play(); });
  new ResizeObserver(scheduleDraw).observe(map);
  if (document.fonts) document.fonts.ready.then(scheduleDraw);
})();
