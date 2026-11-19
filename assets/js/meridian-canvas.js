/* ==========================================================================
   RELICMAZE — Procedural Meridian Sky, Stepped Pyramid & Astrolabe Canvas
   Inspired directly by Game/Ui/TitleArt.cs & TitleSky in RelicMaze
   ========================================================================== */
(function () {
  const canvas = document.getElementById("meridian-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let scrollProgress = 0;

  const STAR_COUNT = 84;
  const MOTE_COUNT = 52;
  const stars = [];
  const motes = [];
  let shooter = { active: false, x0: 0, y0: 0, x1: 0, y1: 0, t: 0, nextAt: 2.5 };

  function seededRandom(seed) {
    let s = seed % 2147483647;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const rand = seededRandom(4242);
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      u: rand(),
      v: rand() * 0.88,
      size: 1.2 + rand() * 2.6,
      rate: 0.35 + rand() * 1.25,
      phase: rand() * Math.PI * 2,
      kind: i % 4 === 0 ? "gold" : i % 5 === 0 ? "cyan" : "white",
      fourPoint: i % 6 === 0,
    });
  }
  for (let i = 0; i < MOTE_COUNT; i++) {
    motes.push({
      u: rand(),
      v: rand(),
      speed: 0.012 + rand() * 0.028,
      drift: (rand() - 0.5) * 0.015,
      size: 1 + rand() * 2.2,
      phase: rand() * Math.PI * 2,
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(420, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "mousemove",
    (e) => {
      targetX = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 28;
      targetY = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 18;
    },
    { passive: true }
  );
  window.addEventListener(
    "scroll",
    () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    },
    { passive: true }
  );

  resize();

  function isStill() {
    return (
      document.body.classList.contains("reduced-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function drawFourPointStar(cx, cy, r, rot, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI / 4) * k;
      const rad = k % 2 === 0 ? r : r * 0.28;
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  let lastTs = performance.now();
  let clock = 2.2;
  let heroVisible = true;
  let rafId = 0;

  function scheduleRender() {
    if (!rafId && heroVisible && !document.hidden) {
      lastTs = performance.now();
      rafId = requestAnimationFrame(render);
    }
  }

  if ("IntersectionObserver" in window && canvas.parentElement) {
    const heroIo = new IntersectionObserver(
      (entries) => {
        heroVisible = entries.some((entry) => entry.isIntersecting);
        if (heroVisible) scheduleRender();
      },
      { threshold: 0 }
    );
    heroIo.observe(canvas.parentElement);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleRender();
  });

  function render(now) {
    rafId = 0;
    if (!heroVisible || document.hidden) return;
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    const still = isStill();
    const clearView = document.body.classList.contains("clear-view");

    if (!still) {
      clock += dt;
      mouseX += (targetX - mouseX) * 0.06;
      mouseY += (targetY - mouseY) * 0.06;
    } else {
      mouseX = 0;
      mouseY = 0;
    }

    ctx.clearRect(0, 0, width, height);
    if (clearView) {
      scheduleRender();
      return;
    }

    const rtl = document.documentElement.dir === "rtl";
    const monumentX = (rtl ? width * 0.27 : width * 0.73) + mouseX * 0.65;
    const monumentY = height * 0.54 + mouseY * 0.55;
    const ringRadius = Math.min(width, height) * 0.34;

    // 1. Vertical Meridian Light Beam rising from Pyramid Apex
    const beamGrad = ctx.createLinearGradient(monumentX, height, monumentX, 0);
    beamGrad.addColorStop(0, "rgba(255, 200, 92, 0.14)");
    beamGrad.addColorStop(0.5, "rgba(86, 246, 234, 0.09)");
    beamGrad.addColorStop(1, "rgba(86, 246, 234, 0.0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(monumentX - ringRadius * 0.34, height);
    ctx.lineTo(monumentX - ringRadius * 0.16, 0);
    ctx.lineTo(monumentX + ringRadius * 0.16, 0);
    ctx.lineTo(monumentX + ringRadius * 0.34, height);
    ctx.closePath();
    ctx.fill();

    // 2. Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = still ? 0.65 : 0.5 + 0.5 * Math.sin(clock * s.rate * Math.PI * 2 + s.phase);
      const sx = s.u * width + mouseX * (0.15 + s.size * 0.04);
      const sy = s.v * height + mouseY * (0.15 + s.size * 0.04);
      const alpha = 0.2 + 0.65 * twinkle;
      const col =
        s.kind === "gold"
          ? `rgba(255, 218, 128, ${alpha})`
          : s.kind === "cyan"
          ? `rgba(110, 248, 238, ${alpha})`
          : `rgba(225, 232, 255, ${alpha})`;

      if (s.fourPoint) {
        drawFourPointStar(sx, sy, s.size * 2.3, still ? 0 : clock * 0.18, col);
      } else {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Shooting Star
    if (!still) {
      if (!shooter.active && clock >= shooter.nextAt) {
        shooter.active = true;
        shooter.t = 0;
        shooter.x0 = width * (0.15 + Math.random() * 0.65);
        shooter.y0 = height * (0.06 + Math.random() * 0.25);
        const dir = rtl ? -1 : 1;
        shooter.x1 = shooter.x0 + dir * (220 + Math.random() * 180);
        shooter.y1 = shooter.y0 + 110 + Math.random() * 90;
      }
      if (shooter.active) {
        shooter.t += dt / 1.15;
        if (shooter.t >= 1) {
          shooter.active = false;
          shooter.nextAt = clock + 5 + Math.random() * 6;
        } else {
          const u = shooter.t;
          const glow = Math.sin(u * Math.PI);
          const hx = shooter.x0 + (shooter.x1 - shooter.x0) * u;
          const hy = shooter.y0 + (shooter.y1 - shooter.y0) * u;
          const dx = shooter.x0 - shooter.x1;
          const dy = shooter.y0 - shooter.y1;
          const len = Math.hypot(dx, dy) || 1;
          const tx = hx + (dx / len) * 130;
          const ty = hy + (dy / len) * 130;
          const sg = ctx.createLinearGradient(hx, hy, tx, ty);
          sg.addColorStop(0, `rgba(255, 246, 210, ${0.9 * glow})`);
          sg.addColorStop(1, "rgba(255, 212, 107, 0)");
          ctx.strokeStyle = sg;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }
    }

    // 4. Concentric Meridian Astrolabe Rings + 9 Sigil Sockets (lit by scroll!)
    ctx.save();
    ctx.translate(monumentX, monumentY);

    // Outer Gold Ring
    ctx.strokeStyle = "rgba(255, 212, 107, 0.28)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Cyan Ring
    ctx.strokeStyle = "rgba(86, 246, 234, 0.26)";
    ctx.lineWidth = 1.1;
    ctx.setLineDash([8, 6]);
    ctx.save();
    ctx.rotate(still ? 0.3 : -clock * 0.05);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.setLineDash([]);

    // 9 Sigil Sockets orbiting slowly; scrollProgress lights up 1..9!
    const litCount = Math.max(3, Math.min(9, Math.ceil(scrollProgress * 9 + 2)));
    const baseRot = still ? 0 : clock * 0.045;
    for (let s = 0; s < 9; s++) {
      const ang = baseRot - Math.PI / 2 + (s / 9) * Math.PI * 2;
      const sx = Math.cos(ang) * ringRadius;
      const sy = Math.sin(ang) * ringRadius;
      const isLit = s < litCount;
      if (isLit) {
        const g = ctx.createRadialGradient(sx, sy, 1, sx, sy, 15);
        g.addColorStop(0, s % 3 === 0 ? "rgba(86, 246, 234, 0.9)" : "rgba(255, 216, 115, 0.9)");
        g.addColorStop(1, "rgba(255, 212, 107, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = isLit ? (s % 3 === 0 ? "#56f6ea" : "#ffd46b") : "rgba(18, 22, 38, 0.9)";
      ctx.strokeStyle = "rgba(255, 212, 107, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Subtle Stepped Pyramid Silhouette at Center
    const pyrW = ringRadius * 1.15;
    const pyrH = ringRadius * 0.85;
    const steps = 7;
    for (let st = 0; st < steps; st++) {
      const t0 = st / steps;
      const t1 = (st + 1) / steps;
      const w0 = pyrW * (0.2 + 0.8 * t0);
      const w1 = pyrW * (0.2 + 0.8 * t1);
      const y0 = -pyrH * 0.35 + pyrH * t0;
      const y1 = -pyrH * 0.35 + pyrH * t1 - 2;
      ctx.fillStyle = st === 0 ? "rgba(255, 212, 107, 0.22)" : `rgba(165, 112, 58, ${0.09 + st * 0.012})`;
      ctx.strokeStyle = "rgba(255, 212, 107, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w0 / 2, y0);
      ctx.lineTo(w0 / 2, y0);
      ctx.lineTo(w1 / 2, y1);
      ctx.lineTo(-w1 / 2, y1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Capstone Cyan Diamond
    ctx.save();
    ctx.translate(0, -pyrH * 0.28);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "rgba(86, 246, 234, 0.72)";
    ctx.fillRect(-6, -6, 12, 12);
    ctx.restore();

    ctx.restore();

    // 5. Rising Lantern Dust Motes
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      if (!still) {
        m.v -= m.speed * dt;
        m.u += m.drift * dt;
        if (m.v < -0.02) {
          m.v = 1.02;
          m.u = Math.random();
        }
      }
      const mx = ((m.u % 1) + 1) % 1 * width;
      const my = m.v * height;
      const pulse = 0.35 + 0.45 * Math.sin(clock * 1.6 + m.phase);
      ctx.fillStyle = `rgba(255, 214, 124, ${pulse * 0.45})`;
      ctx.beginPath();
      ctx.arc(mx, my, m.size, 0, Math.PI * 2);
      ctx.fill();
    }

    scheduleRender();
  }

  scheduleRender();
})();
