/* Interactive Magnetic Hover Buttons Animation Module */
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.innerWidth < 768;
  if (isMobile) return; // Disable on mobile for UX/performance

  const buttons = document.querySelectorAll('.btn-apply-nav, .nav-cta, .btn-primary, .btn-submit, .btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const bRect = btn.getBoundingClientRect();
      if (bRect.width < 60 || bRect.height < 30) return; // Skip small elements

      const centerX = bRect.left + bRect.width / 2;
      const centerY = bRect.top + bRect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < (bRect.width / 2) + 40) {
        gsap.to(btn, { x: distX * 0.3, y: distY * 0.3, duration: 0.4, ease: 'power3.out' });
      } else {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
    });
  });
});
