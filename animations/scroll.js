/* Ultra-Fast 120Hz Scroll Animations Module */
document.addEventListener('DOMContentLoaded', () => {
  if (!('IntersectionObserver' in window)) return;

  const scrollTargets = document.querySelectorAll('.slide-image, .about-image, .feature-image, #apply, .apply-section, .contact-section, #leadForm');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view', 'active');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '300px 0px', threshold: 0.05 });

  scrollTargets.forEach(el => observer.observe(el));
});
