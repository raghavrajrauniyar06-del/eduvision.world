/* University Form Submission Logic Module */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('courseForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      if (btn) {
        btn.textContent = '⏳ Submitting...';
        btn.disabled = true;
      }
      const data = new FormData(form);
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        if (res.ok) {
          form.style.display = 'none';
          const successEl = document.getElementById('formSuccess');
          if (successEl) {
            successEl.style.display = 'block';
          }
        } else {
          if (btn) {
            btn.textContent = 'Get Admission Guidance';
            btn.disabled = false;
          }
          alert('Something went wrong. Please try again or contact us on WhatsApp.');
        }
      } catch (err) {
        if (btn) {
          btn.textContent = 'Get Admission Guidance';
          btn.disabled = false;
        }
        alert('Network error. Please try again.');
      }
    });
  }
});
