// A slowly rotating neural sphere with sparse signals along its connections.
// This file is optional and never controls the page content or navigation.
(() => {
  try {
    const canvas = document.querySelector("#neural");
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const palettes = {
      default: [196, 245, 104],
      language: [129, 217, 244],
      multimodal: [197, 160, 245],
      ocr: [126, 224, 211],
      nlp: [242, 193, 133],
    };
    const markers = [
      ...document.querySelectorAll(
        "#hero-title, #about, #experience, #vision, #language, #multimodal, #ocr, #nlp, #stack, #education, #contact",
      ),
    ];
    let sections = [];
    let width = 0,
      height = 0,
      frame = 0,
      previousTime = 0;
    let rotation = 0,
      phase = 0,
      scroll = window.scrollY,
      targetScroll = scroll;
    let pointer = { x: 0, y: 0 },
      targetPointer = { x: 0, y: 0 };
    let tint = [...palettes.default];
    let caseExpansion = 0;
    let growth = {
      start: 0,
      end: 1,
      shrinkStart: Infinity,
      shrinkEnd: Infinity,
    };
    const nodeCount = coarse.matches ? 160 : 260;
    const nodes = Array.from({ length: nodeCount }, (_, index) => {
      const y = 1 - (2 * (index + 0.5)) / nodeCount;
      const radius = Math.sqrt(1 - y * y);
      const angle = index * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
    });
    const links = [];
    nodes.forEach((a, i) =>
      nodes.forEach((b, j) => {
        if (
          j > i &&
          Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) <
            (coarse.matches ? 0.4 : 0.32)
        )
          links.push([i, j]);
      }),
    );
    const neighbors = nodes.map(() => []);
    links.forEach(([a, b]) => {
      neighbors[a].push(b);
      neighbors[b].push(a);
    });
    const hubs = Array.from({ length: coarse.matches ? 4 : 7 }, (_, index) =>
      Math.floor(((index + 0.4) * nodeCount) / (coarse.matches ? 4 : 7)),
    );
    const signals = Array.from({ length: coarse.matches ? 1 : 2 }, () => ({
      route: [],
      started: -Infinity,
    }));
    let nextSignalAt = 0.6,
      signalNumber = 0;
    const projected = nodes.map(() => ({ x: 0, y: 0, z: 0 }));
    const linkBuckets = Array.from({ length: 12 }, () => []);
    const nodeBuckets = Array.from({ length: 8 }, () => []);
    const glowSprite = document.createElement("canvas");
    glowSprite.width = glowSprite.height = 128;
    const glowContext = glowSprite.getContext("2d");
    let rgb = "",
      spriteColor = "";
    const mix = (a, b, factor) => a + (b - a) * factor;
    const color = (alpha) =>
      `rgba(${rgb},${Math.min(1, alpha * mix(1, 1.45, caseExpansion))})`;
    const smoothstep = (start, end, position) => {
      const t = Math.max(0, Math.min(1, (position - start) / (end - start)));
      return t * t * (3 - 2 * t);
    };
    function expansionAt(position) {
      return (
        smoothstep(growth.start, growth.end, position) *
        (1 - smoothstep(growth.shrinkStart, growth.shrinkEnd, position))
      );
    }
    function measureSections() {
      sections = markers.map((element) => ({
        top: element.getBoundingClientRect().top + window.scrollY,
        tint: palettes[element.id] || palettes.default,
      }));
      const bounds = (id) => {
        const rect = document.getElementById(id).getBoundingClientRect();
        return { top: rect.top + window.scrollY, height: rect.height };
      };
      const experience = bounds("experience"),
        vision = bounds("vision"),
        ocr = bounds("ocr");
      growth.start = experience.top + experience.height * 0.5;
      growth.end = Math.max(
        vision.top + height * 0.45,
        growth.start + height * 1.5,
      );
      growth.shrinkStart = ocr.top + ocr.height;
      growth.shrinkEnd = growth.shrinkStart + height * 1.5;
    }
    function activeSection() {
      const position = targetScroll + height * 0.42;
      let selected = sections[0];
      for (const section of sections) {
        if (section.top > position) break;
        selected = section;
      }
      return selected || { tint: palettes.default };
    }
    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      // Limit pixel work on large and high-density displays.
      const dpr = Math.min(
        devicePixelRatio,
        1.25,
        Math.sqrt(2_000_000 / Math.max(width * height, 1)),
      );
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureSections();
      const section = activeSection();
      tint = [...section.tint];
      caseExpansion = expansionAt(scroll + height * 0.5);
      draw(0);
    }
    function glow(x, y, radius, opacity) {
      ctx.globalAlpha = Math.min(1, opacity * mix(1, 1.45, caseExpansion));
      ctx.drawImage(glowSprite, x - radius, y - radius, radius * 2, radius * 2);
      ctx.globalAlpha = 1;
    }
    function drawSignals() {
      if (motion.matches) return;
      const hopDuration = 0.85;
      if (phase >= nextSignalAt) {
        const signal = signals[signalNumber % signals.length];
        signal.route.length = 0;
        // Start on the visible front surface, so a rare signal is easy to see.
        for (let offset = 0; offset < nodeCount; offset++) {
          const index = (signalNumber * 53 + offset * 37) % nodeCount;
          const point = projected[index];
          if (
            point.z > 0.15 &&
            point.x > width * 0.06 &&
            point.x < width * 0.94 &&
            point.y > height * 0.06 &&
            point.y < height * 0.94
          ) {
            signal.route.push(index);
            break;
          }
        }
        // Follow real neighboring edges; never jump between unrelated links.
        for (let hop = 0; hop < 3 && signal.route.length; hop++) {
          const adjacent = neighbors[signal.route.at(-1)];
          let next;
          for (let offset = 0; offset < adjacent.length; offset++) {
            const index =
              adjacent[(offset + signalNumber + hop) % adjacent.length];
            const point = projected[index];
            if (
              !signal.route.includes(index) &&
              point.z > -0.15 &&
              point.x > 0 &&
              point.x < width &&
              point.y > 0 &&
              point.y < height
            ) {
              next = index;
              break;
            }
          }
          if (next === undefined) break;
          signal.route.push(next);
        }
        signal.started = phase;
        signalNumber++;
        nextSignalAt = phase + (coarse.matches ? 4.8 : 3.7);
      }
      for (const signal of signals) {
        const elapsed = phase - signal.started;
        const hops = signal.route.length - 1;
        const arrival = elapsed - hops * hopDuration;
        if (hops < 1 || elapsed < 0 || arrival > 0.75) continue;
        if (arrival < 0) {
          const step = Math.floor(elapsed / hopDuration);
          const t = (elapsed / hopDuration) % 1;
          const a = projected[signal.route[step]],
            b = projected[signal.route[step + 1]];
          const fade = Math.min(1, elapsed / 0.25);
          const x = mix(a.x, b.x, t),
            y = mix(a.y, b.y, t);
          // A short soft trail, using the cached glow sprite rather than blur.
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = color(fade * 0.65);
          ctx.beginPath();
          ctx.moveTo(
            mix(a.x, b.x, Math.max(0, t - 0.25)),
            mix(a.y, b.y, Math.max(0, t - 0.25)),
          );
          ctx.lineTo(x, y);
          ctx.stroke();
          glow(x, y, 16, fade * 0.48);
          ctx.fillStyle = color(fade);
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const end = projected[signal.route.at(-1)];
          const fade = 1 - smoothstep(0, 0.75, arrival);
          glow(end.x, end.y, 18, fade * 0.5);
          ctx.strokeStyle = color(fade * 0.6);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(end.x, end.y, 3 + arrival * 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    function draw(energy) {
      ctx.clearRect(0, 0, width, height);
      rgb = tint.map(Math.round).join(",");
      if (spriteColor !== rgb) {
        spriteColor = rgb;
        glowContext.clearRect(0, 0, 128, 128);
        const gradient = glowContext.createRadialGradient(
          64,
          64,
          0,
          64,
          64,
          64,
        );
        gradient.addColorStop(0, `rgba(${rgb},1)`);
        gradient.addColorStop(1, `rgba(${rgb},0)`);
        glowContext.fillStyle = gradient;
        glowContext.fillRect(0, 0, 128, 128);
      }
      const progress = scroll / Math.max(height, 1);
      const baseRadius = Math.min(width * 0.39, height * 0.46);
      // Grow uniformly in case sections, keeping the sphere's proportions.
      const radius = mix(
        baseRadius,
        Math.max(baseRadius, width * 0.55),
        caseExpansion,
      );
      const centerX = width * 0.5 + pointer.x * 14 * (1 - caseExpansion);
      const centerY = height * 0.5 + pointer.y * 10;
      const angle = rotation + progress * 0.28 + pointer.x * 0.08;
      const tilt = 0.25 + Math.sin(progress * 0.5) * 0.24 + pointer.y * 0.08;
      const ca = Math.cos(angle),
        sa = Math.sin(angle),
        ct = Math.cos(tilt),
        st = Math.sin(tilt);
      glow(centerX, centerY, radius * 1.35, 0.065);
      nodes.forEach((node, index) => {
        const x = node.x * ca + node.z * sa;
        const z = node.z * ca - node.x * sa;
        const y = node.y * ct - z * st;
        const depth = z * ct + node.y * st;
        const perspective = 1 + depth * 0.12;
        const point = projected[index];
        point.x = centerX + x * radius * perspective;
        point.y = centerY + y * radius * perspective;
        point.z = depth;
      });
      linkBuckets.forEach((bucket) => {
        bucket.length = 0;
      });
      links.forEach((edge) => {
        const [i, j] = edge;
        const a = projected[i],
          b = projected[j];
        if (
          (a.x < 0 && b.x < 0) ||
          (a.x > width && b.x > width) ||
          (a.y < 0 && b.y < 0) ||
          (a.y > height && b.y > height)
        )
          return;
        const depth = Math.max(0, (a.z + b.z) / 2 + 1);
        linkBuckets[Math.min(11, Math.floor(depth * 6))].push(edge);
      });
      // Batch by depth: a dozen strokes instead of hundreds every frame.
      linkBuckets.forEach((bucket, index) => {
        ctx.strokeStyle = color(0.025 + ((index + 0.5) / 12) * 0.17);
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        bucket.forEach(([i, j]) => {
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
        });
        ctx.stroke();
      });
      drawSignals();
      nodeBuckets.forEach((bucket) => {
        bucket.length = 0;
      });
      projected.forEach((point) => {
        if (
          point.x < -6 ||
          point.x > width + 6 ||
          point.y < -6 ||
          point.y > height + 6
        )
          return;
        nodeBuckets[
          Math.max(0, Math.min(7, Math.floor((point.z + 1) * 4)))
        ].push(point);
      });
      nodeBuckets.forEach((bucket, index) => {
        ctx.fillStyle = color(0.14 + ((index + 0.5) / 8) * 0.6);
        ctx.beginPath();
        const size = index >= 4 ? 1.8 : 1;
        bucket.forEach((point) => {
          ctx.moveTo(point.x + size, point.y);
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        });
        ctx.fill();
      });
      hubs.forEach((index) => {
        const point = projected[index];
        if (
          point.z < -0.25 ||
          point.x < -20 ||
          point.x > width + 20 ||
          point.y < -20 ||
          point.y > height + 20
        )
          return;
        const depth = (point.z + 1) / 2;
        glow(point.x, point.y, 15, depth * (0.35 + energy * 0.08));
        ctx.fillStyle = color(0.5 + depth * 0.5);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = color(0.09);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY,
        radius * 1.23,
        radius * 0.34,
        -0.4 + progress * 0.07,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    function animate(time) {
      // Recheck before scheduling: preference/visibility events may arrive
      // while a frame is already queued by the browser.
      if (motion.matches || document.hidden) {
        syncAnimation();
        return;
      }
      frame = requestAnimationFrame(animate);
      if (coarse.matches && previousTime && time - previousTime < 30) return;
      const delta = Math.min(time - (previousTime || time), 80);
      previousTime = time;
      const smoothing = 1 - Math.exp(-delta / 180);
      const paletteSmoothing = 1 - Math.exp(-delta / 650);
      const energy = Math.min(
        Math.abs(targetScroll - scroll) / Math.max(height * 0.3, 1),
        1,
      );
      scroll = mix(scroll, targetScroll, smoothing);
      pointer.x = mix(pointer.x, targetPointer.x, smoothing);
      pointer.y = mix(pointer.y, targetPointer.y, smoothing);
      const section = activeSection();
      caseExpansion = mix(
        caseExpansion,
        expansionAt(scroll + height * 0.5),
        smoothing,
      );
      tint = tint.map((channel, index) =>
        mix(channel, section.tint[index], paletteSmoothing),
      );
      rotation += delta * 0.000022;
      phase += delta * 0.001;
      draw(energy);
    }
    function syncAnimation() {
      cancelAnimationFrame(frame);
      previousTime = 0;
      if (document.hidden) return;
      if (motion.matches) {
        scroll = targetScroll;
        pointer = { x: 0, y: 0 };
        const section = activeSection();
        tint = [...section.tint];
        caseExpansion = expansionAt(scroll + height * 0.5);
        draw(0);
      } else frame = requestAnimationFrame(animate);
    }
    window.addEventListener(
      "scroll",
      () => {
        if (!motion.matches) targetScroll = window.scrollY;
      },
      { passive: true },
    );
    window.addEventListener(
      "pointermove",
      (event) => {
        if (motion.matches || coarse.matches || event.pointerType === "touch")
          return;
        targetPointer = {
          x: (event.clientX / width - 0.5) * 2,
          y: (event.clientY / height - 0.5) * 2,
        };
      },
      { passive: true },
    );
    document.documentElement.addEventListener("pointerleave", () => {
      targetPointer = { x: 0, y: 0 };
    });
    new ResizeObserver(resize).observe(canvas);
    new ResizeObserver(measureSections).observe(document.querySelector("main"));
    motion.addEventListener("change", () => {
      targetScroll = window.scrollY;
      syncAnimation();
    });
    document.addEventListener("visibilitychange", syncAnimation);
    document.fonts?.ready.then(measureSections);
    resize();
    syncAnimation();
  } catch (error) {
    console.warn("Background animation unavailable", error);
  }
})();
