(() => {
  const canvases = [...document.querySelectorAll('.project-media canvas.project-animation')];
  if (!canvases.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const W = 600, H = 500;
  let frame = 0, start = performance.now(), last = 0;

  function base(ctx, title, subtitle) {
    const background = ctx.createLinearGradient(0, 0, W, H);
    background.addColorStop(0, '#071421');
    background.addColorStop(1, '#0d2538');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e4f4ff';
    ctx.font = '600 19px ui-monospace, Consolas, monospace';
    ctx.fillText(title, 42, 49);
    ctx.fillStyle = '#83afc9';
    ctx.font = '13px ui-monospace, Consolas, monospace';
    ctx.fillText(subtitle, 42, 72);
  }

  function copper(ctx, t) {
    base(ctx, 'COPPER / NOTCH SUPPORT', 'Measured versus fitted support factor n');
    const left = 83, right = 535, top = 103, bottom = 391;
    const px = v => left + (v - 1) / .6 * (right - left);
    const py = v => bottom - (v - 1) / .6 * (bottom - top);
    ctx.lineWidth = 1;
    ctx.font = '12px ui-monospace, Consolas, monospace';
    ctx.fillStyle = '#91afc1';
    for (const n of [1, 1.2, 1.4, 1.6]) {
      ctx.strokeStyle = '#25445a';
      ctx.beginPath(); ctx.moveTo(px(n), top); ctx.lineTo(px(n), bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(left, py(n)); ctx.lineTo(right, py(n)); ctx.stroke();
      ctx.fillText(n.toFixed(1), px(n) - 10, bottom + 20);
      ctx.fillText(n.toFixed(1), 42, py(n) + 4);
    }
    ctx.fillStyle = '#b4d2e4';
    ctx.fillText('FITTED n', right - 63, bottom + 43);
    ctx.save();
    ctx.translate(27, top + 124);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('MEASURED n', 0, 0);
    ctx.restore();
    ctx.strokeStyle = '#37566b';
    ctx.lineWidth = 16;
    ctx.globalAlpha = .3;
    ctx.beginPath(); ctx.moveTo(px(1), py(1)); ctx.lineTo(px(1.6), py(1.6)); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#65c9ee';
    ctx.lineWidth = 2;
    const phase = t % 7;
    const reveal = Math.max(0, Math.min(1, (phase - .3) / 1.4));
    const smooth = reveal * reveal * (3 - 2 * reveal);
    ctx.beginPath(); ctx.moveTo(px(1), py(1)); ctx.lineTo(px(1 + .6 * smooth), py(1 + .6 * smooth)); ctx.stroke();
    const specimens = [
      [300, 3.13, 1.474, 'A'],
      [375, .67, 1.210, 'B'],
      [550, 4.28, 1.298, 'C'],
      [675, .69, 1.061, 'D']
    ];
    specimens.forEach(([strength, gradient, measured, label], i) => {
      const exponent = gradient <= 1 ? .5 : .25;
      const fitted = 1 + Math.pow(gradient, exponent) * Math.pow(10, -(.104 + strength / 864));
      const visible = Math.max(.32, Math.min(1, (phase - 1.1 - i * .34) / .45));
      ctx.globalAlpha = visible;
      ctx.fillStyle = '#a4ebff';
      ctx.beginPath(); ctx.arc(px(fitted), py(measured), 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e1f8ff';
      ctx.font = '12px ui-monospace, Consolas, monospace';
      ctx.fillText(label, px(fitted) + 10, py(measured) - 7);
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = '#a5d9f1';
    ctx.font = '14px ui-monospace, Consolas, monospace';
    ctx.fillText('4 in-house specimens  ·  R² = 0.953  ·  RMSE = 0.033', 42, 465);
  }

  function fatigue(ctx, t) {
    base(ctx, 'ONLINE FATIGUE ASSESSMENT', 'Signal → rainflow cycles → damage estimate');
    const left = 55, right = 548, top = 109, bottom = 312;
    ctx.strokeStyle = '#24465c';
    ctx.lineWidth = 1;
    for (let x = left; x <= right; x += 49) {
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
    }
    for (let y = top; y <= bottom; y += 51) {
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
    }
    ctx.strokeStyle = '#6e98ad';
    ctx.beginPath(); ctx.moveTo(left, 210); ctx.lineTo(right, 210); ctx.stroke();
    ctx.fillStyle = '#9cbdd0';
    ctx.font = '12px ui-monospace, Consolas, monospace';
    ctx.fillText('LOAD SIGNAL (illustrative)', left, top - 13);
    const signal = x => {
      const q = x * .064 + t * 2.3;
      return 210 - 49 * Math.sin(q) - 27 * Math.sin(q * .46 + .9) - 12 * Math.sin(q * 2.2);
    };
    ctx.save();
    ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip();
    ctx.beginPath();
    for (let x = left; x <= right; x += 2) {
      if (x === left) ctx.moveTo(x, signal(x)); else ctx.lineTo(x, signal(x));
    }
    ctx.strokeStyle = '#62d6fb';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#4bb7ed';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;
    const scan = left + (t % 5) / 5 * (right - left);
    ctx.strokeStyle = '#b4e5f488';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(scan, top); ctx.lineTo(scan, bottom); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#9cbdd0';
    ctx.fillText('CYCLE EVENTS', left, 349);
    for (let i = 0; i < 11; i++) {
      const x = left + i * 43;
      const active = (t * 2.2 - i + 11) % 11 < 1.5;
      ctx.fillStyle = active ? '#a9e8fa' : '#47768f';
      ctx.beginPath(); ctx.arc(x + 5, 369, active ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#9cbdd0';
    ctx.fillText('DAMAGE ESTIMATE (schematic)', left, 415);
    ctx.strokeStyle = '#4fbedc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 80; i++) {
      const x = left + i * (right - left) / 79;
      const y = 479 - 56 * Math.pow(i / 79, 1.2);
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function draw(canvas, t) {
    const density = Math.max(2, window.devicePixelRatio || 1);
    const width = Math.round(canvas.clientWidth * density);
    const height = Math.round(canvas.clientHeight * density);
    if (!width || !height) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(width / W, 0, 0, height / H, 0, 0);
    (canvas.dataset.projectAnimation === 'copper' ? copper : fatigue)(ctx, t);
  }
  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (document.hidden) return;
    last = now;
    for (const canvas of canvases) {
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) draw(canvas, (now - start) / 1000);
    }
  }
  canvases.forEach(canvas => draw(canvas, 3));
  if (!reduced.matches) frame = requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else if (!reduced.matches && !frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
  });
  new ResizeObserver(() => canvases.forEach(canvas => draw(canvas, reduced.matches ? 3 : (performance.now() - start) / 1000))).observe(document.querySelector('.project-list'));
  reduced.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0;
    canvases.forEach(canvas => draw(canvas, 3));
    if (!reduced.matches && !document.hidden) frame = requestAnimationFrame(tick);
  });
})();
