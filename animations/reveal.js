/* Ultra-Fast 60FPS Scroll & Intersection Animation Engine */
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  // 1. Dedicated Scroll Animation for Salary Bars
  function setupSalaryBarAnimations() {
    const salaryContainers = document.querySelectorAll('#salaryBars, .salary-bars, .salary-section');
    
    if (salaryContainers.length > 0 && 'IntersectionObserver' in window) {
      const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll('.salary-bar-fill');
            fills.forEach((fill, index) => {
              if (fill.dataset.barDone) return;
              fill.dataset.barDone = "true";
              
              const targetWidth = fill.dataset.percent ? fill.dataset.percent + '%' : (fill.style.width && fill.style.width !== '0%' ? fill.style.width : '100%');
              
              fill.style.width = '0%';
              fill.style.transition = 'none';
              
              requestAnimationFrame(() => {
                fill.style.transition = `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.12}s`;
                fill.style.width = targetWidth;
              });
            });
          }
        });
      }, { rootMargin: '40px 0px', threshold: 0.05 });
      
      salaryContainers.forEach(c => barObserver.observe(c));
    }
  }

  setupSalaryBarAnimations();
  setTimeout(setupSalaryBarAnimations, 300);

  // 2. High-Performance Lightweight Intersection Observer for Reveal Animations
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, #salaryBars, .salary-bars, .salary-section, .career-card, .scope-card, .stat-card, .partner-card, .svc-card, .why-card, .feature-box, .about-item, .uni-card, .elig-card');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '450px 0px 450px 0px',
      threshold: 0.01
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active', 'in-view');
          observer.unobserve(entry.target); // Unobserve once animated for maximum speed
        }
      });
    }, observerOptions);
    
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active', 'in-view'));
  }
});


/* ═══════════════════════════════════════════════════════════
   WORLD-CLASS SAAS INTERACTION ENGINE (RIPPLE, MAGNETIC, PARALLAX)
═══════════════════════════════════════════════════════════ */

// 1. Global Translucent Gold Click Ripple Engine
document.addEventListener('click', function(e) {
  var btn = e.target.closest('button, .btn-primary, .btn-secondary, .hero-btn-primary, .banner-btn-main, .banner-btn-secondary, .btn-login-submit, .btn-social, .nav-highlight-btn, .btn-cta, .uni-btn-primary, .svc-btn-primary, .filter-btn, .crs-tab, .uni-tab');
  if (!btn) return;

  var rect = btn.getBoundingClientRect();
  var size = Math.max(rect.width, rect.height);
  var x = e.clientX - rect.left - (size / 2);
  var y = e.clientY - rect.top  - (size / 2);

  var ripple = document.createElement('span');
  ripple.className = 'gold-ripple-circle';
  ripple.style.width  = size + 'px';
  ripple.style.height = size + 'px';
  ripple.style.left   = x + 'px';
  ripple.style.top    = y + 'px';

  btn.appendChild(ripple);

  setTimeout(function() {
    if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
  }, 600);
});

// 2. 120Hz ProMotion Universal 3D Card Tilt & Parallax (Mobile & Desktop)
document.addEventListener('DOMContentLoaded', function() {
  var cards = document.querySelectorAll('.partner-card, .crs-card, .why-card, .career-card, .scope-card, .svc-card');
  cards.forEach(function(card) {
    var rect = null;
    var ticking = false;

    function getRect() { rect = card.getBoundingClientRect(); }
    card.addEventListener('mouseenter', getRect, { passive: true });
    card.addEventListener('touchstart', getRect, { passive: true });
    window.addEventListener('resize', getRect, { passive: true });

    function handleMove(clientX, clientY) {
      if (!rect) rect = card.getBoundingClientRect();
      if (!ticking) {
        requestAnimationFrame(function() {
          if (!rect) { ticking = false; return; }
          var cardX = clientX - rect.left;
          var cardY = clientY - rect.top;
          var rotX = ((cardY - (rect.height / 2)) / (rect.height / 2)) * -5;
          var rotY = ((cardX - (rect.width / 2))  / (rect.width  / 2)) *  5;
          card.style.transform = 'perspective(1000px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translate3d(0, -5px, 10px)';
          ticking = false;
        });
        ticking = true;
      }
    }

    card.addEventListener('mousemove', function(e) { handleMove(e.clientX, e.clientY); }, { passive: true });
    card.addEventListener('touchmove', function(e) {
      if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function reset() {
      rect = null;
      card.style.transform = '';
    }

    card.addEventListener('mouseleave', reset, { passive: true });
    card.addEventListener('touchend', reset, { passive: true });
    card.addEventListener('touchcancel', reset, { passive: true });
  });
});

// 4. Smooth Counter Increment Engine for Stat Numbers
function animateCounters() {
  var counters = document.querySelectorAll('.stat-num, .counter-num, [data-count]');
  if (counters.length === 0 || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        if (el.dataset.countDone) return;
        el.dataset.countDone = "true";

        var targetText = el.textContent.trim();
        var numMatch = targetText.match(/\d+/);
        if (!numMatch) return;

        var targetNum = parseInt(numMatch[0], 10);
        var prefix = targetText.substring(0, targetText.indexOf(numMatch[0]));
        var suffix = targetText.substring(targetText.indexOf(numMatch[0]) + numMatch[0].length);

        var startNum = 0;
        var duration = 1400; // ms
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var current = Math.floor(progress * (targetNum - startNum) + startNum);

          el.textContent = prefix + current + suffix;
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
  }, { threshold: 0.1 });

  counters.forEach(function(c) { observer.observe(c); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', animateCounters);
} else {
  animateCounters();
}
