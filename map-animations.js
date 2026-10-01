(() => {
  let frame = 0, elapsed = 0, last = 0;
  const W = 160, H = 160;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function background(ctx) {
    const fill = ctx.createLinearGradient(0, 0, W, H);
    fill.addColorStop(0, '#01060d');
    fill.addColorStop(1, '#07182c');
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, W, H);
  }

  function binary(ctx, t) {
    background(ctx);
    ctx.font = '12px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.textAlign = 'center';
    for (let col = 0; col < 9; col++) {
      const speed = 14 + (col % 4) * 5;
      const travel = t * speed;
      for (let row = -2; row < 14; row++) {
        const index = row + Math.floor(travel / 16);
        const y = row * 16 + travel % 16;
        if (y < 0 || y > H + 12) continue;
        const bit = ((index * 37 + col * 29 + index * col * 7) & 3) > 1 ? '1' : '0';
        const bright = (index + col * 3) % 7 === 0;
        ctx.fillStyle = bright ? '#80d8ff' : col % 3 === 0 ? '#347cc3' : '#1e5a9a';
        ctx.globalAlpha = bright ? .95 : .48 + ((index + col) & 2) * .1;
        ctx.fillText(bit, 10 + col * 18, y);
      }
    }
    ctx.globalAlpha = 1;
    const shade = ctx.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, '#01060dcc');
    shade.addColorStop(.2, '#01060d00');
    shade.addColorStop(.8, '#01060d00');
    shade.addColorStop(1, '#01060dcc');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);
  }

  function ease(value) {
    const x = Math.max(0, Math.min(1, value));
    return x * x * (3 - 2 * x);
  }

  function analytics(ctx, t) {
    binary(ctx, t);
    ctx.fillStyle = '#041322ed';
    ctx.fillRect(10, 15, 140, 131);
    ctx.font = 'bold 8px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#b6e8ff';
    ctx.fillText('ENERGY  /  VIEW B', 17, 29);
    ctx.fillStyle = '#7198b2';
    ctx.font = '7px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.fillText('R² BY TEST SPLIT', 17, 39);
    const base = 113, height = 55;
    ctx.strokeStyle = '#234459';
    ctx.lineWidth = .7;
    for (const value of [0, .5, 1]) {
      const y = base - value * height;
      ctx.beginPath(); ctx.moveTo(23, y); ctx.lineTo(140, y); ctx.stroke();
    }
    ctx.fillStyle = '#7292a5';
    ctx.fillText('1.0', 17, 59);
    ctx.fillText('0', 17, 117);
    const cycle = t % 6.5;
    const bars = [
      {x: 46, value: .921129, label: 'RANDOM', color: '#4dc9f3', delay: .2},
      {x: 104, value: .499055, label: 'CHRON.', color: '#68a9ed', delay: .75}
    ];
    for (const bar of bars) {
      const progress = ease((cycle - bar.delay) / .85);
      const h = bar.value * height * progress;
      ctx.fillStyle = bar.color;
      ctx.fillRect(bar.x, base - h, 21, h);
      ctx.fillStyle = '#d9f5ff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 9px ui-monospace, SFMono-Regular, Consolas, monospace';
      if (progress > .96) ctx.fillText(bar.value.toFixed(2), bar.x + 10.5, base - h - 4);
      ctx.font = '7px ui-monospace, SFMono-Regular, Consolas, monospace';
      ctx.fillStyle = '#9db9ca';
      ctx.fillText(bar.label, bar.x + 10.5, 126);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#698ca2';
    ctx.fillText('SENSOR-ENRICHED', 17, 139);
  }

  function copper(ctx, t) {
    background(ctx);
    ctx.fillStyle = '#071727';
    ctx.fillRect(10, 12, 140, 135);
    ctx.textAlign = 'left';
    ctx.font = 'bold 8px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.fillStyle = '#b6e8ff';
    ctx.fillText('COPPER  /  NOTCH SUPPORT', 17, 26);
    ctx.font = '7px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.fillStyle = '#85a8bc';
    ctx.fillText('MEASURED vs FITTED n', 17, 37);
    const x0 = 30, y0 = 124, size = 82, range = .6;
    const x = value => x0 + (value - 1) / range * size;
    const y = value => y0 - (value - 1) / range * size;
    ctx.strokeStyle = '#28475b';
    ctx.lineWidth = .7;
    for (const value of [1.0, 1.2, 1.4, 1.6]) {
      ctx.beginPath(); ctx.moveTo(x(value), y0); ctx.lineTo(x(value), y(1.6)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, y(value)); ctx.lineTo(x(1.6), y(value)); ctx.stroke();
    }
    ctx.strokeStyle = '#7799ab';
    ctx.beginPath(); ctx.moveTo(x0, y(1.6)); ctx.lineTo(x0, y0); ctx.lineTo(x(1.6), y0); ctx.stroke();
    const progress = ease((t % 7 - .25) / 1.3);
    ctx.strokeStyle = '#50c5ed';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x(1), y(1)); ctx.lineTo(x(1 + range * progress), y(1 + range * progress)); ctx.stroke();
    const specimens = [
      [300, 3.13, 1.474], [375, .67, 1.210],
      [550, 4.28, 1.298], [675, .69, 1.061]
    ];
    specimens.forEach(([strength, gradient, measured], index) => {
      const exponent = gradient <= 1 ? .5 : .25;
      const fitted = 1 + Math.pow(gradient, exponent) * Math.pow(10, -(.104 + strength / 864));
      const opacity = ease((t % 7 - 1.25 - index * .32) / .45);
      if (!opacity) return;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#071727';
      ctx.beginPath(); ctx.arc(x(fitted), y(measured), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a6edff';
      ctx.beginPath(); ctx.arc(x(fitted), y(measured), 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
    ctx.font = '7px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.fillStyle = '#86a9bc';
    ctx.fillText('1.0', 16, 127);
    ctx.fillText('1.6', 16, 46);
    ctx.fillText('FITTED', 99, 136);
    ctx.fillStyle = '#a9e5fa';
    ctx.fillText('R² 0.953  /  4 TESTS', 17, 146);
  }

  function fatigue(ctx, t) {
    background(ctx);
    ctx.strokeStyle = '#23425b';
    ctx.lineWidth = .7;
    for (let i = 20; i < W; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 12); ctx.lineTo(i, 138); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(18, i); ctx.lineTo(150, i); ctx.stroke();
    }
    ctx.strokeStyle = '#7298ab';
    ctx.beginPath(); ctx.moveTo(18, 14); ctx.lineTo(18, 140); ctx.lineTo(150, 140); ctx.stroke();
    ctx.fillStyle = '#83a9bb';
    ctx.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.fillText('LOAD', 23, 13);
    ctx.fillText('TIME', 126, 152);
    ctx.save();
    ctx.beginPath(); ctx.rect(19, 15, 130, 124); ctx.clip();
    ctx.beginPath();
    for (let x = 19; x <= 150; x++) {
      const phase = x + t * 26;
      const swell = Math.pow(Math.max(0, Math.sin(phase * .027)), 3);
      const y = 80 - Math.sin(phase * .15) * (8 + swell * 31)
        - Math.sin(phase * .052) * 10;
      if (x === 19) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#4dc9f3';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#23a8ed';
    ctx.shadowBlur = 9;
    ctx.stroke();
    ctx.restore();
  }

  function paint() {
    document.querySelectorAll('#project-space canvas.concept-animation').forEach(canvas => {
      if (canvas.width !== 320) { canvas.width = 320; canvas.height = 320; }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ({binary, fatigue, analytics, copper}[canvas.dataset.animation] || fatigue)(ctx, elapsed);
    });
  }

  function tick(now) {
    elapsed += Math.min((now - last) / 1000, .05);
    last = now;
    paint();
    frame = requestAnimationFrame(tick);
  }

  window.portfolioAnimations = {
    play() {
      if (!document.querySelector('#project-space canvas.concept-animation')) return;
      if (reduced.matches) { elapsed = 3; paint(); return; }
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    },
    pause() {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
})();
