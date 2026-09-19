/* Dynamic 120Hz Refresh-Rate ProMotion Hero Engine */
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.innerWidth < 768;
  
  // 1. 120Hz Text cycling for hero course name
  const heroText = document.getElementById('heroCourseName');
  if (heroText) {
    const originalText = heroText.textContent.trim() || 'Your Future';
    const cycleWords = [originalText, "Management", "Success", "Excellence", "Leadership"];
    let cycleIndex = 0;
    setInterval(() => {
      cycleIndex = (cycleIndex + 1) % cycleWords.length;
      if (typeof gsap !== 'undefined') {
        gsap.to(heroText, {
          y: -12,
          opacity: 0,
          duration: 0.35,
          ease: 'power3.in',
          onComplete: () => {
            heroText.textContent = cycleWords[cycleIndex];
            gsap.to(heroText, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
          }
        });
      } else {
        heroText.textContent = cycleWords[cycleIndex];
      }
    }, 3500);
  }

  // 2. ProMotion Hero Entrance Animation
  const heroContainers = document.querySelectorAll('.hero-banner');
  heroContainers.forEach(container => {
    const elements = container.querySelectorAll('h1, p, .btn, .hero-tag, .hero-btns a, .nav-cta');
    if (elements.length > 0 && typeof gsap !== 'undefined') {
      gsap.from(elements, {
        y: isMobile ? 25 : 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out'
      });
    }
  });

  const heroCard = document.querySelector('.hero-card');
  if (heroCard && typeof gsap !== 'undefined') {
    gsap.from(heroCard, {
      y: isMobile ? 30 : 50,
      opacity: 0,
      scale: 0.95,
      duration: 1.1,
      delay: 0.2,
      ease: 'power3.out'
    });
  }

  // 3. 120Hz Dynamic Render Canvas (Auto-Adapts to Display Refresh Rate)
  initHero120HzCanvas();
});

function initHero120HzCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';

  let w = 0, h = 0;
  let isCanvasVisible = true;
  let animationFrameId = null;

  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible && !animationFrameId) {
          lastTimeStamp = performance.now();
          animate(lastTimeStamp);
        }
      });
    }, { threshold: 0.05 });
    heroObserver.observe(canvas.parentElement || canvas);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width || window.innerWidth;
    h = rect.height || window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function createCrystal(xPct, yPct, size, rotSpeed, floatSpeed, opacity, isMain) {
    return {
      xPct, yPct, size, rotSpeed, floatSpeed, opacity, isMain,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      floatOffset: Math.random() * Math.PI * 2,
    };
  }

  const isMobile = window.innerWidth < 768;
  const crystals = [
    createCrystal(isMobile ? 0.5 : 0.58, isMobile ? 0.44 : 0.48, isMobile ? 75 : 115, 0.0004, 0.0012, 0.9, true),
    createCrystal(0.10, 0.28, 42, -0.0003, 0.001, 0.5, false),
    createCrystal(0.06, 0.72, 50, 0.0004, 0.0014, 0.55, false),
    createCrystal(0.86, 0.18, 46, 0.0003, 0.0012, 0.5, false),
    createCrystal(0.93, 0.68, 40, -0.0004, 0.0016, 0.5, false)
  ];

  // Particle Dust
  const particleCount = isMobile ? 20 : 40;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2 + 0.8,
    speedY: Math.random() * 0.00003 + 0.00001,
    speedX: (Math.random() - 0.5) * 0.000015,
    alpha: Math.random() * 0.6 + 0.2,
    pulseSpeed: Math.random() * 0.002 + 0.0005,
    pulseOffset: Math.random() * Math.PI * 2
  }));

  function render3DDiamond(cx, cy, radiusY, radiusX, rotY, rotX, alpha, isMain) {
    ctx.save();
    ctx.translate(cx, cy);

    const hHalf = radiusY;
    const rEquatorX = radiusX;
    const rEquatorZ = radiusX * 0.65;

    const rawVerts = [
      { x: 0, y: -hHalf, z: 0 },
      { x: 0, y: hHalf, z: 0 },
      { x: rEquatorX, y: 0, z: 0 },
      { x: 0, y: 0, z: rEquatorZ },
      { x: -rEquatorX, y: 0, z: 0 },
      { x: 0, y: 0, z: -rEquatorZ }
    ];

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const projected = rawVerts.map(v => {
      let x1 = v.x * cosY + v.z * sinY;
      let z1 = -v.x * sinY + v.z * cosY;
      let y2 = v.y * cosX - z1 * sinX;
      let z2 = v.y * sinX + z1 * cosX;
      return { x: x1, y: y2, z: z2 };
    });

    const [top, bot, right, front, left, back] = projected;

    const facets = [
      { pts: [top, right, front] },
      { pts: [top, front, left] },
      { pts: [top, left, back] },
      { pts: [top, back, right] },
      { pts: [bot, front, right] },
      { pts: [bot, left, front] },
      { pts: [bot, back, left] },
      { pts: [bot, right, back] }
    ];

    facets.forEach(f => {
      f.avgZ = (f.pts[0].z + f.pts[1].z + f.pts[2].z) / 3;
      const p0 = f.pts[0], p1 = f.pts[1], p2 = f.pts[2];
      const ax = p1.x - p0.x, ay = p1.y - p0.y, az = p1.z - p0.z;
      const bx = p2.x - p0.x, by = p2.y - p0.y, bz = p2.z - p0.z;
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      const len = Math.hypot(nx, ny, nz) || 1;
      const dot = (nx * 0.35 + ny * -0.65 + nz * 0.67) / len;
      f.light = Math.max(0.12, (dot + 1) / 2);
    });

    facets.sort((a, b) => a.avgZ - b.avgZ);

    facets.forEach(f => {
      if (f.avgZ < -rEquatorX * 0.95) return;

      ctx.beginPath();
      ctx.moveTo(f.pts[0].x, f.pts[0].y);
      ctx.lineTo(f.pts[1].x, f.pts[1].y);
      ctx.lineTo(f.pts[2].x, f.pts[2].y);
      ctx.closePath();

      const alphaVal = alpha * (0.35 + f.light * 0.5);
      ctx.fillStyle = `rgba(245, 215, 130, ${alphaVal})`;
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.55})`;
      ctx.lineWidth = isMain ? 1 : 0.6;
      ctx.stroke();
    });

    ctx.restore();
  }

  let lastTimeStamp = performance.now();
  let totalTime = 0;

  function animate(now) {
    if (!isCanvasVisible) {
      animationFrameId = null;
      return;
    }

    const delta = Math.min(now - lastTimeStamp, 33); // Cap at 33ms to avoid jumps
    lastTimeStamp = now;
    totalTime += delta;

    ctx.clearRect(0, 0, w, h);

    // Particles Delta Motion (Butter Smooth at 120Hz)
    particles.forEach(p => {
      p.y -= p.speedY * delta;
      p.x += p.speedX * delta;
      if (p.y < -0.05) p.y = 1.05;
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      const px = p.x * w;
      const py = p.y * h;

      ctx.fillStyle = `rgba(247, 213, 119, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3D Crystals Delta Motion (Butter Smooth at 120Hz)
    crystals.forEach(c => {
      c.rotY += c.rotSpeed * delta;
      c.rotX += c.rotSpeed * 0.4 * delta;
      const floatY = Math.sin(totalTime * c.floatSpeed + c.floatOffset) * (c.isMain ? 12 : 6);

      const cx = w * c.xPct;
      const cy = h * c.yPct + floatY;
      const radiusY = c.size;
      const radiusX = c.size * 0.55;

      render3DDiamond(cx, cy, radiusY, radiusX, c.rotY, c.rotX, c.opacity, c.isMain);
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  lastTimeStamp = performance.now();
  animate(lastTimeStamp);
}
