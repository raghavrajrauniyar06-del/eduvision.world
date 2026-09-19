/* ══════════════════════════════════════════════════════════════════════════════
   EDUVISION 2.0 — UNIVERSITY ENQUIRY FORM HANDLER (NATIVE CRM INTEGRATION)
   ══════════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('courseForm');
  if (!form) return;

  // Remove legacy Web3Forms inputs if present
  const legacyInputs = form.querySelectorAll('input[name="access_key"], input[name="subject"], input[name="from_name"], input[name="botcheck"]');
  legacyInputs.forEach(el => el.remove());

  // Remove web3forms action attribute
  if (form.getAttribute('action') && form.getAttribute('action').includes('web3forms')) {
    form.removeAttribute('action');
    form.removeAttribute('method');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn') || form.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : 'Get Admission Guidance';

    if (btn) {
      btn.textContent = '⏳ Submitting...';
      btn.disabled = true;
    }

    const nameInput = form.querySelector('[name="name"], [name="full_name"], #name');
    const phoneInput = form.querySelector('[name="phone"], [name="mobile"], #phone');
    const emailInput = form.querySelector('[name="email"], #email');
    const stateInput = form.querySelector('[name="state"], #state');
    const courseInput = form.querySelector('[name="course"], #course');
    const univInput = form.querySelector('[name="university"], #university');

    // Extract university name from title / page if not explicitly in a hidden field
    let universityName = univInput ? univInput.value : '';
    if (!universityName) {
      const pageTitle = document.title || '';
      const h1 = document.querySelector('h1')?.textContent || '';
      universityName = h1 || pageTitle.split('|')[0].trim();
    }

    const payload = {
      full_name: nameInput ? nameInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      state: stateInput ? stateInput.value.trim() : '',
      course_name: courseInput ? courseInput.value.trim() : '',
      university_name: universityName,
      form_type: 'university_enquiry'
    };

    try {
      if (window.EduVisionWebForm && typeof window.EduVisionWebForm.submit === 'function') {
        const res = await window.EduVisionWebForm.submit(payload, { formType: 'university_enquiry' });
        form.style.display = 'none';
        const successEl = document.getElementById('formSuccess');
        if (successEl) {
          successEl.style.display = 'block';
        } else {
          alert(res.message || '✅ Enquiry submitted successfully! Our expert counsellor will connect with you soon.');
        }
      } else {
        throw new Error('Form engine unavailable');
      }
    } catch (err) {
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
      alert('❌ ' + (err.message || 'Something went wrong. Please try again or contact us on WhatsApp.'));
    }
  });
});
