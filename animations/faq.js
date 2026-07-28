/* Collapsible FAQ Accordion GSAP Animation Module */
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item, .accordion-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question, .accordion-header');
    const answer = item.querySelector('.faq-answer, .accordion-body');
    const icon = item.querySelector('.icon, .indicator');
    
    if (question && answer) {
      gsap.set(answer, { height: 0, opacity: 0, overflow: 'hidden' });
      let isOpen = false;
      
      question.addEventListener('click', () => {
        isOpen = !isOpen;
        
        if (isOpen) {
          item.classList.add('is-open');
          gsap.to(answer, {
            height: 'auto',
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out'
          });
          if (icon) {
            gsap.to(icon, { rotation: 45, duration: 0.3, ease: 'power2.out' });
          }
        } else {
          item.classList.remove('is-open');
          gsap.to(answer, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
          });
          if (icon) {
            gsap.to(icon, { rotation: 0, duration: 0.3, ease: 'power2.in' });
          }
        }
      });
    }
  });
});
