/* Decorative geometry only: project selection and playback stay in the existing map code. */
(() => {
  'use strict';
  const map = document.getElementById('explorer');
  const space = document.getElementById('project-space');
  const pattern = document.getElementById('map-pattern');
  if (!map || !space || !pattern) return;
  const globe = map.querySelector('#map-globe');
  if (globe) {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const playback = window.portfolioMotion;
    const coreCharge = globe.querySelector('#map-globe-charge');
    const rings = [...globe.querySelectorAll('[data-ring-axis]')].map(element => ({
      element,
      normal: element.dataset.ringAxis.split(' ').map(Number),
      radius: Number(element.getAttribute('rx'))
    }));
    const orbitFaces = [...globe.querySelectorAll('.map-orbit-face')];
    const orbits = [...globe.querySelectorAll('[data-orbit-tilt]')].map((element, index) => {
      const tilt = Number(element.dataset.orbitTilt) * Math.PI / 180;
      const radius = Number(element.getAttribute('rx'));
      const foreshortening = Number(element.getAttribute('ry')) / radius;
      const inclination = Math.sqrt(1 - foreshortening ** 2);
      const cos = Math.cos(tilt), sin = Math.sin(tilt);
      return {
        element, radius,
        normal: [sin * inclination, -cos * inclination, foreshortening],
        major: [cos, sin, 0],
        minor: [-sin * foreshortening, cos * foreshortening, inclination],
        front: orbitFaces[index].querySelector('path'),
        marker: orbitFaces[index].querySelector('circle')
      };
    });
    let inView = false;
    let frame = 0, last = 0, elapsed = 0;

    function rotation(yaw, pitch) {
      const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
      return ([x, y, z]) => {
        const nx = x * cosYaw + z * sinYaw;
        const depth = z * cosYaw - x * sinYaw;
        return [nx, y * cosPitch - depth * sinPitch, y * sinPitch + depth * cosPitch];
      };
    }

    function drawRing(element, radius, [nx, ny, nz]) {
      // An orbit viewed edge-on becomes a line. Its other radius stays constant.
      const tilt = Math.atan2(nx, -ny) * 180 / Math.PI;
      element.setAttribute('ry', Math.max(.55, Math.abs(nz) * radius).toFixed(2));
      element.setAttribute('transform', `rotate(${tilt.toFixed(2)} 120 111)`);
    }

    function drawGlobe() {
      const spin = rotation(elapsed * .34 + .42, .64 * Math.sin(elapsed * .32 + .6));
      for (const { element, normal, radius } of rings) {
        drawRing(element, radius, spin(normal));
      }
      // The markers gather smoothly, brighten the core, then return to orbit.
      const phase = ((elapsed + 4) % 10.8 - 6.4) / 3.4;
      const gather = Math.sin(Math.PI * Math.min(1, Math.max(0, phase))) ** 2;
      const inward = 1 - .96 * gather;
      const lightPhase = Math.min(1, Math.max(0, phase - .045));
      coreCharge.setAttribute('opacity', (.48 * Math.sin(Math.PI * lightPhase) ** 6).toFixed(3));
      orbits.forEach(({ element, radius, normal, major, minor, front, marker }, index) => {
        const orbitSpin = rotation(elapsed * (.17 + index * .025), .48 * Math.sin(elapsed * .27 + index * .85));
        const u = orbitSpin(major), v = orbitSpin(minor);
        drawRing(element, radius, orbitSpin(normal));

        // Trace the half nearest the viewer so it passes in front of the globe.
        const project = angle => {
          const a = radius * Math.cos(angle), b = radius * Math.sin(angle);
          return [120 + a * u[0] + b * v[0], 111 + a * u[1] + b * v[1], a * u[2] + b * v[2]];
        };
        const near = Math.atan2(v[2], u[2]) - Math.PI / 2;
        const arc = [];
        for (let step = 0; step <= 24; step++) {
          const [x, y] = project(near + step * Math.PI / 24);
          arc.push(`${step ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`);
        }
        front.setAttribute('d', arc.join(' '));
        const [x, y, z] = project(elapsed * (.47 - index * .065) + 1 + index * 1.9);
        marker.setAttribute('cx', (120 + (x - 120) * inward).toFixed(2));
        marker.setAttribute('cy', (111 + (y - 111) * inward).toFixed(2));
        const orbitalOpacity = .25 + .75 * Math.min(1, Math.max(0, .5 + z / 24));
        marker.setAttribute('opacity', (orbitalOpacity * (1 - .7 * gather ** 2)).toFixed(2));
      });
    }

    function tickGlobe(now) {
      elapsed += Math.min(.10, (now - last) / 1000);
      last = now;
      drawGlobe();
      frame = requestAnimationFrame(tickGlobe);
    }

    function syncGlobe() {
      const running = inView && playback.running && !preference.matches;
      if (running) {
        if (!frame) {
          last = performance.now();
          frame = requestAnimationFrame(tickGlobe);
        }
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    const globeVisibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncGlobe();
    });
    globeVisibility.observe(globe);
    playback.subscribe(syncGlobe);
    preference.addEventListener('change', syncGlobe);
    drawGlobe();
    syncGlobe();
  }
  const fields = [...map.querySelectorAll('.domain')];
  const namespace = 'http://www.w3.org/2000/svg';
  let pending = false;

  function element(tag, attributes) {
    const node = document.createElementNS(namespace, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function draw() {
    pending = false;
    const box = map.getBoundingClientRect();
    const stage = space.getBoundingClientRect();
    if (!box.width || !box.height || !stage.width) return;
    const cx = stage.left - box.left + stage.width / 2;
    const cy = stage.top - box.top + stage.height / 2;
    // Reserve the idle geometry: longer project descriptions must not inflate the rings.
    const minStageHeight = Math.min(320, parseFloat(getComputedStyle(space).minHeight) || 320);
    const radius = Math.min(stage.width * .78, box.width * .33, minStageHeight * .58);
    pattern.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const nodes = [];
    for (const scale of [1, .78, .54]) {
      nodes.push(element('circle', {cx, cy, r: radius * scale, class: scale === 1 ? 'pattern-ring pattern-outer' : 'pattern-ring'}));
    }
    for (const scale of [.32, .66]) {
      nodes.push(element('ellipse', {cx, cy, rx: radius * scale, ry: radius, class: 'pattern-mesh'}));
      nodes.push(element('ellipse', {cx, cy, rx: radius, ry: radius * scale, class: 'pattern-mesh'}));
    }
    const anchors = fields.map(field => {
      const rect = field.getBoundingClientRect();
      const x = rect.left - box.left + rect.width / 2;
      const y = rect.top - box.top + rect.height / 2;
      const angle = Math.atan2(y - cy, x - cx);
      const ax = cx + Math.cos(angle) * radius;
      const ay = cy + Math.sin(angle) * radius;
      nodes.push(element('path', {d: `M ${x} ${y} L ${ax} ${ay}`, class: 'pattern-link'}));
      nodes.push(element('path', {d: `M ${ax} ${ay} L ${cx} ${cy}`, class: 'pattern-mesh'}));
      return {x: ax, y: ay, angle};
    }).sort((a, b) => a.angle - b.angle);
    nodes.push(element('path', {d: anchors.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ') + ' Z', class: 'pattern-mesh'}));
    for (const point of anchors) nodes.push(element('circle', {cx: point.x, cy: point.y, r: 2.7, class: 'pattern-point'}));
    const size = Math.min(28, radius * .18);
    const cube = element('g', {class: 'pattern-cube'});
    cube.append(
      element('polygon', {points: `${cx},${cy-size} ${cx+size},${cy-size/2} ${cx},${cy} ${cx-size},${cy-size/2}`, class: 'cube-top'}),
      element('polygon', {points: `${cx-size},${cy-size/2} ${cx},${cy} ${cx},${cy+size} ${cx-size},${cy+size/2}`, class: 'cube-left'}),
      element('polygon', {points: `${cx},${cy} ${cx+size},${cy-size/2} ${cx+size},${cy+size/2} ${cx},${cy+size}`, class: 'cube-right'})
    );
    nodes.push(cube);
    pattern.replaceChildren(...nodes);
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(draw);
  }
  const observer = new ResizeObserver(schedule);
  observer.observe(map);
  observer.observe(space);
  if (document.fonts) document.fonts.ready.then(schedule);
  schedule();
})();
