(() => {
  'use strict';

  const motion = window.portfolioMotion;
  const W = 600, H = 594;
  const times = new WeakMap();
  const sizes = new WeakMap();
  const visible = new Set();
  let frame = 0, last = 0;
  const previewHeight = 340;

  const ink = '#193c41';
  const muted = '#44605d';
  const grid = '#beaf97';
  const accent = '#aa4211';

  function label(ctx, value, x, y, size = 19, color = ink) {
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px "Space Grotesk",system-ui,sans-serif`;
    ctx.fillText(value, x, y);
  }

  function stroke(ctx, points, color, width = 2) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function startPlate(ctx) {
    ctx.fillStyle = '#fbf0dc';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ecdec6';
    ctx.fillRect(0, 0, W, 272);
    ctx.fillStyle = '#c9b89f';
    ctx.fillRect(0, 271, W, 1);
  }

  function copperSpecimen(ctx, t, compact) {
    const { face, project } = window.portfolioProjection(ctx, 290, 143, 1.03);
    const phase = (t % 3.6) / 3.6;
    const load = (1 - Math.cos(phase * Math.PI * 2)) / 2;
    ctx.fillStyle = '#76563921';
    ctx.beginPath();
    ctx.ellipse(306, 202, 196, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Schematic round coupon with a circumferential notch.
    const profile = [[-190,38],[-133,38],[-116,28],[-25,28],[-12,24],[-5,17],[5,17],[12,24],[25,28],[111,28],[128,38],[176,38]];
    const segments = 24;
    const point = (x, radius, i) => {
      const a = i / segments * Math.PI * 2;
      return [x, radius * Math.cos(a), radius * Math.sin(a)];
    };
    const surfaces = [];
    profile.slice(1).forEach(([x, radius], section) => {
      const [px, pr] = profile[section];
      for (let i = 0; i < segments; i++) {
        const points = [point(px,pr,i),point(x,radius,i),point(x,radius,i+1),point(px,pr,i+1)];
        const theta = (i + .5) / segments * Math.PI * 2;
        const brightness = .48 + .36 * Math.cos(theta - .45);
        const notch = section >= 4 && section <= 6;
        const hue = notch ? 26 - 15 * load : 26;
        const lightness = 36 + 40 * brightness - (notch ? 10 * load : 0);
        const color = `hsl(${hue} ${notch ? 62 + 17 * load : 62}% ${lightness}%)`;
        const depth = points.reduce((sum, [a,y,z]) => sum - a * .54 + y * .34 + z, 0);
        surfaces.push({ points, color, depth });
      }
    });
    surfaces.sort((a,b) => a.depth - b.depth);
    for (const surface of surfaces) face(surface.points, surface.color, surface.color);
    face(Array.from({length:segments}, (_, i) => point(-190,38,i)), '#b96738', '#79442c');

    const [nx, ny] = project([0,16,18]);
    stroke(ctx, [[nx,ny-4],[nx+40,74],[nx+114,74]], accent, 1.5);
    label(ctx, compact ? 'Notch' : 'Circumferential notch', nx-12, 60, compact ? 30 : 21, accent);

    // Outward arrows indicate the direction and relative magnitude of axial tension.
    // The notch shading is qualitative and independent of the measured data below.
    const arrow = (x, direction) => {
      const y = 143;
      const tip = x + direction * (23 + 24 * load);
      const shoulder = tip - direction * 10;
      stroke(ctx, [[x,y],[tip,y]], ink, 2 + load);
      stroke(ctx, [[shoulder,y-6],[tip,y],[shoulder,y+6]], ink, 2 + load);
    };
    arrow(86, -1);
    arrow(493, 1);
    label(ctx, 'Axial tension', 30, 60, compact ? 30 : 20, muted);

    label(ctx, compact ? 'Model fit · R² 0.953' : 'Copper-alloy specimen · schematic', 30, 248, compact ? 32 : 20, muted);
  }

  const specimens = [
    { strength: 300, gradient: 3.13, measured: 1.474, name: 'A' },
    { strength: 375, gradient: .67, measured: 1.210, name: 'B' },
    { strength: 550, gradient: 4.28, measured: 1.298, name: 'C' },
    { strength: 675, gradient: .69, measured: 1.061, name: 'D' }
  ];

  function copper(ctx, t, compact) {
    startPlate(ctx);
    copperSpecimen(ctx, t, compact);
    if (compact) return;
    label(ctx, 'Measured vs fitted support factor', 30, 310, 24);
    const left = 76, right = 552, top = 343, bottom = 510;
    const px = n => left + (n - 1) / .6 * (right - left);
    const py = n => bottom - (n - 1) / .6 * (bottom - top);
    for (const n of [1, 1.2, 1.4, 1.6]) {
      stroke(ctx, [[px(n), top],[px(n), bottom]], grid, 1);
      stroke(ctx, [[left, py(n)],[right, py(n)]], grid, 1);
      label(ctx, n.toFixed(1), px(n)-12, bottom+22, 17, muted);
      label(ctx, n.toFixed(1), 34, py(n)+4, 17, muted);
    }
    ctx.save();
    ctx.setLineDash([9, 6]);
    stroke(ctx, [[left,bottom],[right,top]], '#a36442');
    ctx.restore();
    const specimenStep = t / 2.1;
    const activeSpecimen = Math.floor(specimenStep) % specimens.length;
    const residual = Math.sin(Math.PI * (specimenStep % 1));
    for (const [i, { strength, gradient, measured, name }] of specimens.entries()) {
      const exponent = gradient <= 1 ? .5 : .25;
      const fitted = 1 + Math.pow(gradient, exponent) * Math.pow(10, -(.104 + strength / 864));
      const x = px(fitted);
      const y = py(measured);
      if (i === activeSpecimen) {
        const fittedY = py(fitted);
        ctx.save();
        ctx.globalAlpha = residual;
        stroke(ctx, [[x,fittedY],[x,y]], accent, 2);
        ctx.beginPath();
        ctx.arc(x, y, 10 + 4 * residual, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = accent;
        ctx.stroke();
        ctx.restore();
      }
      dot(ctx, x, y, 5.5, '#315d64');
      label(ctx, name, x+9, y-4, 17);
    }
    ctx.save();
    ctx.translate(23, 465);
    ctx.rotate(-Math.PI / 2);
    label(ctx, 'Measured n', 0, 0, 16, muted);
    ctx.restore();
    label(ctx, 'Fitted n', right-67, 552, 16, muted);
    label(ctx, '4 specimens   ·   R² 0.953   ·   RMSE 0.033', 30, 572, 21);
  }

  function unoBoard(ctx, t, compact) {
    const { box, face, line, project } = window.portfolioProjection(ctx, 85, 162, 1.04);
    const board = ['#427a70','#315d64','#234349'];
    const metal = ['#e6e2c9','#a8aba0','#7b857c'];
    const dark = ['#3e4642','#242b2b','#1b2726'];
    const gold = ['#ffe2a2','#b48653','#806447'];

    ctx.fillStyle = '#26454422';
    ctx.beginPath();
    ctx.ellipse(268, 203, 197, 32, 0, 0, 2 * Math.PI);
    ctx.fill();

    box(0,0,-64,286,11,146,board);
    box(-23,11,-45,77,38,41,metal); // USB Type B
    box(-9,11,27,60,30,36,dark); // Barrel jack
    box(133,11,7,116,14,35,dark); // DIP microcontroller
    box(264,11,-41,17,11,19,dark); // Reset button
    box(77,11,1,25,11,15,metal); // Crystal
    for (const z of [-55, 57]) {
      box(79,11,z,191,14,13,dark);
      for (let i = 0; i < 13; i++) box(85 + i * 14,25,z+4,5,2,5,gold);
    }
    for (let i = 0; i < 10; i++) {
      const x = 138 + i * 11;
      box(x,11,1,4,3,7,metal);
      box(x,11,39,4,3,8,metal);
    }

    const [textX,textY] = project([62,12,13]);
    label(ctx, 'UNO', textX, textY+4, 15, '#fff3dd');
    const led = 54 + 9 * Math.sin(t * 4);
    const ledColor = `hsl(38 92% ${led}%)`;
    face([[94,12,29],[103,12,29],[103,12,38],[94,12,38]], ledColor);
    const [portX,portY] = project([-14,28,-14]);
    if (!compact) {
      stroke(ctx, [[portX-4,portY-7],[portX+9,75],[102,75]], muted, 1.5);
      label(ctx, 'Strain data', 42, 64, 19, muted);
    }

    // Separate storage module with incoming signal traced from the controller.
    const wire = [[266,10,70],[307,10,77],[340,10,0],[387,10,0]];
    line(wire, accent, 2);
    for (let pulse = 0; pulse < 2; pulse++) {
      const position = ((t * 1.6 + pulse * 1.5) % 3);
      const segment = Math.floor(position);
      const fraction = position - segment;
      const [px, py] = project(wire[segment].map((value, axis) =>
        value + (wire[segment+1][axis] - value) * fraction));
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f3a247';
      ctx.fill();
    }
    box(367,0,-14,67,7,61,board);
    box(384,7,-6,33,12,37,metal);
    for (let i = 0; i < 4; i++) box(373,7,-3+i*9,5,3,4,gold);
    const [sdX,sdY] = project([406,15,10]);
    if (!compact) {
      stroke(ctx, [[sdX,sdY-5],[sdX-14,82],[sdX-59,82]], muted, 1.5);
      label(ctx, 'microSD log', sdX-101, 71, 19, muted);
      label(ctx, 'Arduino Uno R3 setup · illustrative', 30, 248, 20, muted);
    }
  }

  // A sample series of strain reversals. Closed cycles are found from the
  // stack using the three-point rainflow rule, with remaining ranges as halves.
  const strain = [0,.65,-.68,.83,.2,.51,-.8,.73,-.31,.46,0];
  function countCycles(values) {
    const stack = [];
    const cycles = [];
    values.forEach((value, index) => {
      stack.push({ value, index });
      while (stack.length >= 3) {
        const [a,b,c] = stack.slice(-3);
        const range = Math.abs(a.value-b.value);
        if (range > Math.abs(b.value-c.value)) break;
        const half = stack.length === 3;
        cycles.push({ a, b, range, count: half ? .5 : 1 });
        stack.splice(stack.length-3, half ? 1 : 2);
      }
    });
    for (let i = 1; i < stack.length; i++) {
      const a = stack[i-1], b = stack[i];
      cycles.push({ a, b, range: Math.abs(a.value-b.value), count: .5 });
    }
    return cycles;
  }
  const cycles = countCycles(strain);

  const subdivisions = 24;
  const waveform = strain.slice(0,-1).flatMap((value, i) =>
    Array.from({length:subdivisions}, (_, j) => {
      const f = j / subdivisions;
      return [i + f, value + (strain[i+1] - value) * (1-Math.cos(Math.PI*f))/2];
    }));
  waveform.push([strain.length-1, strain.at(-1)]);

  function dot(ctx, x, y, size, color) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function fatigue(ctx, t, compact) {
    startPlate(ctx);
    ctx.save();
    if (compact) {
      ctx.translate(-24, 18);
      ctx.scale(1.08, 1.08);
    }
    unoBoard(ctx, t, compact);
    ctx.restore();
    if (compact) label(ctx, 'Arduino Uno R3', 35, 60, 36);
    else label(ctx, 'Strain history', 30, 310, 24);
    const left = 35, right = 560;
    const top = compact ? 260 : 332;
    const bottom = compact ? 319 : 438;
    const x = i => left + i * (right-left)/(strain.length-1);
    const y = value => (top+bottom)/2 - value*(bottom-top)/2;
    const wave = waveform.map(([index,value]) => [x(index), y(value)]);
    if (!compact) {
      for (const n of [-1, -.5, 0, .5, 1]) stroke(ctx, [[left,y(n)],[right,y(n)]], grid, 1);
    }
    stroke(ctx, wave, '#78908a', 2.5);

    // A continuous live sweep with interpolated position, including at low frame rates.
    const sweep = ((t * 1.8) % (strain.length-1)) * subdivisions;
    const head = Math.floor(sweep);
    const tip = wave[head].map((value, axis) => value + ((wave[head+1]?.[axis] ?? value)-value)*(sweep-head));
    const tail = Math.max(0, head - 2 * subdivisions);
    ctx.save();
    ctx.globalAlpha = Math.min(1, sweep/12, (wave.length-1-sweep)/12);
    stroke(ctx, [...wave.slice(tail,head+1),tip], ink, 3.5);
    stroke(ctx, [[tip[0],top],[tip[0],bottom]], '#315d6470', 1.5);
    dot(ctx, ...tip, 5, '#315d64');
    ctx.restore();
    if (compact) return;

    const position = t / 2;
    const accumulating = Math.floor(position);
    const cycleIndex = accumulating % cycles.length;
    const cycle = cycles[cycleIndex];
    const progress = position % 1;
    const fade = Math.min(1, progress / .15);
    const previous = accumulating ? (cycleIndex + cycles.length - 1) % cycles.length : cycleIndex;
    const drawRange = ({a,b}, opacity, advance) => {
      const first = Math.min(a.index,b.index)*subdivisions;
      const last = Math.max(a.index,b.index)*subdivisions;
      const travel = first + (last-first)*advance;
      const end = Math.floor(travel);
      const endPoint = wave[end].map((value, axis) =>
        value + ((wave[end+1]?.[axis] ?? value)-value)*(travel-end));
      ctx.globalAlpha = opacity;
      stroke(ctx, [...wave.slice(first,end+1),endPoint], accent, 4);
      dot(ctx, ...wave[first], 5, accent);
      dot(ctx, ...endPoint, 5, accent);
    };
    ctx.save();
    if (previous !== cycleIndex && fade < 1) drawRange(cycles[previous], 1-fade, 1);
    drawRange(cycle, fade, Math.min(1, progress/.48));
    ctx.restore();

    label(ctx, 'Rainflow ranges', 30, 490, 24);
    const cycleLabel = cycle.count === 1 ? 'Full' : 'Half';
    ctx.save();
    ctx.globalAlpha = fade;
    label(ctx, `${cycleLabel} cycle · Δ ${cycle.range.toFixed(2)}`, 365, 490, 18, accent);
    ctx.restore();
    const width = (right-left)/cycles.length;
    for (const [index, item] of cycles.entries()) {
      const height = 43*item.range/1.65;
      const barLeft = left+index*width;
      ctx.fillStyle = '#648a80';
      ctx.fillRect(barLeft, 548-height, width-6, height);
      if (index === cycleIndex || index === previous) {
        ctx.globalAlpha = index === cycleIndex ? fade : 1-fade;
        ctx.fillStyle = accent;
        ctx.fillRect(barLeft, 548-height, width-6, height);
        ctx.globalAlpha = 1;
      }
    }
    stroke(ctx, [[left,548],[right,548]], grid, 1);
    label(ctx, 'Cycle ranges feed the fatigue damage estimate', 30, 575, 20, muted);
  }

  const assemblyCad = new Image();
  const assemblyCadUrl = new URL('assets/high-res/spring-insertion.webp', document.currentScript.src);
  const assemblyNearby = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    assemblyCad.src = assemblyCadUrl.href;
    assemblyNearby.disconnect();
  }, { rootMargin: '300px 0px' });
  // The trace points were measured on the original CAD export, before upscaling.
  const assemblyReference = { width: 917, height: 830 };
  const assemblySteps = [
    { title: 'Feed the spring', path: [[347,94],[298,180],[235,284]] },
    { title: 'Position the terminal link', path: [[136,410],[161,391],[192,402]] },
    { title: 'Slide the carrier along the rails', path: [[169,449],[250,497],[339,546]] },
    { title: 'Seat the spring under the roller', path: [[387,389],[387,418],[387,447]] }
  ];

  function assembly(ctx, time, compact, cardHeight) {
    const frameHeight = compact ? cardHeight ?? previewHeight : 492;
    ctx.fillStyle = '#707070';
    ctx.fillRect(0, 0, W, frameHeight);
    if (assemblyCad.naturalWidth) {
      const ratioX = W / assemblyCad.naturalWidth;
      const ratioY = frameHeight / assemblyCad.naturalHeight;
      // For the map card, frame the feeder, links and guide rails on the original CAD.
      const scale = cardHeight ? Math.max(ratioX, ratioY) / .76 : Math.min(ratioX, ratioY);
      const width = assemblyCad.naturalWidth * scale;
      const height = assemblyCad.naturalHeight * scale;
      const left = cardHeight ? Math.max(W-width, Math.min(0, W/2-width*.385)) : (W-width)/2;
      const top = cardHeight ? Math.max(frameHeight-height, Math.min(0, frameHeight/2-height*.42)) : (frameHeight-height)/2;
      ctx.drawImage(assemblyCad, left, top, width, height);

      // The original CAD remains fixed. A thin trace shows the direction of each step.
      const stepTime = 2.5;
      const position = (time / stepTime) % assemblySteps.length;
      const stage = Math.floor(position);
      const progress = position - stage;
      const path = assemblySteps[stage].path.map(([x,y]) => [
        left + x * width / assemblyReference.width,
        top + y * height / assemblyReference.height
      ]);
      const active = Math.min(1, progress / .72);
      const distances = path.slice(1).map(([x,y], i) => Math.hypot(x-path[i][0], y-path[i][1]));
      let remaining = active * (distances[0] + distances[1]);
      const trace = [path[0]];
      for (const [index, length] of distances.entries()) {
        const fraction = Math.min(1, remaining / length);
        const [x,y] = path[index];
        const [nextX,nextY] = path[index+1];
        trace.push([x+(nextX-x)*fraction,y+(nextY-y)*fraction]);
        if (fraction < 1) break;
        remaining -= length;
      }

      ctx.save();
      ctx.globalAlpha = Math.min(1, progress * 8, (1-progress) * 6);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      stroke(ctx, trace, '#193c41', compact ? 8 : 5);
      stroke(ctx, trace, '#fbc18a', compact ? 4 : 2.5);
      dot(ctx, ...trace.at(-1), compact ? 6 : 4, '#ffe4c4');
      ctx.restore();

      if (!compact) {
        ctx.fillStyle = '#f2e7d6';
        ctx.fillRect(0, frameHeight, W, H-frameHeight);
        for (const [i] of assemblySteps.entries()) {
          const start = 26 + i * 139;
          ctx.fillStyle = '#b6b5a3';
          ctx.fillRect(start, frameHeight+13, 130, 2);
          if (i <= stage) {
            ctx.fillStyle = '#315d64';
            ctx.fillRect(start, frameHeight+13, 130 * (i === stage ? progress : 1), 2);
          }
        }
        label(ctx, assemblySteps[stage].title, 26, frameHeight+49, 26);
        label(ctx, 'Sequence overlay on the original CAD render', 26, frameHeight+78, 18, muted);
      }
    }
  }

  const sketches = { assembly, copper, fatigue };
  const descriptions = {
    assembly: 'Original CAD render of the spring insertion prototype with an animated trace for feeding, positioning, sliding and pressing.',
    copper: 'Copper alloy specimen under illustrative axial tension, with the load concentrated at its circumferential notch.',
    fatigue: 'Animated 3D Arduino Uno R3 and microSD setup with a moving strain signal.'
  };

  function measure(canvas) {
    const { width, height } = window.portfolioCanvasSize(canvas);
    if (!width || !height) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    sizes.set(canvas, { width, height });
  }
  function draw(canvas, t) {
    const size = sizes.get(canvas);
    if (!size) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const compact = !canvas.classList.contains('project-animation');
    const name = canvas.dataset.projectAnimation;
    const cardHeight = name === 'assembly' && canvas.closest('.square--assembly') ? W * size.height / size.width : undefined;
    const height = compact ? cardHeight ?? previewHeight : H;
    const scale = Math.min(size.width / W, size.height / height);
    ctx.resetTransform();
    ctx.fillStyle = '#ecdec6';
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.setTransform(scale, 0, 0, scale, (size.width-W*scale)/2, (size.height-height*scale)/2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, height);
    ctx.clip();
    sketches[name](ctx, t, compact, cardHeight);
    ctx.restore();
  }
  function tick(now) {
    const delta = Math.min(.05, Math.max(0, (now - last) / 1000));
    last = now;
    for (const canvas of visible) {
      if (!canvas.isConnected) {
        visible.delete(canvas);
        continue;
      }
      const time = times.get(canvas) + delta;
      times.set(canvas, time);
      draw(canvas, time);
    }
    frame = visible.size ? requestAnimationFrame(tick) : 0;
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!motion.running || !visible.size) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  const resize = new ResizeObserver(entries => {
    entries.forEach(entry => { measure(entry.target); draw(entry.target, times.get(entry.target)); });
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    sync();
  });

  function mount(canvas) {
    times.set(canvas, 0);
    if (canvas.dataset.projectAnimation === 'assembly' && !assemblyCad.naturalWidth) {
      assemblyCad.addEventListener('load', () => draw(canvas, times.get(canvas)), { once: true });
      if (canvas.classList.contains('project-animation')) assemblyNearby.observe(canvas);
      else if (!assemblyCad.getAttribute('src')) assemblyCad.src = assemblyCadUrl.href;
    }
    measure(canvas);
    draw(canvas, 0);
    resize.observe(canvas);
    observer.observe(canvas);
  }

  function preview(name) {
    const canvas = document.createElement('canvas');
    canvas.className = 'scene-canvas';
    canvas.dataset.projectAnimation = name;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', descriptions[name]);
    // Observers keep previews idle while detached. Browsers report when they are inserted.
    mount(canvas);
    return canvas;
  }

  window.portfolioScenes = { preview };
  document.querySelectorAll('.project-media canvas.project-animation').forEach(mount);
  motion.subscribe(sync);
})();
