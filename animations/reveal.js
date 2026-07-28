/* ScrollTrigger Staggered Card, Placement, Salary Bar & 3D Interactive Motion Module */
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
  
  // 1. Dynamic 3D Kinetic Touch & Mouse Spotlight Follower
  let spotlight = document.createElement('div');
  spotlight.className = 'touch-spotlight';
  document.body.appendChild(spotlight);

  function moveSpotlight(x, y) {
    spotlight.style.opacity = '1';
    spotlight.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  window.addEventListener('mousemove', (e) => {
    moveSpotlight(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      moveSpotlight(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => { spotlight.style.opacity = '0'; });
  window.addEventListener('touchend', () => {
    setTimeout(() => { spotlight.style.opacity = '0'; }, 1000);
  });

  // 2. Dedicated Scroll Animation for Expected Salary by Role Bars
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
              
              setTimeout(() => {
                fill.style.transition = `width 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`;
                fill.style.width = targetWidth;
              }, 50 + index * 30);
            });
          }
        });
      }, { rootMargin: isMobile ? '50px 0px 50px 0px' : '0px 0px -40px 0px', threshold: 0.05 });
      
      salaryContainers.forEach(c => barObserver.observe(c));
    }
  }

  setupSalaryBarAnimations();
  setTimeout(setupSalaryBarAnimations, 300);
  setTimeout(setupSalaryBarAnimations, 800);

  // 3. High-Performance Intersection Observer for Mobile & Desktop Reveal Animations
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, #salaryBars, .salary-bars, .salary-section, .salary-grid, .career-card, .scope-card, .stat-card, .partner-card, .svc-card, .why-card, .feature-box, .about-item, .skill-chip, .fee-table-scroll, .uni-card, .elig-card, .faq-item, .hero-stat, .lead-form, #uniSecRegular a, #uniSecRegular div[onclick], #uniSecOnline a, #uniSecOnline div[onclick], #uniSecDistance a, #uniSecDistance div[onclick]');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: isMobile ? '80px 0px 80px 0px' : '0px 0px -40px 0px',
      threshold: isMobile ? 0.02 : 0.08
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active', 'in-view');
        }
      });
    }, observerOptions);
    
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active', 'in-view'));
  }

  // 4. 3D Spatial Depth Tilt & Motion Response (Laptop & Phone Identical)
  const tiltCards = document.querySelectorAll('.partner-card, .why-card, .svc-card, .career-card, .scope-card, .stat-card, .uni-card, .elig-card, #uniSecRegular a, #uniSecRegular div[onclick], #uniSecOnline a, #uniSecOnline div[onclick], #uniSecDistance a, #uniSecDistance div[onclick]');
  
  tiltCards.forEach(card => {
    // 3D Spatial Mouse Tilt (Desktop)
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // 10 deg 3D tilt
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.035)`;
      card.style.borderColor = 'rgba(201, 147, 42, 0.9)';
      card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5), 0 0 25px rgba(201,147,42,0.4)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.borderColor = '';
      card.style.boxShadow = '';
    });

    // 📱 Touch Screen 3D Tactile Bounce & Glowing Haptic Press
    card.addEventListener('touchstart', (e) => {
      card.style.transform = 'perspective(800px) scale(0.95) translateY(3px) rotateX(4deg)';
      card.style.borderColor = 'var(--gold, #c9932a)';
      card.style.boxShadow = '0 4px 18px rgba(201, 147, 42, 0.5)';
    }, { passive: true });

    card.addEventListener('touchend', () => {
      card.style.transform = 'perspective(800px) scale(1.05) translateY(-6px) rotateX(-4deg)';
      card.style.borderColor = 'rgba(201, 147, 42, 0.95)';
      card.style.boxShadow = '0 14px 32px rgba(0,0,0,0.45), 0 0 22px rgba(201,147,42,0.4)';
      setTimeout(() => {
        card.style.transform = '';
        card.style.borderColor = '';
        card.style.boxShadow = '';
      }, 350);
    }, { passive: true });
  });

  // 5. GSAP ScrollTrigger Fallback & Stagger Setup
  if (typeof gsap !== 'undefined') {
    const cardContainers = document.querySelectorAll('.slide, .crs-track, .features-grid, .partners-grid, .services-grid, .uni-stat-grid, .about-grid, .scope-grid, .careers-list');
    
    cardContainers.forEach(container => {
      let cards = container.querySelectorAll('.crs-card, .feature-box, .partner-card, .svc-card, .slide-title, .slide-desc, .highlight-box, .fee-blocks, .uni-stat, .career-card, .scope-card, .stat-card');
      
      if (cards.length > 0) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: container,
            start: isMobile ? 'top 92%' : 'top 85%',
            toggleActions: 'play none none reverse'
          },
          y: isMobile ? 20 : 45,
          autoAlpha: 0,
          duration: isMobile ? 0.6 : 0.9,
          stagger: isMobile ? 0.05 : 0.08,
          ease: 'power3.out'
        });
      }

      const listItems = container.querySelectorAll('.slide-list li, .checklist li, .skill-chip');
      if (listItems.length > 0) {
        gsap.from(listItems, {
          scrollTrigger: {
            trigger: container,
            start: isMobile ? 'top 92%' : 'top 80%',
            toggleActions: 'play none none reverse'
          },
          x: isMobile ? -10 : -25,
          autoAlpha: 0,
          duration: isMobile ? 0.5 : 0.7,
          stagger: 0.04,
          ease: 'power3.out'
        });
      }
    });
  }
});
