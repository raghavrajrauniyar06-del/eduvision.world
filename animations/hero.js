/* University Hero Entrance Animations Module */
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.innerWidth < 768;
  
  // 1. Text cycling (for course details)
  const heroText = document.getElementById('heroCourseName');
  if (heroText) {
    const originalText = heroText.textContent.trim() || 'Your Future';
    const cycleWords = [originalText, "Management", "Success", "Excellence", "Leadership"];
    let cycleIndex = 0;
    setTimeout(() => {
      setInterval(() => {
        cycleIndex = (cycleIndex + 1) % cycleWords.length;
        gsap.to(heroText, {
          y: -15,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            heroText.textContent = cycleWords[cycleIndex];
            gsap.fromTo(heroText, { y: 15, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
          }
        });
      }, 3500);
    }, 2000);
  }

  // 2. Cinematic Hero Reveal
  const heroContainers = document.querySelectorAll('.hero-banner');
  heroContainers.forEach(container => {
    const elements = container.querySelectorAll('h1, p, .btn, .hero-tag, .hero-btns a, .nav-cta');
    if (elements.length > 0) {
      // Sync GSAP with the native #intro sequence if it exists on the page
      const hasIntro = document.getElementById('intro');
      const delayTime = hasIntro ? 3.2 : 0.2;
      
      gsap.from(elements, {
        y: isMobile ? 40 : 60,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        delay: delayTime
      });
    }
  });
});
