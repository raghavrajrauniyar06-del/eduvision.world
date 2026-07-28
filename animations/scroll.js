/* Scroll Triggered Clip-path Reveals and Parallax Animations Module */
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.innerWidth < 768;

  // 1. Clip-path reveals with parallax for images
  const images = gsap.utils.toArray('.slide-image, .about-image, .feature-image');
  images.forEach(img => {
    gsap.set(img, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' });
    
    gsap.to(img, {
      scrollTrigger: {
        trigger: img,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1.4,
      ease: 'power4.inOut'
    });
    
    if (!isMobile) {
      gsap.fromTo(img,
        { backgroundPosition: '50% 100%' },
        {
          backgroundPosition: '50% 0%',
          ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      );
    }
  });
  
  // 2. Smooth Section Parallax Backgrounds
  if (!isMobile) {
    const parallaxSections = gsap.utils.toArray('.parallax-bg');
    parallaxSections.forEach(sec => {
      gsap.to(sec, {
        backgroundPosition: '50% 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // 3. Section Reveal for Form wrappers
  const applySections = gsap.utils.toArray('#apply, .apply-section, .contact-section, #leadForm');
  applySections.forEach(sec => {
    const applyElements = sec.querySelectorAll('.apply-title, .apply-subtitle, .input-group, .btn-submit, h2, p, .fgrid, .cm-form');
    const targets = applyElements.length > 0 ? applyElements : [sec];
    
    gsap.from(targets, {
      scrollTrigger: {
        trigger: sec,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      onStart: () => {
        const targetArray = Array.from(targets);
        targetArray.forEach(t => { if(t.style) t.style.setProperty('transition', 'none', 'important'); });
      },
      onComplete: () => {
        const targetArray = Array.from(targets);
        targetArray.forEach(t => { if(t.style) t.style.removeProperty('transition'); });
      }
    });
  });
});
