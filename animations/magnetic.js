/* Universal 120Hz Mobile & Desktop Magnetic Animation Engine */
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn-apply-nav, .nav-cta, .btn-primary, .btn-submit, .btn, .crs-btn');

  buttons.forEach(btn => {
    let rect = null;
    let ticking = false;

    function updateRect() {
      rect = btn.getBoundingClientRect();
    }

    btn.addEventListener('mouseenter', updateRect, { passive: true });
    btn.addEventListener('touchstart', updateRect, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });

    function handleMove(clientX, clientY) {
      if (!rect) rect = btn.getBoundingClientRect();
      if (!rect || rect.width < 40 || rect.height < 20) return;

      if (!ticking) {
        requestAnimationFrame(() => {
          if (!rect) { ticking = false; return; }
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distX = clientX - centerX;
          const distY = clientY - centerY;
          const distance = Math.hypot(distX, distY);

          if (distance < (rect.width / 2) + 35) {
            gsap.to(btn, { x: distX * 0.22, y: distY * 0.22, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
          } else {
            gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    btn.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY), { passive: true });
    btn.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function reset() {
      rect = null;
      gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    }

    btn.addEventListener('mouseleave', reset, { passive: true });
    btn.addEventListener('touchend', reset, { passive: true });
    btn.addEventListener('touchcancel', reset, { passive: true });
  });
});
