/* Decorative geometry only: project selection and playback stay in the existing map code. */
(() => {
  'use strict';
  const map = document.getElementById('explorer');
  const space = document.getElementById('project-space');
  const pattern = document.getElementById('map-pattern');
  if (!map || !space || !pattern) return;
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
    const radius = Math.min(stage.width * .78, box.width * .33, stage.height * .58);
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
