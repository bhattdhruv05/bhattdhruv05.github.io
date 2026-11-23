/* Orthographic projection for the portfolio's engineering illustrations. */
(() => {
  'use strict';

  function scene(ctx, originX, originY, scale = 1) {
    const project = ([x, y, z]) => [
      originX + scale * (x + z * .54),
      originY + scale * (-y + z * .34)
    ];
    function path(points, close = false) {
      ctx.beginPath();
      points.forEach((point, index) => {
        const [x, y] = project(point);
        if (index) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      if (close) ctx.closePath();
    }
    function face(points, fill, edge) {
      path(points, true);
      ctx.fillStyle = fill;
      ctx.fill();
      if (edge) {
        ctx.strokeStyle = edge;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    function line(points, color, width = 1) {
      path(points);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    function box(x, y, z, width, height, depth, [top, front, side]) {
      const a = [x, y, z + depth], b = [x + width, y, z + depth];
      const c = [x + width, y + height, z + depth], d = [x, y + height, z + depth];
      const f = [x + width, y + height, z], g = [x, y + height, z], h = [x, y, z];
      face([h, a, d, g], side);
      face([a, b, c, d], front);
      face([d, c, f, g], top);
    }
    return { project, face, line, box };
  }

  window.portfolioProjection = scene;

  // Supersample without changing the layout or letting a large canvas monopolize rendering.
  window.portfolioCanvasSize = canvas => {
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return { width: 0, height: 0 };
    const density = Math.min(4, 2 * Math.max(1, window.devicePixelRatio || 1),
      Math.sqrt(4500000 / (clientWidth * clientHeight)));
    return {
      width: Math.round(clientWidth * density),
      height: Math.round(clientHeight * density)
    };
  };
})();
