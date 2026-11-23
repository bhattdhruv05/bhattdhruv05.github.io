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
  const motion = window.portfolioMotion;
  const media = window.portfolioMedia;
  const cards = new Map();
  const clips = new Map();
  const inspection = new Image();
  const inspectionPreview = new URL('assets/high-res/inspection-map.webp', document.baseURI).href;
  const inspectionFull = new URL('assets/high-res/inspection-bed-teal.webp', document.baseURI).href;
  let active = null, leaveTimer = 0, dismissTimer = 0, geometryFrame = 0;
  let keyboard = false, pinned = false, scrollFrame = 0, lastScroll = -Infinity;

  inspection.alt = 'Concept visualization of a terminal link beneath a scanner with three surrounding cameras';
  inspection.className = 'scan-map-image';
  inspection.decoding = 'async';
  inspection.fetchPriority = 'low';
  inspection.addEventListener('load', () => { inspection.dataset.ready = 'true'; });
  inspection.addEventListener('error', () => {
    if (inspection.src === inspectionPreview) inspection.src = inspectionFull;
  });

  function prepareInspection() {
    if (!inspection.hasAttribute('src') || (inspection.complete && !inspection.naturalWidth)) {
      inspection.src = inspectionPreview;
    }
  }

  function registerClip(src, poster, title) {
    const video = document.createElement('video');
    video.loop = true;
    video.dataset.src = src;
    video.dataset.poster = poster;
    video.setAttribute('aria-label', title);
    clips.set(src, video);
  }

  // Reuse each clip across fields and warm its metadata only when visitors reach the map.
  registerClip(entries.gripper.video, 'assets/high-res/gripper-cell.webp', 'Robot-cell pick-and-place simulation');
  registerClip(entries.gripper.mechanismVideo, 'assets/high-res/gripper-mechanism.webp', 'Three-jaw gripper mechanism animation');
  registerClip(entries.cam.video, 'assets/high-res/gearbox-cam.webp', 'Gearbox housing CAM simulation');
  if (!navigator.connection?.saveData) {
    const inspectNearby = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      prepareInspection();
      inspectNearby.disconnect();
    }, { rootMargin: '180px 0px' });
    inspectNearby.observe(map);

    const nearby = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      clips.forEach(media.prepare);
      nearby.disconnect();
    });
    nearby.observe(map);
  }

  function pause() {
    space.querySelectorAll('video').forEach(media.pause);
    space.dataset.motionVisible = 'false';
  }

  function play() {
    if (!active || document.hidden || space.classList.contains('is-leaving')) return;
    const visible = [...space.querySelectorAll('.square')].some(visual => {
      const rect = visual.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    });
    if (!visible) { pause(); return; }
    space.dataset.motionVisible = 'true';
    space.querySelectorAll('video').forEach(media.play);
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
      pinned = false;
      space.replaceChildren();
      space.classList.remove('visible', 'is-leaving');
      map.classList.remove('has-selection');
      fields.forEach(f => f.setAttribute('aria-expanded', 'false'));
      status.textContent = '';
      scheduleDraw();
    };
    if (immediate || !motion.enabled) finish();
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
    const analytics = key === 'data' && id === 'gripper';
    const scene = { iep: 'fatigue', assembly: 'assembly', irp: 'copper' }[id];
    if (id === 'ifs') window.mountFemVisual(square);
    else if (scene) {
      if (scene === 'assembly') square.classList.add('square--assembly');
      square.append(window.portfolioScenes.preview(scene));
    } else if (id === 'elmex') {
      square.classList.add('scan-visual');
      const frame = document.createElement('span');
      frame.className = 'scan-frame';
      const beam = document.createElement('span');
      beam.className = 'scan-beam';
      beam.setAttribute('aria-hidden', 'true');
      frame.append(beam);
      square.append(frame);
    } else if (data.video) {
      if (id === 'gripper' && key !== 'mechanical') square.classList.add('square--cell');
      square.dataset.mapClip = key === 'mechanical' && id === 'gripper' ? data.mechanismVideo : data.video;
      const error = document.createElement('div');
      error.className = 'media-error';
      error.hidden = true;
      if (analytics) {
        const metrics = document.createElement('div');
        metrics.className = 'energy-preview';
        metrics.innerHTML = `
          <p>Energy model · R²</p>
          <dl>
            <div><dt>Random</dt><dd>0.92</dd></div>
            <div><dt>Chronological</dt><dd>0.50</dd></div>
          </dl>`;
        square.append(metrics);
      }
      square.append(error);
    }
    const copy = document.createElement('div');
    copy.className = 'card-copy';
    const title = document.createElement('h2');
    title.textContent = analytics ? 'Data Analytics for Robotic Arm' : data.title;
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
    const scanFrame = space.querySelector('.scan-frame');
    if (scanFrame) {
      inspection.fetchPriority = 'high';
      scanFrame.prepend(inspection);
      prepareInspection();
    }
    space.querySelectorAll('[data-map-clip]').forEach(square => {
      const clip = clips.get(square.dataset.mapClip);
      if (!clip.poster) clip.poster = clip.dataset.poster;
      square.prepend(clip);
    });
    space.dispatchEvent(new Event('portfolio:previews', { bubbles: true }));
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
      // pointerenter commonly reports zero movement, including on real mice.
      if (event.pointerType !== 'touch' && performance.now() - lastScroll > 140) {
        keyboard = false;
        if (active !== field.dataset.field) pinned = false;
        select(field.dataset.field);
      }
    });
    field.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      keyboard = false;
      if (active !== field.dataset.field || space.classList.contains('is-leaving')) { pinned = false; select(field.dataset.field); }
      else keepVisible();
    });
    field.addEventListener('focus', () => { if (keyboard) { pinned = true; select(field.dataset.field); } });
    field.addEventListener('click', () => { pinned = true; select(field.dataset.field); });
  });
  map.addEventListener('pointerenter', () => { keepVisible(); play(); });
  map.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || pinned || map.contains(document.activeElement) && keyboard) return;
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
  // One check per animation frame; no repeated layout reads on every scroll event.
  window.addEventListener('scroll', () => {
    lastScroll = performance.now();
    if (!active || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const rect = map.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight) hide(true);
      else play();
    });
  }, { passive: true });
  motion.subscribe(() => {
    if (motion.running) play();
    else pause();
  });
  window.addEventListener('pageshow', () => { scheduleDraw(); play(); });
  window.addEventListener('pagehide', pause);
  new ResizeObserver(scheduleDraw).observe(map);
  if (document.fonts) document.fonts.ready.then(scheduleDraw);
})();
