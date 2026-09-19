// ══════════════════════════════════════════════════════════════════════════════
// EDUVISION CENTRAL CTO PAGE & SECTION KILL-SWITCH GUARD (404 GATEKEEPER)
// MASTER ARCHITECT & SYSTEM OWNER: CTO — RAGHAV RAJ RAUNIYAR
// ══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const STORAGE_KEY = 'eduvision_page_controls';
  const BROADCAST_CHANNEL_NAME = 'eduvision_page_controls_sync';
  const SUPABASE_PROJECT_URL = 'https://ewxvqpyusveiynplzxed.supabase.co';
  const SUPABASE_ANON_KEY    = 'sb_publishable_NFUbLO9g-UTt-Z9fUuQoyw__Xrxq2IC';

  // Default Page & Section Control Configuration
  const DEFAULT_PAGE_CONTROLS = {
    // ── PUBLIC HTML WEBPAGES (Strict 404 Redirection when Disabled) ──
    'page_course_details': {
      id: 'page_course_details',
      name: 'Course Details Page',
      type: 'page',
      pathMatch: ['course-details.html', 'course-details'],
      enabled: true,
      group: 'public_pages',
      icon: 'fa-book-open',
      url: '/course-details.html',
      desc: 'Public detailed degree course syllabus, fees, eligibility & career prospect page'
    },
    'page_latest_updates': {
      id: 'page_latest_updates',
      name: 'Latest Updates & News Bulletin',
      type: 'page',
      pathMatch: ['latest-updates.html', 'latest-updates'],
      enabled: true,
      group: 'public_pages',
      icon: 'fa-bullhorn',
      url: '/latest-updates.html',
      desc: 'Public university notifications, admission alerts & live education news desk'
    },
    'page_login': {
      id: 'page_login',
      name: 'Universal Multi-Role Login Portal',
      type: 'page',
      pathMatch: ['login.html', '/login'],
      enabled: true,
      group: 'public_pages',
      icon: 'fa-right-to-bracket',
      url: '/login.html',
      desc: 'Public unified sign-in portal for Students, Staff & Partners'
    },
    'page_otp_verify': {
      id: 'page_otp_verify',
      name: 'OTP Authentication Gateway',
      type: 'page',
      pathMatch: ['otp-verify.html', 'otp-verify'],
      enabled: true,
      group: 'public_pages',
      icon: 'fa-shield-halved',
      url: '/otp-verify.html',
      desc: 'Public 2-step OTP verification and authentication gateway'
    },
    'page_universities_all': {
      id: 'page_universities_all',
      name: 'Partner Universities Directory & Pages',
      type: 'page',
      pathMatch: ['universities/', 'universities\\', 'university-details.html'],
      enabled: true,
      group: 'public_pages',
      icon: 'fa-building-columns',
      url: '/universities/',
      desc: 'All 27+ Partner University detail & admission breakdown pages'
    },

    // ── HOMEPAGE SECTIONS & EMBEDDED WIDGETS (Clean Hide / Maintenance State) ──
    'section_home_courses': {
      id: 'section_home_courses',
      name: 'Degree Courses Grid / Slider',
      type: 'section',
      selectors: ['#courses', '.courses-section', '[data-section="courses"]'],
      navSelectors: ['a[href="#courses"]', 'a[href*="#courses"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-graduation-cap',
      url: '/#courses',
      desc: 'Popular degree programs (B.Tech, MBA, MCA, BCA, MBBS, etc.) on index.html'
    },
    'section_home_partners': {
      id: 'section_home_partners',
      name: 'Partner Universities Showcase',
      type: 'section',
      selectors: ['#partners', '.partners-section', '[data-section="partners"]'],
      navSelectors: ['a[href="#partners"]', 'a[href*="#partners"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-landmark',
      url: '/#partners',
      desc: 'Approved partner university logos, accreditations & campus highlights on index.html'
    },
    'section_home_lead_form': {
      id: 'section_home_lead_form',
      name: 'Direct Admission & Enquiry Form',
      type: 'section',
      selectors: ['#contact', '#admission-form', '.lead-form-section', '#quickEnquiryForm'],
      navSelectors: ['a[href="#contact"]', 'a[href*="#contact"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-file-signature',
      url: '/#contact',
      desc: 'Instant online student registration & lead capture form on index.html'
    },
    'section_home_counselling': {
      id: 'section_home_counselling',
      name: 'Free Career Counselling Banner',
      type: 'section',
      selectors: ['#counselling', '.counselling-section', '[data-section="counselling"]'],
      navSelectors: ['a[href="#counselling"]', 'a[href*="#counselling"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-headset',
      url: '/#counselling',
      desc: '1-on-1 expert counsellor booking & career guidance section'
    },
    'section_home_services': {
      id: 'section_home_services',
      name: 'Student Support Services',
      type: 'section',
      selectors: ['#services', '.services-section'],
      navSelectors: ['a[href="#services"]', 'a[href*="#services"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-briefcase',
      url: '/#services',
      desc: 'Admission guidance, EMI financing, scholarship & documentation services'
    },
    'section_home_why': {
      id: 'section_home_why',
      name: 'Why EduVision Advantage Section',
      type: 'section',
      selectors: ['#why', '.why-section'],
      navSelectors: ['a[href="#why"]', 'a[href*="#why"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-award',
      url: '/#why',
      desc: 'Platform trust statistics, 100% placement track record & metrics'
    },
    'section_home_testimonials': {
      id: 'section_home_testimonials',
      name: 'Student Reviews & Testimonials',
      type: 'section',
      selectors: ['#testimonials', '.testimonials-section'],
      navSelectors: ['a[href="#testimonials"]', 'a[href*="#testimonials"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-comments-dollar',
      url: '/#testimonials',
      desc: 'Alumni ratings, video interviews and success stories carousel'
    },
    'section_home_faq': {
      id: 'section_home_faq',
      name: 'Frequently Asked Questions (FAQ)',
      type: 'section',
      selectors: ['#faq', '.faq-section'],
      navSelectors: ['a[href="#faq"]', 'a[href*="#faq"]'],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-circle-question',
      url: '/#faq',
      desc: 'Admission eligibility, UGC approvals & distance learning FAQ accordion'
    },
    'section_home_ai_copilot': {
      id: 'section_home_ai_copilot',
      name: 'Floating AI Copilot & Chatbot',
      type: 'section',
      selectors: ['#chatWidgetBtn', '#ai-assistant-widget', '.chat-widget-wrapper', '#eduvisionCopilotWidget'],
      navSelectors: [],
      enabled: true,
      group: 'home_sections',
      icon: 'fa-robot',
      url: 'All Pages (Floating)',
      desc: 'Intelligent RAG AI admission advisor and 24/7 student chat widget'
    },

    // ── PORTAL ACCESS GATES ──
    'portal_student': {
      id: 'portal_student',
      name: 'Student Dashboard Portal',
      type: 'page',
      pathMatch: ['student/dashboard.html', 'student/complete-profile.html', 'student/', '/student', 'student\\'],
      enabled: true,
      group: 'portals',
      icon: 'fa-user-graduate',
      url: '/student/dashboard.html',
      desc: 'Candidate dashboard, application tracker & document submission portal'
    },
    'portal_counsellor': {
      id: 'portal_counsellor',
      name: 'Counsellor CRM Portal',
      type: 'page',
      pathMatch: ['counsellor/dashboard.html', 'counsellor/login.html', 'counsellor/', '/counsellor', 'counsellor\\'],
      enabled: true,
      group: 'portals',
      icon: 'fa-headset',
      url: '/counsellor/dashboard.html',
      desc: 'Counsellor lead conversion funnel, call desk & student allocation'
    },
    'portal_teamleader': {
      id: 'portal_teamleader',
      name: 'Team Leader Management Portal',
      type: 'page',
      pathMatch: ['teamleader/dashboard.html', 'teamleader/login.html', 'teamleader/', '/teamleader', 'teamleader\\'],
      enabled: true,
      group: 'portals',
      icon: 'fa-users-gear',
      url: '/teamleader/dashboard.html',
      desc: 'Team oversight, attendance monitoring & target tracking portal'
    },
    'portal_associate': {
      id: 'portal_associate',
      name: 'Associate Partner Portal',
      type: 'page',
      pathMatch: ['associate/dashboard.html', 'associate/login.html', 'associate/', '/associate', 'associate\\'],
      enabled: true,
      group: 'portals',
      icon: 'fa-handshake',
      url: '/associate/dashboard.html',
      desc: 'B2B consultant & agency partner admission submission desk'
    },
    'portal_branch': {
      id: 'portal_branch',
      name: 'Regional Branch Office Portal',
      type: 'page',
      pathMatch: ['branch/dashboard.html', 'branch/', '/branch', 'branch\\'],
      enabled: true,
      group: 'portals',
      icon: 'fa-sitemap',
      url: '/branch/dashboard.html',
      desc: 'Regional branch office management & operations console'
    }
  };

  // Compute Absolute 404 URL based on current origin
  function compute404Url() {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin + '/404.html';
    }
    return '/404.html';
  }

  // Load Controls from LocalStorage with Fallback
  function loadStoredControls() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge defaults in case new pages were added
        const merged = Object.assign({}, DEFAULT_PAGE_CONTROLS);
        for (const k in parsed) {
          if (merged[k]) {
            merged[k] = Object.assign({}, merged[k], parsed[k]);
          } else {
            merged[k] = parsed[k];
          }
        }
        return merged;
      }
    } catch (e) {
      console.warn('[EduPageGuard] Error reading stored controls:', e);
    }
    return Object.assign({}, DEFAULT_PAGE_CONTROLS);
  }

  // Save Controls to LocalStorage and Broadcast
  function saveControls(controls, broadcast) {
    if (broadcast === undefined) broadcast = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
      if (broadcast && typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'PAGE_CONTROLS_UPDATED', controls: controls, timestamp: Date.now() });
        bc.close();
      }
    } catch (e) {
      console.warn('[EduPageGuard] Error saving controls:', e);
    }
  }

  // Get current active controls
  let activeControls = loadStoredControls();

  // Find if current URL matches a guarded Page
  function findMatchingPageKey() {
    const currentPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    const currentHref = window.location.href.toLowerCase();

    // Never redirect 404.html itself or Admin Dashboard
    if (currentPath.endsWith('404.html') || currentPath.endsWith('404')) return null;
    if (currentPath.includes('/admin/dashboard.html') || currentPath.includes('/admin/login.html')) return null;

    for (const key in activeControls) {
      const item = activeControls[key];
      if (item.type === 'page' && Array.isArray(item.pathMatch)) {
        for (let i = 0; i < item.pathMatch.length; i++) {
          const pat = item.pathMatch[i].toLowerCase().replace(/\\/g, '/');
          if (currentPath.endsWith(pat) || currentPath.includes(pat) || currentHref.includes(pat)) {
            return key;
          }
        }
      }
    }
    return null;
  }

  // Check and Enforce Page Redirection (0-Delay Synchronous Execution)
  function enforcePageGuard() {
    const matchedKey = findMatchingPageKey();
    if (!matchedKey) return false;

    const pageControl = activeControls[matchedKey];
    if (pageControl && pageControl.enabled === false) {
      // 🚨 PAGE IS DISABLED BY CTO! Immediately block render and redirect to 404!
      console.warn('[EduPageGuard] Access Denied: ' + pageControl.name + ' (' + matchedKey + ') has been disabled by CTO Raghav. Redirecting to 404...');
      
      // Inject instant blanking style to kill any visual flash
      const blankStyle = document.createElement('style');
      blankStyle.id = 'eduvision-page-block-flash';
      blankStyle.textContent = 'html, body { display: none !important; opacity: 0 !important; visibility: hidden !important; }';
      if (document.head) {
        document.head.appendChild(blankStyle);
      } else if (document.documentElement) {
        document.documentElement.appendChild(blankStyle);
      }

      // Execute Replace Redirect (leaves no back button trap)
      const target404 = compute404Url();
      window.location.replace(target404);
      return true;
    }
    return false;
  }

  // Enforce Section Hiding (for index.html & public components)
  function enforceSectionGuards() {
    let cssRules = [];

    for (const key in activeControls) {
      const item = activeControls[key];
      if (item.type === 'section' && item.enabled === false) {
        if (Array.isArray(item.selectors)) {
          item.selectors.forEach(sel => {
            cssRules.push(sel + ' { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; pointer-events: none !important; }');
          });
        }
        if (Array.isArray(item.navSelectors)) {
          item.navSelectors.forEach(navSel => {
            cssRules.push(navSel + ' { display: none !important; opacity: 0 !important; pointer-events: none !important; }');
          });
        }
      }
    }

    let styleEl = document.getElementById('eduvision-section-guard-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'eduvision-section-guard-styles';
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = cssRules.join('\n');
  }

  // Execute Page Enforcement IMMEDIATELY in <head>
  const isRedirecting = enforcePageGuard();

  // If not redirecting, enforce section rules right away
  if (!isRedirecting) {
    enforceSectionGuards();

    // Re-enforce once DOM is ready to clean up navigation menus
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', enforceSectionGuards);
    }
  }

  // ── REAL-TIME CROSS-TAB SYNC LISTENER ──
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const syncChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      syncChannel.onmessage = function(event) {
        if (event.data && event.data.type === 'PAGE_CONTROLS_UPDATED' && event.data.controls) {
          activeControls = event.data.controls;
          const willRedirect = enforcePageGuard();
          if (!willRedirect) {
            enforceSectionGuards();
          }
        }
      };
    } catch (e) {
      console.warn('[EduPageGuard] BroadcastChannel init error:', e);
    }
  }

  // Storage Event Listener for cross-window fallback
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        activeControls = JSON.parse(e.newValue);
        const willRedirect = enforcePageGuard();
        if (!willRedirect) {
          enforceSectionGuards();
        }
      } catch (err) {}
    }
  });

  // ── ENTERPRISE CLOUD SYNC ENGINE (Direct Supabase REST API, Zero Dependencies) ──
  async function pushControlsToCloud(controls, actorInfo) {
    try {
      const payload = {
        id: '00000000-0000-0000-0000-000000000404',
        title: 'CTO_PAGE_CONTROLS_STATE',
        message: JSON.stringify(controls),
        priority: 'High',
        sender_role: 'CTO',
        sender_name: actorInfo || 'CTO Raghav (System Owner)',
        category: 'PAGE_CONTROLS_SYNC',
        created_at: new Date().toISOString()
      };

      await fetch(SUPABASE_PROJECT_URL + '/rest/v1/notifications', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('[EduPageGuard] Cloud push error:', e);
    }
  }

  // Fast Background Hydration from Supabase (Zero external library required)
  async function hydrateFromSupabase() {
    try {
      const res = await fetch(SUPABASE_PROJECT_URL + '/rest/v1/notifications?id=eq.00000000-0000-0000-0000-000000000404&select=*', {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      });

      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].message) {
        let cloudControls = null;
        try {
          cloudControls = JSON.parse(data[0].message);
        } catch(pe) {}

        if (cloudControls && typeof cloudControls === 'object') {
          let changed = false;
          for (const k in cloudControls) {
            if (activeControls[k]) {
              if (activeControls[k].enabled !== cloudControls[k].enabled) {
                activeControls[k].enabled = cloudControls[k].enabled;
                changed = true;
              }
            } else {
              activeControls[k] = cloudControls[k];
              changed = true;
            }
          }

          if (changed) {
            saveControls(activeControls, true);
            enforcePageGuard();
            enforceSectionGuards();
          }
        }
      }
    } catch (err) {
      // Supabase hydration is non-blocking
    }
  }

  // Run instant hydration if not already redirecting
  if (!isRedirecting && typeof window !== 'undefined') {
    hydrateFromSupabase();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GLOBAL PUBLIC CTO API (window.EduPageGuard)
  // ════════════════════════════════════════════════════════════════════════════
  window.EduPageGuard = {
    // Get all page and section controls
    getControls: function() {
      activeControls = loadStoredControls();
      return JSON.parse(JSON.stringify(activeControls));
    },

    // Check if specific page or section is enabled
    isEnabled: function(controlId) {
      activeControls = loadStoredControls();
      return activeControls[controlId] ? activeControls[controlId].enabled !== false : true;
    },

    // Update single control
    setControl: async function(controlId, isEnabled, actorInfo) {
      activeControls = loadStoredControls();
      if (!activeControls[controlId]) {
        console.error('[EduPageGuard] Unknown control ID: ' + controlId);
        return false;
      }

      activeControls[controlId].enabled = !!isEnabled;
      activeControls[controlId].updatedAt = new Date().toISOString();
      activeControls[controlId].updatedBy = actorInfo || 'CTO Raghav (System Owner)';

      saveControls(activeControls, true);
      enforceSectionGuards();

      // Broadcast and persist directly to Supabase cloud
      await pushControlsToCloud(activeControls, actorInfo);
      return true;
    },

    // 1-Click Master Switches
    setAllPublicPages: async function(isEnabled, actorInfo) {
      activeControls = loadStoredControls();
      for (const k in activeControls) {
        if (activeControls[k].group === 'public_pages') {
          activeControls[k].enabled = !!isEnabled;
          activeControls[k].updatedAt = new Date().toISOString();
          activeControls[k].updatedBy = actorInfo || 'CTO Raghav (System Owner)';
        }
      }
      saveControls(activeControls, true);
      await pushControlsToCloud(activeControls, actorInfo);
      return true;
    },

    setAllSections: async function(isEnabled, actorInfo) {
      activeControls = loadStoredControls();
      for (const k in activeControls) {
        if (activeControls[k].group === 'home_sections') {
          activeControls[k].enabled = !!isEnabled;
          activeControls[k].updatedAt = new Date().toISOString();
          activeControls[k].updatedBy = actorInfo || 'CTO Raghav (System Owner)';
        }
      }
      saveControls(activeControls, true);
      enforceSectionGuards();
      await pushControlsToCloud(activeControls, actorInfo);
      return true;
    },

    setAllPortals: async function(isEnabled, actorInfo) {
      activeControls = loadStoredControls();
      for (const k in activeControls) {
        if (activeControls[k].group === 'portals') {
          activeControls[k].enabled = !!isEnabled;
          activeControls[k].updatedAt = new Date().toISOString();
          activeControls[k].updatedBy = actorInfo || 'CTO Raghav (System Owner)';
        }
      }
      saveControls(activeControls, true);
      await pushControlsToCloud(activeControls, actorInfo);
      return true;
    },

    // Reset all controls to factory default
    resetDefaults: async function(actorInfo) {
      activeControls = JSON.parse(JSON.stringify(DEFAULT_PAGE_CONTROLS));
      for (const k in activeControls) {
        activeControls[k].updatedAt = new Date().toISOString();
        activeControls[k].updatedBy = actorInfo || 'CTO Raghav (System Owner)';
      }
      saveControls(activeControls, true);
      enforceSectionGuards();
      await pushControlsToCloud(activeControls, actorInfo);
      return activeControls;
    },

    // Refresh state manually
    refresh: async function() {
      activeControls = loadStoredControls();
      await hydrateFromSupabase();
      enforcePageGuard();
      enforceSectionGuards();
      return activeControls;
    },

    get404Url: compute404Url
  };

  console.log('🛡️ [EduPageGuard] Enterprise Kill-Switch Engine initialized under CTO Raghav authority.');
})();
