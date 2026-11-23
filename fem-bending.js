(() => {
  'use strict';

  const W = 600, H = 340;
  const sheetDepth = 88;
  const phases = [
    { label: 'Tool approach', angle: 0, start: 0, end: .42, from: 0 },
    { label: 'Tool bend', angle: 38, start: .42, end: 1.65, from: 0 },
    { label: 'Springback', angle: 31, start: 2, end: 2.8, from: 38 },
    { label: 'Corrected tool bend', angle: 45, start: 3.8, end: 5.1, from: 31 },
    { label: 'Unloading', angle: 38, start: 5.5, end: 6.5, from: 45 },
    { label: 'Final angle', angle: 38, start: 6.5, end: 8, from: 38 },
    { label: 'Reset', angle: 0, start: 8, end: 9, from: 38 }
  ];
  const motion = window.portfolioMotion;
  const scenes = new WeakMap();
  const visible = new Set();
  let frame = 0, last = 0;

  const smoothStep = value => {
    const p = Math.min(1, Math.max(0, value));
    return p * p * (3 - 2 * p);
  };

  function drawRobot(ctx, { face, line, box, project }, bend, time) {
    const chassis = ['#c4c8bd', '#959f95', '#6e807a'];
    const housing = ['#74918a', '#496b65', '#355550'];
    const shoulder = [280, 54];
    const parked = [225, 107];
    const armDepth = -48;
    const upper = 103, lower = 94;
    const engagement = smoothStep(time / .42) * (1 - smoothStep((time - 1.65) / .35))
      + smoothStep((time - 3.14) / .66) * (1 - smoothStep((time - 5.1) / .4));
    const roller = [
      176 * Math.cos(bend) + 8 * Math.sin(bend),
      176 * Math.sin(bend) - 8 * Math.cos(bend)
    ];
    const wrist = parked.map((axis, i) => axis + (roller[i] - axis) * engagement);
    const delta = wrist.map((axis, i) => axis - shoulder[i]);
    const distance = Math.hypot(...delta);
    const along = (upper ** 2 - lower ** 2 + distance ** 2) / (2 * distance);
    const outward = Math.sqrt(Math.max(0, upper ** 2 - along ** 2));
    const [dx,dy] = delta.map(axis => axis / distance);
    const elbow = [shoulder[0] + dx * along + dy * outward, shoulder[1] + dy * along - dx * outward];

    box(250, -36, -67, 71, 14, 55, housing);
    box(259, -22, -62, 53, 41, 45, chassis);
    box(269, 19, -58, 28, 35, 36, housing);

    function armLink(a, b, thickness) {
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const normal = [-(b[1]-a[1])/length, (b[0]-a[0])/length];
      const edge = (point, offset, z) => [
        point[0] + normal[0] * offset, point[1] + normal[1] * offset, z
      ];
      const front = armDepth + 19, back = armDepth - 5;
      face([edge(a,thickness,back), edge(b,thickness*.7,back), edge(b,thickness*.7,front),
        edge(a,thickness,front)], '#e1e1d1', '#65766e');
      face([edge(a,-thickness,front), edge(b,-thickness*.7,front), edge(b,thickness*.7,front),
        edge(a,thickness,front)], '#a3b0a6', '#65766e');
      line([edge(a,thickness*.4,front),edge(b,thickness*.3,front)], '#dfe3d2', 1.5);
    }

    function joint(point, radius, z = armDepth + 22) {
      const [x,y] = project([...point,z]);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#43615b';
      ctx.fill();
      ctx.strokeStyle = '#294942';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, radius * .57, 0, Math.PI * 2);
      ctx.fillStyle = '#bdc9bc';
      ctx.fill();
    }

    armLink(shoulder, elbow, 15);
    armLink(elbow, wrist, 12);
    joint(shoulder, 18);
    joint(elbow, 14);
    joint(wrist, 10);

    // The tool projects forward from the wrist to meet the underside of the sheet.
    box(wrist[0]-7, wrist[1]-7, armDepth+22, 14, 14, 49, housing);
    joint(wrist, 8, 23);
  }

  function draw(canvas, state) {
    const ctx = canvas.getContext('2d');
    const t = state.elapsed % 9;
    const phase = phases.findLast(item => t >= item.start);
    const progress = Math.min(1, (t - phase.start) / (phase.end - phase.start));
    const smooth = smoothStep(progress);
    const angle = phase.from + (phase.angle - phase.from) * smooth;
    const bend = angle * Math.PI / 180;
    const target = 38 * Math.PI / 180;
    const graphics = window.portfolioProjection(ctx, 204, 247, 1);

    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const { face, line, box } = graphics;
    face([[-180,-37,-95],[310,-37,-95],[310,-37,115],[-180,-37,115]], '#e7dac4');
    for (let x = -175; x <= 305; x += 24) line([[x,-37,-95],[x,-37,115]], '#cdbda4');
    for (let z = -91; z <= 115; z += 23) line([[-180,-37,z],[310,-37,z]], '#cdbda4');

    drawRobot(ctx, graphics, bend, t);

    box(-125, -36, -42, 143, 21, 132, ['#779594','#476a6a','#315354']);
    box(-113, -15, -20, 112, 15, 106, ['#b7c1ae','#5e7c77','#3d5752']);
    box(-92, 0, -8, 92, 5, sheetDepth, ['#ffcc98','#b65d26','#843d24']);
    box(-111, 5, -21, 75, 24, 109, ['#90a8a0','#476764','#355353']);

    const length = 225;
    const sheetEnd = (radians, z, across = 0) => [length * Math.cos(radians), across + length * Math.sin(radians), z];
    const back = -8, front = back + sheetDepth;
    const outline = [ [0,0,back], sheetEnd(target,back), sheetEnd(target,front), [0,0,front], [0,0,back] ];
    ctx.save();
    ctx.setLineDash([6,5]);
    line(outline, '#486d69', 2);
    ctx.restore();

    face([[0,0,front], sheetEnd(bend,front), sheetEnd(bend,front,5), [0,5,front]], '#aa5124', '#894620');
    face([sheetEnd(bend,back), sheetEnd(bend,front), sheetEnd(bend,front,5), sheetEnd(bend,back,5)], '#c06d39', '#894620');
    face([[0,5,back], sheetEnd(bend,back,5), sheetEnd(bend,front,5), [0,5,front]], '#f2ad73', '#894620');

    for (let n = 1; n < 9; n++) {
      const x = length * (n / 9) * Math.cos(bend);
      const y = length * (n / 9) * Math.sin(bend) + 5;
      line([[x,y,back],[x,y,front]], '#915b375e');
    }
    for (let z = 3; z < front; z += 12) line([[0,5,z],sheetEnd(bend,z,5)], '#915b375e');

    const value = Math.round(angle);
    if (state.phase !== phase.label || state.angle !== value) {
      state.phase = phase.label;
      state.angle = value;
      state.label.textContent = phase.label;
      state.value.textContent = value + '°';
    }
  }

  function size(canvas) {
    const { width, height } = window.portfolioCanvasSize(canvas);
    if (!width || !height || (canvas.width === width && canvas.height === height)) return;
    canvas.width = width;
    canvas.height = height;
    draw(canvas, scenes.get(canvas));
  }

  function tick(now) {
    const delta = Math.min(.05, Math.max(0, (now - last) / 1000));
    last = now;
    for (const canvas of visible) {
      const state = scenes.get(canvas);
      state.elapsed += delta;
      draw(canvas, state);
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (motion.running && visible.size) {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  const visibility = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) visible.add(target);
      else visible.delete(target);
    }
    sync();
  }, { threshold: .12 });
  const resize = new ResizeObserver(entries => entries.forEach(({ target }) => size(target)));
  motion.subscribe(sync);

  function mount(root) {
    root.classList.add('fem-visual');
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', 'Illustrative 3D robotic arm bending a clamped sheet. The arm withdraws after a 38-degree bend and the sheet relaxes to 31 degrees. A corrected 45-degree bend reaches 38 degrees after unloading.');
    root.innerHTML = `
      <div class="fem-caption" aria-hidden="true"><span>Robotic sheet-metal bending</span><span>Target 38°</span></div>
      <canvas class="fem-canvas" width="600" height="340" aria-hidden="true"></canvas>
      <div class="fem-readout" aria-hidden="true"><span>Tool approach</span><strong>0°</strong></div>`;
    const canvas = root.querySelector('canvas');
    const [label, value] = root.querySelector('.fem-readout').children;
    const state = { elapsed: 0, label, value };
    scenes.set(canvas, state);
    size(canvas);
    draw(canvas, state);
    resize.observe(canvas);
    visibility.observe(canvas);
  }

  window.mountFemVisual = mount;
  document.querySelectorAll('.fem-visual').forEach(mount);
})();
