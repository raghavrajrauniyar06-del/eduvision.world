// ══════════════════════════════════════════════════════════════════════════════
// EDUVISION 2.0 — NATIVE SECURE WEB FORM SUBMISSION CLIENT
// PRODUCTION CLIENT ENGINE FOR INBOUND LEADS & ADMISSIONS
// ══════════════════════════════════════════════════════════════════════════════

(function(window, document) {
  'use strict';

  const SUPABASE_PROJECT_URL = 'https://ewxvqpyusveiynplzxed.supabase.co';
  const SUPABASE_ANON_KEY    = 'sb_publishable_NFUbLO9g-UTt-Z9fUuQoyw__Xrxq2IC';
  const BACKEND_API_URL      = 'http://localhost:5000/api/web-forms/submit';

  // Rate Limiting Config
  const MAX_SUBMISSIONS_PER_WINDOW = 5;
  const WINDOW_MS = 60 * 1000; // 60 seconds

  // Initialize Supabase Client if not already globally present
  let sbClient = window.sb || null;
  if (!sbClient && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      sbClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
    } catch(e) {
      console.warn('EduVisionWebForm: Could not create Supabase client:', e);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 1. UTM & ATTRIBUTION CAPTURE
  // ────────────────────────────────────────────────────────────────────────────
  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const utm = {};

    utmKeys.forEach(key => {
      const val = params.get(key);
      if (val) {
        utm[key] = val.trim();
        try { sessionStorage.setItem('eduvision_' + key, val.trim()); } catch(e) {}
      } else {
        try {
          const cached = sessionStorage.getItem('eduvision_' + key);
          if (cached) utm[key] = cached;
        } catch(e) {}
      }
    });

    return utm;
  }

  function getDeviceType() {
    const ua = navigator.userAgent || '';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. NORMALIZATION & VALIDATION
  // ────────────────────────────────────────────────────────────────────────────
  function normalizePhone(raw) {
    if (!raw) return '';
    let clean = String(raw).replace(/[^0-9]/g, '');
    if (clean.length === 12 && clean.startsWith('91')) {
      clean = clean.substring(2);
    } else if (clean.length === 11 && clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    return clean;
  }

  function normalizeEmail(raw) {
    if (!raw) return '';
    return String(raw).trim().toLowerCase();
  }

  function checkRateLimit() {
    try {
      const now = Date.now();
      const historyStr = sessionStorage.getItem('eduvision_form_timestamps');
      let history = historyStr ? JSON.parse(historyStr) : [];
      history = history.filter(t => (now - t) < WINDOW_MS);

      if (history.length >= MAX_SUBMISSIONS_PER_WINDOW) {
        return false;
      }
      history.push(now);
      sessionStorage.setItem('eduvision_form_timestamps', JSON.stringify(history));
      return true;
    } catch(e) {
      return true;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. CORE SUBMISSION METHOD
  // ────────────────────────────────────────────────────────────────────────────
  async function submitForm(payload, options = {}) {
    // 1. Rate limiting check
    if (!checkRateLimit()) {
      throw new Error('Too many submissions in a short period. Please wait a moment before trying again.');
    }

    // 2. Validation
    const fullName = (payload.full_name || payload.name || '').trim();
    if (!fullName || fullName.length < 2) {
      throw new Error('Please enter a valid full name.');
    }

    const cleanPhone = normalizePhone(payload.phone || payload.mobile || '');
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    const cleanEmail = normalizeEmail(payload.email || '');
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    // 3. Assemble clean sanitized payload
    const utm = getUtmParams();
    const finalPayload = {
      full_name: fullName,
      phone: cleanPhone,
      email: cleanEmail || null,
      course_name: (payload.course_name || payload.course || '').trim() || null,
      university_name: (payload.university_name || payload.university || '').trim() || null,
      state: (payload.state || '').trim() || null,
      city: (payload.city || '').trim() || null,
      message: (payload.message || payload.notes || '').trim() || null,
      form_type: payload.form_type || options.formType || 'general_enquiry',
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_term: utm.utm_term || null,
      utm_content: utm.utm_content || null,
      page_url: window.location.href,
      referrer_url: document.referrer || '',
      device_type: getDeviceType()
    };

    let result = null;

    // 4. Primary: Try Supabase RPC
    try {
      if (!sbClient && window.supabase && typeof window.supabase.createClient === 'function') {
        sbClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
      }

      if (sbClient && typeof sbClient.rpc === 'function') {
        const { data, error } = await sbClient.rpc('rpc_submit_web_form', { p_payload: finalPayload });
        if (error) {
          console.warn('EduVision RPC returned error, attempting REST fallback:', error);
        } else if (data) {
          result = data;
        }
      }
    } catch(rpcErr) {
      console.warn('Supabase RPC call failed:', rpcErr);
    }

    // 5. Secondary: Supabase Direct REST RPC
    if (!result) {
      try {
        const resp = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/rpc/rpc_submit_web_form`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_payload: finalPayload })
        });

        if (resp.ok) {
          result = await resp.json();
        }
      } catch(restErr) {
        console.warn('Supabase REST RPC failed:', restErr);
      }
    }

    // 6. Tertiary: Express Backend API Fallback
    if (!result) {
      try {
        const bResp = await fetch(BACKEND_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload)
        });
        if (bResp.ok) {
          result = await bResp.json();
        }
      } catch(backendErr) {
        console.warn('Backend API fallback failed:', backendErr);
      }
    }

    if (!result || !result.success) {
      throw new Error(result?.error || 'Submission could not be completed. Please try again or call our counselling desk directly.');
    }

    // 7. Instant Multi-Channel Lead Dispatch: Only to Counsellors & Team Leaders
    try {
      dispatchFormNotificationToCounsellorAndTL(finalPayload, result);
    } catch(e) {
      console.warn('Lead notification dispatch notice:', e);
    }

    return result;
  }

  async function dispatchFormNotificationToCounsellorAndTL(payload, result) {
    const tId = result?.submission_id || ('EDV-' + Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const leadRecord = {
      id: tId,
      name: payload.full_name || 'Website Inbound Lead',
      phone: payload.phone,
      interest: `${payload.course_name || 'General Admissions'}${payload.university_name ? ' — ' + payload.university_name : ''}`,
      time: `${dateStr}, ${timeStr}`,
      rawTime: Date.now(),
      status: 'Pending Callback',
      claimedBy: null,
      source: payload.form_type || 'Website Lead Form'
    };

    // 1. Sync to local storage for instant dashboard leads pickup
    try {
      let staffLeads = JSON.parse(localStorage.getItem('eduvision_team_leads') || '[]');
      staffLeads = staffLeads.filter(l => !(l.phone === payload.phone && (Date.now() - l.rawTime < 3600000)));
      staffLeads.unshift(leadRecord);
      localStorage.setItem('eduvision_team_leads', JSON.stringify(staffLeads.slice(0, 60)));
      window.dispatchEvent(new CustomEvent('eduvision_new_lead', { detail: leadRecord }));
    } catch(e){}

    // 2. Chat / Notification Dispatch: ONLY to Counsellors Hub & Team Leaders Group
    const alertText = `🚨 *NEW STUDENT FORM SUBMISSION / LEAD ALERT*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Student Name:* ${payload.full_name}\n` +
      `📞 *Mobile:* +91 ${payload.phone}\n` +
      `🎓 *Course:* ${payload.course_name || 'Not specified'}\n` +
      `🏫 *University:* ${payload.university_name || 'Partner Campuses'}\n` +
      `📍 *City/State:* ${payload.city || payload.state || 'Website'}\n` +
      `📝 *Form Type:* ${payload.form_type}\n` +
      `📋 *Ticket ID:* #${tId}\n` +
      `⏰ *Time:* ${dateStr}, ${timeStr}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ *Action Required:* Counsellor or Team Leader please call within 2 hours & claim ticket!`;

    const groupsToNotify = [
      { id: '00000000-0000-0000-0000-000000000003', target: 'COUNSELLORS_HUB' },
      { id: '00000000-0000-0000-0000-000000000001', target: 'ADMIN_TEAM_LEADER' }
    ];

    for (const grp of groupsToNotify) {
      try {
        fetch(`${SUPABASE_PROJECT_URL}/rest/v1/notifications`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            title: `📥 New Form Lead: ${payload.full_name} (+91 ${payload.phone})`,
            message: alertText,
            sender_name: 'EduVision AI Bot 🤖',
            sender_role: 'AI_ASSISTANT',
            category: 'LEAD_DISPATCH',
            group_id: grp.id,
            priority: 'high'
          })
        }).catch(()=>{});
      } catch(e){}
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. FORM BINDING & UI HANDLER
  // ────────────────────────────────────────────────────────────────────────────
  function bindForm(formSelectorOrElement, options = {}) {
    const form = typeof formSelectorOrElement === 'string'
      ? document.querySelector(formSelectorOrElement)
      : formSelectorOrElement;

    if (!form) return;

    // Prevent duplicate binding
    if (form.getAttribute('data-eduvision-bound') === 'true') return;
    form.setAttribute('data-eduvision-bound', 'true');

    // Remove any legacy Web3Forms hidden fields
    const legacyKeys = form.querySelectorAll('input[name="access_key"], input[name="subject"], input[name="from_name"], input[name="botcheck"]');
    legacyKeys.forEach(el => el.remove());

    // Remove Web3Forms action attribute
    if (form.getAttribute('action') && form.getAttribute('action').includes('web3forms')) {
      form.removeAttribute('action');
      form.removeAttribute('method');
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();

      const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.submit-btn, .btn-apply, .btn-submit');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      // Collect inputs
      const formData = new FormData(form);
      const rawPayload = {};
      formData.forEach((value, key) => {
        if (key && !key.startsWith('access_key') && !key.startsWith('botcheck')) {
          rawPayload[key] = typeof value === 'string' ? value.trim() : value;
        }
      });

      // Derive standard fields
      const payload = {
        full_name: rawPayload.name || rawPayload.full_name || rawPayload.student_name || rawPayload.fullname || '',
        phone: rawPayload.phone || rawPayload.mobile || rawPayload.contact || rawPayload.phonenumber || '',
        email: rawPayload.email || rawPayload.mail || '',
        course_name: rawPayload.course || rawPayload.course_name || rawPayload.interested_course || options.courseName || '',
        university_name: rawPayload.university || rawPayload.university_name || rawPayload.interested_university || options.universityName || '',
        state: rawPayload.state || '',
        city: rawPayload.city || '',
        message: rawPayload.message || rawPayload.notes || rawPayload.query || '',
        form_type: options.formType || form.id || 'website_form'
      };

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';
        }

        const res = await submitForm(payload, options);

        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Submitted!';
          submitBtn.style.background = '#10b981';
          submitBtn.style.borderColor = '#10b981';
        }

        // Show Toast / Modal with exact submission time and reference ID
        const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const successMsg = `✅ Submitted at ${nowTime}! (Ref: ${res.submission_id || 'Received'}) - Our expert counsellor will connect with you soon.`;

        if (typeof window.showToast === 'function') {
          window.showToast(res.message ? `${res.message} [${nowTime}]` : successMsg, 'success');
        } else {
          alert(successMsg);
        }

        // Reset form
        form.reset();

        // Optional custom callback
        if (typeof options.onSuccess === 'function') {
          options.onSuccess(res);
        }

        // Auto close modal if in modal container
        const modal = form.closest('.modal, .popup-modal, .form-popup, .modal-backdrop');
        if (modal) {
          setTimeout(() => {
            modal.classList.remove('active', 'show', 'open');
            if (typeof modal.style !== 'undefined') modal.style.display = 'none';
          }, 1500);
        }
      } catch(err) {
        if (typeof window.showToast === 'function') {
          window.showToast(err.message || 'Submission error', 'error');
        } else {
          alert('❌ ' + (err.message || 'Could not submit form. Please check your information and try again.'));
        }

        if (typeof options.onError === 'function') {
          options.onError(err);
        }
      } finally {
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
          }
        }, 2500);
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 5. GLOBAL PUBLIC API
  // ────────────────────────────────────────────────────────────────────────────
  window.EduVisionWebForm = {
    submit: submitForm,
    initForm: bindForm,
    normalizePhone: normalizePhone,
    normalizeEmail: normalizeEmail,
    autoInit: function() {
      // Find all forms with data-eduvision-form or standard IDs
      const forms = document.querySelectorAll('form[data-eduvision-form], #applicationForm, #counsellingForm, #applyForm, #enquiryForm, #quickApplyForm, .eduvision-native-form');
      forms.forEach(f => {
        const formType = f.getAttribute('data-form-type') || f.id || 'landing_page_form';
        bindForm(f, { formType });
      });
    }
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.EduVisionWebForm.autoInit);
  } else {
    window.EduVisionWebForm.autoInit();
  }

})(window, document);
