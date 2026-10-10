(() => {
  try {
    const canvas = document.querySelector("#neural");
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      rotation = 0,
      pointerX = 0,
      pointerY = 0;
    const nodes = Array.from({ length: 340 }, (_, i) => {
      const y = 1 - (2 * (i + 0.5)) / 340;
      const r = Math.sqrt(1 - y * y);
      const a = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
    });
    const links = [];
    nodes.forEach((a, i) =>
      nodes.forEach((b, j) => {
        if (j > i && Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.25)
          links.push([i, j]);
      }),
    );
    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motion.matches) draw();
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      const r = Math.min(width * 0.37, height * 0.37);
      const a = rotation + pointerX * 0.12;
      const tilt = 0.25 + pointerY * 0.12;
      const projected = nodes.map((n) => {
        const x = n.x * Math.cos(a) + n.z * Math.sin(a);
        const z = n.z * Math.cos(a) - n.x * Math.sin(a);
        const y = n.y * Math.cos(tilt) - z * Math.sin(tilt);
        const zz = z * Math.cos(tilt) + n.y * Math.sin(tilt);
        return { x: width / 2 + x * r, y: height / 2 + y * r, z: zz };
      });
      links.forEach(([i, j]) => {
        const p = projected[i],
          q = projected[j];
        ctx.strokeStyle = `rgba(183,238,103,${0.035 + Math.max(0, (p.z + q.z) / 2 + 1) * 0.075})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      });
      projected
        .sort((a, b) => a.z - b.z)
        .forEach((p, i) => {
          ctx.fillStyle = `rgba(${i % 23 === 0 ? "237,255,212" : "188,244,107"},${0.13 + (p.z + 1) * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.z > 0 ? 1.7 : 1, 0, Math.PI * 2);
          ctx.fill();
          if (i % 41 === 0 && p.z > 0.2) {
            ctx.strokeStyle = "#c4f56840";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      ctx.strokeStyle = "#95b56513";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(
        width / 2,
        height / 2,
        r * 1.23,
        r * 0.34,
        -0.4,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    function animate() {
      rotation += 0.0022;
      draw();
      frame = requestAnimationFrame(animate);
    }
    new ResizeObserver(resize).observe(canvas);
    function syncAnimation() {
      cancelAnimationFrame(frame);
      if (!motion.matches && !document.hidden) animate();
      else draw();
    }
    motion.addEventListener("change", syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);
    resize();
    syncAnimation();
  } catch (error) {
    console.warn("Background animation unavailable", error);
  }
})();
