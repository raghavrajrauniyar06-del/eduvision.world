/* Stat Counter Count-up GSAP Animation Module */
document.addEventListener('DOMContentLoaded', () => {
  const statRegex = /^(\d{1,3}(?:,\d{3})*|\d+)([KkMm%]?\+?)$/;

  function scanForStats(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      const match = text.match(statRegex);
      
      // Filter out years (1900 - 2099)
      if (match && !(text.length === 4 && parseInt(text) >= 1900 && parseInt(text) <= 2099 && !match[2])) {
        const parent = node.parentNode;
        if(parent && parent.nodeName !== 'SCRIPT' && parent.nodeName !== 'STYLE' && parent.nodeName !== 'SPAN' && !parent.classList.contains('gsap-stat-wrapped')) {
          const span = document.createElement('span');
          span.classList.add('gsap-stat-wrapped');
          span.dataset.target = parseInt(match[1].replace(/,/g, ''));
          span.dataset.suffix = match[2] || '';
          span.textContent = '0' + span.dataset.suffix;
          parent.replaceChild(span, node);
          
          gsap.to(span, {
            scrollTrigger: {
              trigger: span,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            },
            innerHTML: span.dataset.target,
            duration: 2,
            ease: 'power3.out',
            snap: { innerHTML: 1 },
            onUpdate: function() {
              span.textContent = Math.round(this.targets()[0].innerHTML).toLocaleString('en-IN') + span.dataset.suffix;
            }
          });
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (['SCRIPT', 'STYLE'].includes(node.nodeName)) return;
      Array.from(node.childNodes).forEach(scanForStats);
    }
  }

  const targetSections = document.querySelectorAll('.feature-box, .stat-box, .svc-body, .highlight-box, .partner-card, .crs-card');
  targetSections.forEach(section => {
    scanForStats(section);
  });
});
