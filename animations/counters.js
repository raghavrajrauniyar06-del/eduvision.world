/* Ultra-Fast 120Hz Lightweight Stat Counter Module */
document.addEventListener('DOMContentLoaded', () => {
  const counterElements = document.querySelectorAll('.stat-num, .counter-num, [data-count]');
  if (counterElements.length === 0 || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.countDone) return;
        el.dataset.countDone = "true";

        const targetText = el.textContent.trim();
        const numMatch = targetText.match(/\d+/);
        if (!numMatch) return;

        const targetNum = parseInt(numMatch[0], 10);
        const prefix = targetText.substring(0, targetText.indexOf(numMatch[0]));
        const suffix = targetText.substring(targetText.indexOf(numMatch[0]) + numMatch[0].length);

        let startTime = null;
        const duration = 1200; // ms

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const current = Math.floor(progress * targetNum);
          el.textContent = prefix + current.toLocaleString('en-IN') + suffix;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = targetText;
          }
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '100px 0px', threshold: 0.1 });

  counterElements.forEach(el => observer.observe(el));
});
