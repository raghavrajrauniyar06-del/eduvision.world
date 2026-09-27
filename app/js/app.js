/* ═══════════════════════════════════════════════════════════════════
   EDUVISION WORLD APP — PART 1 SCRIPT
   Architecture: Screen Router · Splash · Onboarding · Auth · Back Nav
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── CONSTANTS & STORAGE KEYS ──
  const STORAGE_ONBOARDED_KEY = 'eduvision_app_onboarded';
  const STORAGE_SESSION_KEY   = 'eduvision_app_user_session';
  const SUPABASE_URL          = 'https://ewxvqpyusveiynplzxed.supabase.co';
  const SUPABASE_ANON_KEY     = 'sb_publishable_NFUbLO9g-UTt-Z9fUuQoyw__Xrxq2IC';

  // ── APP STATE ──
  const AppState = {
    currentScreen: 'splash',
    currentSlide: 0,
    totalSlides: 4,
    touchStartX: 0,
    touchEndX: 0,
    isAuthenticating: false,
    selectedRole: 'student'
  };

  // ── DOM ELEMENTS CACHE ──
  const DOM = {
    mobileFrame: document.getElementById('mobileFrame'),
    statusBar: document.getElementById('statusBar'),
    statusTime: document.getElementById('statusTime'),
    
    // Screens
    screenSplash: document.getElementById('screen-splash'),
    screenOnboarding: document.getElementById('screen-onboarding'),
    screenEntry: document.getElementById('screen-entry'),
    screenLogin: document.getElementById('screen-login'),
    screenRegister: document.getElementById('screen-register'),
    screenHomePlaceholder: document.getElementById('screen-home-placeholder'),

    // Splash Elements
    splashProgressBar: document.getElementById('splashCapsuleFill') || document.querySelector('.splash-capsule-fill'),

    // Onboarding Elements
    slidesTrack: document.getElementById('slidesTrack'),
    indicatorDots: document.querySelectorAll('.page-indicator-dots .dot'),
    btnSkip: document.getElementById('btnSkipOnboarding'),
    btnOnboardingCta: document.getElementById('btnOnboardingCta'),

    // Auth Forms & Inputs
    loginForm: document.getElementById('studentLoginForm'),
    loginIdentifier: document.getElementById('loginIdentifier'),
    loginPassword: document.getElementById('loginPassword'),
    btnLoginSubmit: document.getElementById('btnLoginSubmit'),
    
    registerForm: document.getElementById('studentRegisterForm'),
    regName: document.getElementById('regName'),
    regMobile: document.getElementById('regMobile'),
    regEmail: document.getElementById('regEmail'),
    regPassword: document.getElementById('regPassword'),
    regConfirmPassword: document.getElementById('regConfirmPassword'),
    btnRegisterSubmit: document.getElementById('btnRegisterSubmit'),

    // Toast Alert
    appToast: document.getElementById('appToast')
  };

  // ── LIVE CLOCK IN STATUS BAR ──
  function updateLiveClock() {
    if (!DOM.statusTime) return;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    DOM.statusTime.textContent = `${hours}:${minutes}`;
  }
  updateLiveClock();
  setInterval(updateLiveClock, 30000);

  // ── TOAST NOTIFICATION UTILITY ──
  function showToast(message, type = 'info') {
    if (!DOM.appToast) return;
    DOM.appToast.textContent = message;
    DOM.appToast.className = `app-toast-alert show ${type}`;
    setTimeout(() => {
      DOM.appToast.className = 'app-toast-alert';
    }, 3200);
  }

  // ── SCREEN ROUTER & NAVIGATION SYSTEM ──
  function navigateTo(screenId, pushHistory = true) {
    const screens = [
      DOM.screenSplash,
      DOM.screenOnboarding,
      DOM.screenEntry,
      DOM.screenLogin,
      DOM.screenRegister,
      DOM.screenHomePlaceholder
    ];

    screens.forEach(s => {
      if (s) s.classList.remove('active-screen');
    });

    const target = document.getElementById(screenId);
    if (!target) return;

    target.classList.add('active-screen');
    AppState.currentScreen = screenId;

    // Status bar theme update (Splash has dark background, rest light)
    if (screenId === 'screen-splash') {
      DOM.statusBar.classList.add('dark-mode-status');
    } else {
      DOM.statusBar.classList.remove('dark-mode-status');
    }

    // Scroll to top of the screen
    target.scrollTop = 0;

    // Android Back Button History Stack Management
    if (pushHistory) {
      window.history.pushState({ screen: screenId }, '', `#${screenId.replace('screen-', '')}`);
    }
  }

  // ── ANDROID BACK NAVIGATION LISTENER (popstate) ──
  window.addEventListener('popstate', (event) => {
    const current = AppState.currentScreen;

    if (current === 'screen-register') {
      navigateTo('screen-login', false);
    } else if (current === 'screen-login') {
      navigateTo('screen-entry', false);
    } else if (current === 'screen-entry') {
      // If user came from onboarding, go back to last slide
      goToSlide(3);
      navigateTo('screen-onboarding', false);
    } else if (current === 'screen-onboarding') {
      if (AppState.currentSlide > 0) {
        goToSlide(AppState.currentSlide - 1);
      }
    }
  });

  // ═══════════════════════════════════════════════════════════
  // 1. SPLASH SCREEN ANIMATION CONTROLLER (REAL EARTH THEME)
  // ═══════════════════════════════════════════════════════════
  let splashTimer = null;
  function runSplashSequence() {
    // 1. Initialize functional capsule progress bar to 0%
    const bar = document.getElementById('splashCapsuleFill') || document.querySelector('.splash-capsule-fill');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }

    // 2. Begin smooth 0% -> 100% charging animation
    setTimeout(() => {
      if (bar) {
        bar.style.transition = 'width 2.4s cubic-bezier(0.16, 1, 0.3, 1)';
        bar.style.width = '100%';
      }
    }, 120);

    // 3. Tap splash anywhere to fast-forward & skip directly
    if (DOM.screenSplash) {
      DOM.screenSplash.addEventListener('click', () => {
        if (splashTimer) clearTimeout(splashTimer);
        checkUserRoutingAfterSplash();
      }, { once: true });
    }

    // 4. Auto-advance as soon as loading reaches 100%
    splashTimer = setTimeout(() => {
      checkUserRoutingAfterSplash();
    }, 2650);
  }

  // ── USER DETECTION & ROUTING ──
  function checkUserRoutingAfterSplash() {
    const isOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    const activeSession = localStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem('eduvision_user');

    if (activeSession) {
      // Returning user with valid active session -> Student App Home Placeholder
      renderLoggedInHome();
      navigateTo('screen-home-placeholder');
    } else if (isOnboarded) {
      // Returning user who already completed onboarding -> Straight to Login
      navigateTo('screen-login');
    } else {
      // First-time user -> Start Onboarding Carousel
      goToSlide(0);
      navigateTo('screen-onboarding');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 2. ONBOARDING CAROUSEL CONTROLLER
  // ═══════════════════════════════════════════════════════════
  function goToSlide(index) {
    if (index < 0 || index >= AppState.totalSlides) return;
    AppState.currentSlide = index;

    // Move track using hardware-accelerated transform
    const offsetPercent = index * 25; // 4 slides = 25% each
    if (DOM.slidesTrack) {
      DOM.slidesTrack.style.transform = `translateX(-${offsetPercent}%)`;
    }

    // Update Dots Indicator
    DOM.indicatorDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Update Primary CTA text & Skip visibility
    if (index === AppState.totalSlides - 1) {
      DOM.btnOnboardingCta.innerHTML = 'Get Started &rarr;';
      DOM.btnOnboardingCta.classList.add('primary-accent');
      if (DOM.btnSkip) DOM.btnSkip.style.visibility = 'hidden';
    } else {
      DOM.btnOnboardingCta.innerHTML = 'Next &rarr;';
      DOM.btnOnboardingCta.classList.remove('primary-accent');
      if (DOM.btnSkip) DOM.btnSkip.style.visibility = 'visible';
    }
  }

  function handleOnboardingNext() {
    if (AppState.currentSlide < AppState.totalSlides - 1) {
      goToSlide(AppState.currentSlide + 1);
    } else {
      finishOnboarding();
    }
  }

  function finishOnboarding() {
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');
    navigateTo('screen-entry');
  }

  // Touch Swipe Gesture Handling
  const sliderStage = document.getElementById('onboardingSlider');
  if (sliderStage) {
    sliderStage.addEventListener('touchstart', (e) => {
      AppState.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderStage.addEventListener('touchend', (e) => {
      AppState.touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    }, { passive: true });
  }

  function handleSwipeGesture() {
    const swipeThreshold = 45;
    const diff = AppState.touchStartX - AppState.touchEndX;

    if (diff > swipeThreshold) {
      // Swiped Left -> Next Slide
      if (AppState.currentSlide < AppState.totalSlides - 1) {
        goToSlide(AppState.currentSlide + 1);
      }
    } else if (diff < -swipeThreshold) {
      // Swiped Right -> Previous Slide
      if (AppState.currentSlide > 0) {
        goToSlide(AppState.currentSlide - 1);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3. ROLE CONFIGURATIONS & THEMES (Mobile-Native System)
  // ═══════════════════════════════════════════════════════════
  const ROLE_CONFIGS = {
    student: {
      id: 'student',
      name: 'Student',
      badgeClass: 'badge-student',
      badgeText: 'Official Student Portal',
      heading: 'Welcome Back 👋',
      subtitle: 'Let\'s continue building your future.',
      identifierLabel: 'Email, Phone or Student ID',
      identifierPlaceholder: 'e.g. 9876543210 or student@gmail.com',
      identifierIcon: '<i class="fa-regular fa-user"></i>',
      passwordPlaceholder: 'Enter password',
      submitText: 'Login as Student &rarr;',
      quickFill: {
        label: 'Quick Demo: Raghav (Student)',
        identifier: '8303632103',
        password: 'student'
      },
      theme: 'theme-student'
    },
    counsellor: {
      id: 'counsellor',
      name: 'Counsellor',
      badgeClass: 'badge-counsellor',
      badgeText: 'Counsellor Gateway',
      heading: 'Counsellor Desk 👨‍🏫',
      subtitle: 'Manage applications, leads & student admissions.',
      identifierLabel: 'Employee ID, Email or Phone',
      identifierPlaceholder: 'e.g. CNS001 or counsellor@eduvision.in',
      identifierIcon: '<i class="fa-solid fa-id-badge"></i>',
      passwordPlaceholder: 'Enter counsellor password',
      submitText: 'Login as Counsellor &rarr;',
      quickFill: {
        label: 'Quick Demo: Priya (Counsellor)',
        identifier: 'CNS001',
        password: 'Pass@123'
      },
      theme: 'theme-counsellor'
    },
    associate: {
      id: 'associate',
      name: 'Associate Partner',
      badgeClass: 'badge-partner',
      badgeText: 'Associate Partner Network',
      heading: 'Partner Portal 🤝',
      subtitle: 'Access agency dashboard & lead tracking.',
      identifierLabel: 'Partner Code, Email or Phone',
      identifierPlaceholder: 'e.g. AP-DELHI-01 or partner@eduvision.in',
      identifierIcon: '<i class="fa-solid fa-handshake"></i>',
      passwordPlaceholder: 'Enter partner password',
      submitText: 'Login as Partner &rarr;',
      quickFill: {
        label: 'Quick Demo: Apex Global (Partner)',
        identifier: 'AP-DELHI-01',
        password: 'Pass@123'
      },
      theme: 'theme-associate'
    },
    teamleader: {
      id: 'teamleader',
      name: 'Team Leader',
      badgeClass: 'badge-teamleader',
      badgeText: 'Team Operations Desk',
      heading: 'Team Operations 👑',
      subtitle: 'Monitor team performance, metrics & audits.',
      identifierLabel: 'Employee ID, Email or Phone',
      identifierPlaceholder: 'e.g. TL001 or tl@eduvision.in',
      identifierIcon: '<i class="fa-solid fa-crown"></i>',
      passwordPlaceholder: 'Enter supervisor password',
      submitText: 'Login as Team Leader &rarr;',
      quickFill: {
        label: 'Quick Demo: Vikram (Team Leader)',
        identifier: 'TL001',
        password: 'Pass@123'
      },
      theme: 'theme-teamleader'
    },
    admin: {
      id: 'admin',
      name: 'Admin',
      badgeClass: 'badge-admin',
      badgeText: 'Executive Administration',
      heading: 'Admin Control 🛡️',
      subtitle: 'System administration & security command.',
      identifierLabel: 'Admin ID, Email or Phone',
      identifierPlaceholder: 'e.g. ADM001 or admin@eduvision.in',
      identifierIcon: '<i class="fa-solid fa-shield-halved"></i>',
      passwordPlaceholder: 'Enter admin security key',
      submitText: 'Login as Administrator &rarr;',
      quickFill: {
        label: 'Quick Demo: Super Admin (ADM001)',
        identifier: 'ADM001',
        password: 'Pass@123'
      },
      theme: 'theme-admin'
    }
  };

  // ── ROLE SWITCHING CONTROLLER ──
  function switchRole(roleKey) {
    if (!ROLE_CONFIGS[roleKey]) roleKey = 'student';
    AppState.selectedRole = roleKey;

    // Update Segmented Tab Buttons
    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-role') === roleKey);
    });

    const cfg = ROLE_CONFIGS[roleKey];

    // Update Header & Badge
    const badgeEl = document.getElementById('roleActiveBadge');
    const badgeTextEl = document.getElementById('roleBadgeText');
    const headingEl = document.getElementById('authHeadingText');
    const subtitleEl = document.getElementById('authSubtitleText');

    if (badgeEl) badgeEl.className = `role-active-badge ${cfg.badgeClass}`;
    if (badgeTextEl) badgeTextEl.textContent = cfg.badgeText;
    if (headingEl) headingEl.textContent = cfg.heading;
    if (subtitleEl) subtitleEl.textContent = cfg.subtitle;

    // Update Quick Demo Fill Button
    const quickFillLabel = document.getElementById('quickFillLabel');
    if (quickFillLabel) quickFillLabel.textContent = cfg.quickFill.label;

    // Update Input Fields & Labels
    const idLabel = document.getElementById('loginIdentifierLabel');
    const idInput = DOM.loginIdentifier;
    const idIcon = document.getElementById('loginIdentifierIcon');
    const pwInput = DOM.loginPassword;
    const submitText = document.getElementById('btnLoginSubmitText');

    if (idLabel) idLabel.textContent = cfg.identifierLabel;
    if (idInput) idInput.placeholder = cfg.identifierPlaceholder;
    if (idIcon) idIcon.innerHTML = cfg.identifierIcon;
    if (pwInput) pwInput.placeholder = cfg.passwordPlaceholder;
    if (submitText) submitText.innerHTML = cfg.submitText;

    // Toggle Student-only options (Google, Create Account) vs Staff Security Notice
    const studentOpts = document.getElementById('studentOnlyAuthOptions');
    const staffNotice = document.getElementById('staffSecurityNotice');
    if (studentOpts) studentOpts.style.display = (roleKey === 'student') ? 'block' : 'none';
    if (staffNotice) staffNotice.style.display = (roleKey === 'student') ? 'none' : 'block';
  }

  // ── ENTRY SCREEN SETUP ──
  function setupEntryScreen() {
    const btnContinueStudent = document.getElementById('btnContinueStudent');
    if (btnContinueStudent) {
      btnContinueStudent.addEventListener('click', () => {
        switchRole('student');
        navigateTo('screen-login');
      });
    }

    document.querySelectorAll('.btn-entry-role-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        switchRole(role);
        navigateTo('screen-login');
      });
    });
  }

  // ── SUPABASE CLIENT ACCESSOR ──
  let _supabaseClient = null;
  function getSupabaseClient() {
    if (!_supabaseClient && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
  }

  // ═══════════════════════════════════════════════════════════
  // 4. UNIFIED MULTI-ROLE AUTHENTICATION ENGINE
  // ═══════════════════════════════════════════════════════════
  async function handleUniversalLogin(e) {
    e.preventDefault();
    if (AppState.isAuthenticating) return;

    const identifier = DOM.loginIdentifier.value.trim();
    const password = DOM.loginPassword.value.trim();
    const activeRole = AppState.selectedRole || 'student';

    if (!identifier) {
      showToast('Please enter your identifier (Email, Phone or ID)', 'error');
      DOM.loginIdentifier.focus();
      return;
    }
    if (!password) {
      showToast('Please enter your Password', 'error');
      DOM.loginPassword.focus();
      return;
    }

    AppState.isAuthenticating = true;
    DOM.btnLoginSubmit.disabled = true;
    const submitTextEl = document.getElementById('btnLoginSubmitText');
    const origSubmitHtml = submitTextEl ? submitTextEl.innerHTML : 'Login &rarr;';
    if (submitTextEl) submitTextEl.innerHTML = '<span>⚡ Authenticating...</span>';

    try {
      let authUser = null;
      let authRole = activeRole;
      const client = getSupabaseClient();
      const rawInput = identifier;
      const digits = rawInput.replace(/\D/g, '');
      const last10 = digits.length >= 10 ? digits.slice(-10) : '';

      // ─────────────────────────────────────────────────────────────
      // 1. ADMIN USER AUTHENTICATION
      // ─────────────────────────────────────────────────────────────
      if (activeRole === 'admin' || rawInput.toUpperCase().startsWith('ADM') || rawInput.toLowerCase().includes('admin')) {
        if (client) {
          try {
            let adminFilter = `employee_id.eq.${rawInput},email.ilike.${rawInput}`;
            if (rawInput.length === 36 && rawInput.includes('-')) adminFilter += `,admin_id.eq.${rawInput}`;
            if (last10) adminFilter += `,phone.ilike.*${last10}*`;

            const { data: admData } = await client
              .from('admin_users')
              .select('*')
              .or(adminFilter);

            if (admData && admData.length > 0) {
              const adm = admData[0];
              if (adm.password === password) {
                authUser = {
                  id: adm.admin_id || adm.employee_id,
                  admin_id: adm.admin_id,
                  employee_id: adm.employee_id || 'ADM001',
                  full_name: adm.full_name || 'System Administrator',
                  email: adm.email,
                  phone: adm.phone,
                  role: adm.role || 'Admin',
                  designation: adm.designation || 'Administrator',
                  branch: adm.branch || 'Head Office',
                  status: adm.status || 'Active'
                };
                authRole = 'admin';
                localStorage.setItem('eduvision_admin', JSON.stringify(authUser));
              } else {
                showToast('Incorrect password for Administrator account.', 'error');
                return;
              }
            }
          } catch (admErr) {
            console.warn("admin_users query:", admErr);
          }
        }

        // Demo Admin Fallback
        if (!authUser && (rawInput === 'ADM001' || rawInput.toLowerCase() === 'admin@eduvision.in' || activeRole === 'admin')) {
          authUser = {
            id: 'ADM_DEMO_001',
            admin_id: 'ADM001',
            employee_id: 'ADM001',
            full_name: 'Dr. Raghavendra Gupta',
            email: 'admin@eduvision.in',
            phone: '9876543219',
            role: 'Admin',
            designation: 'Executive Administrator',
            branch: 'Headquarters',
            status: 'Active'
          };
          authRole = 'admin';
          localStorage.setItem('eduvision_admin', JSON.stringify(authUser));
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 2. TEAM LEADER AUTHENTICATION
      // ─────────────────────────────────────────────────────────────
      if (!authUser && (activeRole === 'teamleader' || rawInput.toUpperCase().startsWith('TL'))) {
        if (client) {
          try {
            let tlFilter = `employee_id.eq.${rawInput},team_leader_id.eq.${rawInput},email.ilike.${rawInput}`;
            if (last10) tlFilter += `,phone.ilike.*${last10}*`;

            const { data: tlData } = await client
              .from('team_leaders')
              .select('*')
              .or(tlFilter);

            if (tlData && tlData.length > 0) {
              const tl = tlData[0];
              if (tl.password === password) {
                authUser = {
                  id: tl.team_leader_id || tl.employee_id,
                  team_leader_id: tl.team_leader_id || tl.employee_id,
                  employee_id: tl.employee_id || tl.team_leader_id,
                  full_name: tl.full_name || 'Team Leader',
                  email: tl.email,
                  phone: tl.phone,
                  role: tl.role || 'Team Leader',
                  designation: tl.designation || 'Operations Team Leader',
                  branch: tl.branch || 'Head Office',
                  status: tl.status || 'Active'
                };
                authRole = 'teamleader';
                localStorage.setItem('eduvision_team_leader', JSON.stringify(authUser));
              } else {
                showToast('Incorrect password for Team Leader account.', 'error');
                return;
              }
            }
          } catch (tlErr) {
            console.warn("team_leaders query:", tlErr);
          }
        }

        // Demo Team Leader Fallback
        if (!authUser && (rawInput === 'TL001' || rawInput.toLowerCase() === 'tl@eduvision.in' || activeRole === 'teamleader')) {
          authUser = {
            id: 'TL_DEMO_001',
            team_leader_id: 'TL001',
            employee_id: 'TL001',
            full_name: 'Vikram Singh',
            email: 'tl@eduvision.in',
            phone: '9876543214',
            role: 'Team Leader',
            designation: 'Operations Team Lead',
            branch: 'Regional Hub',
            status: 'Active'
          };
          authRole = 'teamleader';
          localStorage.setItem('eduvision_team_leader', JSON.stringify(authUser));
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 3. COUNSELLOR AUTHENTICATION
      // ─────────────────────────────────────────────────────────────
      if (!authUser && (activeRole === 'counsellor' || rawInput.toUpperCase().startsWith('CNS'))) {
        if (client) {
          try {
            let cnsFilter = `employee_id.eq.${rawInput},counsellor_id.eq.${rawInput},email.ilike.${rawInput}`;
            if (last10) cnsFilter += `,phone.ilike.*${last10}*`;

            const { data: cnsData } = await client
              .from('counsellors')
              .select('*')
              .or(cnsFilter);

            if (cnsData && cnsData.length > 0) {
              const cns = cnsData[0];
              if (cns.password === password) {
                authUser = {
                  id: cns.counsellor_id || cns.employee_id,
                  counsellor_id: cns.counsellor_id || cns.employee_id,
                  employee_id: cns.employee_id || cns.counsellor_id,
                  full_name: cns.full_name || 'Counsellor',
                  email: cns.email,
                  phone: cns.phone,
                  role: cns.role || 'Counsellor',
                  designation: cns.designation || 'Senior Admissions Counsellor',
                  branch: cns.branch || 'Head Office',
                  status: cns.status || 'Active'
                };
                authRole = 'counsellor';
                localStorage.setItem('eduvision_counsellor', JSON.stringify(authUser));
              } else {
                showToast('Incorrect password for Counsellor account.', 'error');
                return;
              }
            }
          } catch (cnsErr) {
            console.warn("counsellors query:", cnsErr);
          }
        }

        // Demo Counsellor Fallback
        if (!authUser && (rawInput === 'CNS001' || rawInput.toLowerCase() === 'counsellor@eduvision.in' || activeRole === 'counsellor')) {
          authUser = {
            id: 'CNS_DEMO_001',
            counsellor_id: 'CNS001',
            employee_id: 'CNS001',
            full_name: 'Priya Sharma',
            email: 'counsellor@eduvision.in',
            phone: '9876543212',
            role: 'Counsellor',
            designation: 'Senior Admissions Counsellor',
            branch: 'Admissions Desk',
            status: 'Active'
          };
          authRole = 'counsellor';
          localStorage.setItem('eduvision_counsellor', JSON.stringify(authUser));
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 4. ASSOCIATE PARTNER AUTHENTICATION
      // ─────────────────────────────────────────────────────────────
      if (!authUser && (activeRole === 'associate' || rawInput.toUpperCase().startsWith('AP') || rawInput.toUpperCase().startsWith('PARTNER'))) {
        if (client) {
          try {
            let prtFilter = `partner_code.eq.${rawInput},partner_id.eq.${rawInput},email.ilike.${rawInput}`;
            if (last10) prtFilter += `,phone.ilike.*${last10}*`;

            const { data: prtData } = await client
              .from('associate_partners')
              .select('*')
              .or(prtFilter);

            if (prtData && prtData.length > 0) {
              const prt = prtData[0];
              if (prt.status === 'Suspended') {
                showToast('🚫 Partner account is suspended. Contact admin.', 'error');
                return;
              }
              if (prt.password === password) {
                authUser = {
                  id: prt.partner_id,
                  partner_id: prt.partner_id,
                  partner_code: prt.partner_code,
                  full_name: prt.contact_person || prt.company_name || 'Associate Partner',
                  email: prt.email,
                  phone: prt.phone,
                  role: 'associate',
                  tier: prt.tier || 'Platinum Agency',
                  status: prt.status || 'Active'
                };
                authRole = 'associate';
                localStorage.setItem('eduvision_partner', JSON.stringify(authUser));
              } else {
                showToast('Incorrect password for Associate Partner account.', 'error');
                return;
              }
            }
          } catch (prtErr) {
            console.warn("associate_partners query:", prtErr);
          }
        }

        // Demo Partner Fallback
        if (!authUser && (rawInput === 'AP-DELHI-01' || rawInput === 'AP001' || rawInput.toLowerCase() === 'partner@eduvision.in' || activeRole === 'associate')) {
          authUser = {
            id: 'PARTNER_DEMO_001',
            partner_id: 'AP-DELHI-01',
            partner_code: 'AP-DELHI-01',
            full_name: 'Apex Global Admissions',
            email: 'partner@eduvision.in',
            phone: '9876543213',
            role: 'associate',
            tier: 'Platinum Partner',
            status: 'Active'
          };
          authRole = 'associate';
          localStorage.setItem('eduvision_partner', JSON.stringify(authUser));
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 5. STUDENT AUTHENTICATION (DEFAULT)
      // ─────────────────────────────────────────────────────────────
      if (!authUser) {
        if (client) {
          try {
            let sOrParts = [`student_id.eq.${rawInput}`, `email.ilike.${rawInput}`];
            if (last10) sOrParts.push(`phone.ilike.*${last10}*`);

            const { data: sProfiles } = await client
              .from('student_profiles')
              .select('*')
              .or(sOrParts.join(','));

            if (sProfiles && sProfiles.length > 0) {
              const sp = sProfiles[0];
              const { data: uFromS } = await client
                .from('users')
                .select('*')
                .or(`id.eq.${sp.user_id},email.ilike.${sp.email || rawInput}`);

              if (uFromS && uFromS.length > 0) {
                const u = uFromS[0];
                if (u.password === password) {
                  authUser = {
                    id: sp.user_id || u.id,
                    student_id: sp.student_id,
                    full_name: sp.full_name || u.full_name || 'Student',
                    email: sp.email || u.email,
                    phone: sp.phone || u.phone,
                    role: 'student',
                    status: sp.admission_status || 'Active'
                  };
                  authRole = 'student';
                } else {
                  showToast('Incorrect password. Please try again.', 'error');
                  return;
                }
              }
            }

            if (!authUser) {
              let uOrParts = [`email.ilike.${rawInput}`];
              if (last10) uOrParts.push(`phone.ilike.*${last10}*`);

              const { data: uData } = await client
                .from('users')
                .select('*')
                .or(uOrParts.join(','));

              if (uData && uData.length > 0) {
                const u = uData[0];
                if (u.password === password) {
                  authUser = {
                    id: u.id,
                    student_id: 'EDV-' + u.id.slice(0, 6).toUpperCase(),
                    full_name: u.full_name || 'Student',
                    email: u.email,
                    phone: u.phone,
                    role: u.role || 'student',
                    status: 'Active'
                  };
                  authRole = 'student';
                }
              }
            }
          } catch (sbErr) {
            console.warn("student query:", sbErr);
          }
        }

        // Demo Student Fallback
        if (!authUser) {
          const isDemoStudent = ['student@eduvision.in', 'student@gmail.com', '8303632103', '9876543210', 'raghav', 'demo', 'student'].includes(rawInput.toLowerCase()) || activeRole === 'student';
          if (isDemoStudent) {
            authUser = {
              id: 'STD_' + Date.now().toString().slice(-6),
              student_id: 'EDV-2026-ACTIVE',
              full_name: rawInput === '8303632103' ? 'Raghav Raj' : (rawInput.includes('@') ? rawInput.split('@')[0] : 'Raghav Raj'),
              email: rawInput.includes('@') ? rawInput : 'raghavraj@gmail.com',
              phone: rawInput.replace(/\D/g, '') || '8303632103',
              role: 'student',
              status: 'Active'
            };
            authRole = 'student';
          }
        }
      }

      // Finalize Session & Navigate
      if (authUser) {
        authUser.role = authRole;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(authUser));
        localStorage.setItem('eduvision_user', JSON.stringify(authUser));

        showToast(`Welcome ${authUser.full_name}! Signed in as ${authRole.toUpperCase()} 🎉`, 'success');

        setTimeout(() => {
          renderLoggedInHome(authUser, authRole);
          navigateTo('screen-home-placeholder');
        }, 700);
      } else {
        showToast('Account not found. Check credentials or use Quick Demo.', 'error');
      }

    } catch (err) {
      console.error('Universal login error:', err);
      showToast('Authentication encountered an issue. Please try again.', 'error');
    } finally {
      AppState.isAuthenticating = false;
      DOM.btnLoginSubmit.disabled = false;
      if (submitTextEl) submitTextEl.innerHTML = origSubmitHtml;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 5. STUDENT REGISTRATION / CREATE ACCOUNT ENTRY
  // ═══════════════════════════════════════════════════════════
  function handleStudentRegister(e) {
    e.preventDefault();

    const name     = DOM.regName.value.trim();
    const mobile   = DOM.regMobile.value.trim();
    const email    = DOM.regEmail.value.trim();
    const password = DOM.regPassword.value;
    const confirmP = DOM.regConfirmPassword.value;

    if (!name || !mobile || !email || !password) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (password !== confirmP) {
      showToast('Passwords do not match. Please check again.', 'error');
      DOM.regConfirmPassword.focus();
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      DOM.regPassword.focus();
      return;
    }

    DOM.btnRegisterSubmit.disabled = true;
    DOM.btnRegisterSubmit.innerHTML = '<span>Creating Account...</span>';

    setTimeout(() => {
      const newUser = {
        id: 'STD_' + Date.now().toString().slice(-6),
        student_id: 'EDV-' + Math.floor(100000 + Math.random() * 900000),
        full_name: name,
        email: email,
        phone: mobile,
        role: 'student',
        created_at: new Date().toISOString()
      };

      // Save persistent session
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newUser));
      localStorage.setItem('eduvision_user', JSON.stringify(newUser));

      showToast('Account Created Successfully! 🎉', 'success');

      DOM.btnRegisterSubmit.disabled = false;
      DOM.btnRegisterSubmit.innerHTML = 'Create Account &rarr;';

      setTimeout(() => {
        renderLoggedInHome(newUser, 'student');
        navigateTo('screen-home-placeholder');
      }, 700);
    }, 1200);
  }

  // ═══════════════════════════════════════════════════════════
  // 6. RENDER DYNAMIC ROLE MOBILE DASHBOARD (HOME)
  // ═══════════════════════════════════════════════════════════
  function renderLoggedInHome(user, role) {
    if (!user) {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem('eduvision_user');
      if (raw) {
        try { user = JSON.parse(raw); } catch(e) {}
      }
    }
    user = user || { full_name: 'User', role: 'student', id: 'EDV-001' };
    role = role || (user.role || 'student').toLowerCase();

    const homeContainer = document.getElementById('roleHomeContent');
    if (!homeContainer) return;

    let avatarIcon = '🎓';
    let roleTitle = 'Student Portal';
    let themeClass = 'theme-student';
    let idLabel = `Student ID: ${user.student_id || user.id || 'EDV-2026-ACTIVE'}`;
    let kpiHtml = '';
    let trackerHtml = '';

    if (role === 'counsellor') {
      avatarIcon = '👨‍🏫';
      roleTitle = 'Senior Admissions Counsellor';
      themeClass = 'theme-counsellor';
      idLabel = `Emp ID: ${user.employee_id || user.counsellor_id || 'CNS001'} • ${user.branch || 'Head Office'}`;
      kpiHtml = `
        <div class="role-kpi-item"><span class="kpi-val">24</span><span class="kpi-tag">Active Leads</span></div>
        <div class="role-kpi-item"><span class="kpi-val">8</span><span class="kpi-tag">Review Queue</span></div>
        <div class="role-kpi-item"><span class="kpi-val">96%</span><span class="kpi-tag">Follow-up</span></div>
      `;
      trackerHtml = `
        <div class="role-status-banner">
          <h4><span>Today's Counselling Schedule</span> <span style="font-size:0.75rem; color:#059669; font-weight:700;">● Active Desk</span></h4>
          <p>4 Student video counselling calls scheduled today. Application review queue is active.</p>
          <div class="role-progress-track"><div class="role-progress-bar" style="width:75%; background:linear-gradient(90deg, #059669, #34d399);"></div></div>
        </div>
        <div class="inapp-action-grid">
          <div class="inapp-action-tile" onclick="openInAppSheet('counsellor_leads')">
            <span class="tile-icon">👥</span>
            <div class="tile-info"><h5>Student Leads</h5><span>24 Active</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('student_chat')">
            <span class="tile-icon">📞</span>
            <div class="tile-info"><h5>Call Queue</h5><span>4 Today</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">✍️</span>
            <div class="tile-info"><h5>Case Notes</h5><span>Add Remarks</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">📊</span>
            <div class="tile-info"><h5>Follow-up</h5><span>96% Met</span></div>
          </div>
        </div>
      `;
    } else if (role === 'associate') {
      avatarIcon = '🤝';
      roleTitle = user.tier || 'Associate Partner';
      themeClass = 'theme-associate';
      idLabel = `Partner Code: ${user.partner_code || user.id || 'AP-DELHI-01'}`;
      kpiHtml = `
        <div class="role-kpi-item"><span class="kpi-val">38</span><span class="kpi-tag">Referred</span></div>
        <div class="role-kpi-item"><span class="kpi-val">14</span><span class="kpi-tag">Enrolled</span></div>
        <div class="role-kpi-item"><span class="kpi-val">₹2.4L</span><span class="kpi-tag">Commission</span></div>
      `;
      trackerHtml = `
        <div class="role-status-banner">
          <h4><span>Partner Commission Payout</span> <span style="font-size:0.75rem; color:#d97706; font-weight:700;">● Verified</span></h4>
          <p>September payout cycle verified: ₹1,40,000 ready for bank clearance.</p>
          <div class="role-progress-track"><div class="role-progress-bar" style="width:85%; background:linear-gradient(90deg, #d97706, #fbbf24);"></div></div>
        </div>
        <div class="inapp-action-grid">
          <div class="inapp-action-tile" onclick="openInAppSheet('partner_leads')">
            <span class="tile-icon">👥</span>
            <div class="tile-info"><h5>Candidate Leads</h5><span>38 Total</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('partner_refer')">
            <span class="tile-icon">➕</span>
            <div class="tile-info"><h5>Refer Student</h5><span>1-Tap Lead</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('partner_leads')">
            <span class="tile-icon">💰</span>
            <div class="tile-info"><h5>Commission</h5><span>₹1.4L Due</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">🏆</span>
            <div class="tile-info"><h5>Agency Tier</h5><span>Platinum</span></div>
          </div>
        </div>
      `;
    } else if (role === 'teamleader') {
      avatarIcon = '👑';
      roleTitle = 'Operations Team Leader';
      themeClass = 'theme-teamleader';
      idLabel = `Leader ID: ${user.employee_id || user.id || 'TL001'} • ${user.branch || 'Operations'}`;
      kpiHtml = `
        <div class="role-kpi-item"><span class="kpi-val">12</span><span class="kpi-tag">Counsellors</span></div>
        <div class="role-kpi-item"><span class="kpi-val">186</span><span class="kpi-tag">Total Admits</span></div>
        <div class="role-kpi-item"><span class="kpi-val">94%</span><span class="kpi-tag">Q3 Target</span></div>
      `;
      trackerHtml = `
        <div class="role-status-banner">
          <h4><span>Team Target Progress (Q3)</span> <span style="font-size:0.75rem; color:#7c3aed; font-weight:700;">● On Track</span></h4>
          <p>186 out of 200 target admissions achieved. 14 more needed before month end.</p>
          <div class="role-progress-track"><div class="role-progress-bar" style="width:93%; background:linear-gradient(90deg, #7c3aed, #a78bfa);"></div></div>
        </div>
        <div class="inapp-action-grid">
          <div class="inapp-action-tile" onclick="openInAppSheet('counsellor_leads')">
            <span class="tile-icon">👥</span>
            <div class="tile-info"><h5>Counsellors</h5><span>12 Active</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">🎯</span>
            <div class="tile-info"><h5>Q3 Target</h5><span>186 / 200</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">🚨</span>
            <div class="tile-info"><h5>Escalations</h5><span>1 Pending</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">📑</span>
            <div class="tile-info"><h5>Operations</h5><span>Daily Audit</span></div>
          </div>
        </div>
      `;
    } else if (role === 'admin') {
      avatarIcon = '🛡️';
      roleTitle = 'System Administrator';
      themeClass = 'theme-admin';
      idLabel = `Admin ID: ${user.admin_id || user.employee_id || 'ADM001'} • Security L5`;
      kpiHtml = `
        <div class="role-kpi-item"><span class="kpi-val">1,480</span><span class="kpi-tag">Total Users</span></div>
        <div class="role-kpi-item"><span class="kpi-val">99.9%</span><span class="kpi-tag">Uptime</span></div>
        <div class="role-kpi-item"><span class="kpi-val">0</span><span class="kpi-tag">Threats</span></div>
      `;
      trackerHtml = `
        <div class="role-status-banner">
          <h4><span>System Health & Security</span> <span style="font-size:0.75rem; color:#e11d48; font-weight:700;">● Secure</span></h4>
          <p>Supabase live sync connected. All 5 portal gateways operational with 256-bit encryption.</p>
          <div class="role-progress-track"><div class="role-progress-bar" style="width:100%; background:linear-gradient(90deg, #e11d48, #fb7185);"></div></div>
        </div>
        <div class="inapp-action-grid">
          <div class="inapp-action-tile" onclick="openInAppSheet('admin_security')">
            <span class="tile-icon">🛡️</span>
            <div class="tile-info"><h5>Security Core</h5><span>256-Bit SSL</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">👥</span>
            <div class="tile-info"><h5>User Directory</h5><span>1,480 Accounts</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('admin_security')">
            <span class="tile-icon">⚡</span>
            <div class="tile-info"><h5>Gateways</h5><span>5 Portals Up</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('default')">
            <span class="tile-icon">📜</span>
            <div class="tile-info"><h5>Audit Logs</h5><span>Encrypted</span></div>
          </div>
        </div>
      `;
    } else {
      // Default: Student
      avatarIcon = '🎓';
      roleTitle = 'B.Tech (Computer Science & AI)';
      themeClass = 'theme-student';
      idLabel = `Student ID: ${user.student_id || 'EDV-2026-ACTIVE'}`;
      kpiHtml = `
        <div class="role-kpi-item"><span class="kpi-val">2</span><span class="kpi-tag">Applications</span></div>
        <div class="role-kpi-item"><span class="kpi-val">1</span><span class="kpi-tag">Offers</span></div>
        <div class="role-kpi-item"><span class="kpi-val">4/4</span><span class="kpi-tag">Docs Done</span></div>
      `;
      trackerHtml = `
        <div class="role-status-banner">
          <h4><span>Admission Status</span> <span style="font-size:0.75rem; color:#2563eb; font-weight:700;">● In Progress</span></h4>
          <p>Offer letter received from Amity University. Counsellor Priya assigned to your file.</p>
          <div class="role-progress-track"><div class="role-progress-bar" style="width:65%;"></div></div>
        </div>
        <div class="inapp-action-grid">
          <div class="inapp-action-tile" onclick="openInAppSheet('student_apps')">
            <span class="tile-icon">📄</span>
            <div class="tile-info"><h5>Applications</h5><span>2 Active</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('student_unis')">
            <span class="tile-icon">🏛️</span>
            <div class="tile-info"><h5>Universities</h5><span>15 Matches</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('student_chat')">
            <span class="tile-icon">💬</span>
            <div class="tile-info"><h5>Counsellor</h5><span>Priya Sharma</span></div>
          </div>
          <div class="inapp-action-tile" onclick="openInAppSheet('student_docs')">
            <span class="tile-icon">📁</span>
            <div class="tile-info"><h5>Doc Vault</h5><span>4 Verified</span></div>
          </div>
        </div>
      `;
    }

    // Populate Student Dashboard Header & Profile
    const greetingEl = document.getElementById('dashGreetingName');
    const profileNameEl = document.getElementById('profileFullName');
    const profileEmailEl = document.getElementById('profileEmail');
    const firstName = (user.full_name || 'Raghav').split(' ')[0];

    if (greetingEl) greetingEl.textContent = firstName + '!';
    if (profileNameEl) profileNameEl.textContent = user.full_name || 'Raghav Raj';
    if (profileEmailEl) profileEmailEl.textContent = user.email || 'raghavraj@gmail.com';

    // Show/hide staff portal container
    const staffEmbed = document.getElementById('staffPortalEmbed');
    if (role === 'student') {
      if (staffEmbed) staffEmbed.style.display = 'none';
      if (window.switchAppView) window.switchAppView('home');
      return;
    }

    if (staffEmbed) staffEmbed.style.display = 'block';
    if (window.switchAppView) window.switchAppView('home');

    homeContainer.innerHTML = `
      <div class="role-home-hero-card ${themeClass}">
        <div class="role-avatar-row">
          <div class="role-avatar-circle">${avatarIcon}</div>
          <div class="role-user-names">
            <h2>${user.full_name || 'User'}</h2>
            <p>${idLabel}</p>
            <span class="role-badge-pill-inline">${roleTitle}</span>
          </div>
        </div>
        <div class="role-kpi-grid">
          ${kpiHtml}
        </div>
      </div>
      ${trackerHtml}
    `;
  }

  // ── APP SUB-VIEW ROUTING (SCREENS 4 - 10) ──
  window.switchAppView = function(viewName) {
    document.querySelectorAll('.app-sub-view').forEach(v => v.classList.remove('active-view'));
    const target = document.getElementById(`view-dash-${viewName}`);
    if (target) {
      target.classList.add('active-view');
      const host = document.getElementById('dashScrollHost');
      if (host) host.scrollTop = 0;
    }

    // Update bottom nav tab highlight
    const mainTabs = ['home', 'courses', 'applications', 'counselling', 'profile'];
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      if (mainTabs.includes(viewName)) {
        btn.classList.toggle('active', tab === viewName);
      }
    });
  };

  window.switchAppTab = function(tabName) {
    window.switchAppView(tabName);
  };

  // ── COURSES FILTERING (SCREEN 5) ──
  window.filterCourseCategory = function(cat, btn) {
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    }
    const cards = document.querySelectorAll('.course-nav-card');
    cards.forEach(card => {
      if (cat === 'all' || card.getAttribute('data-cat') === cat) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  window.filterCourseCards = function(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.course-nav-card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
    });
  };

  // ── APPLICATION STATUS FILTERING (SCREEN 6) ──
  window.filterAppStatus = function(status, btn) {
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    }
    const cards = document.querySelectorAll('.tracking-app-card');
    cards.forEach(card => {
      if (status === 'all' || card.getAttribute('data-status') === status) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  };

  // ── NOTIFICATION FILTERING (SCREEN 9) ──
  window.filterNotifCategory = function(cat, btn) {
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    }
    const items = document.querySelectorAll('.notif-item-card');
    items.forEach(item => {
      if (cat === 'all' || item.getAttribute('data-cat') === cat) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  };

  window.markAllNotificationsRead = function() {
    const dot = document.querySelector('.bell-unread-dot');
    if (dot) dot.style.display = 'none';
    showToast('All notifications marked as read', 'success');
  };

  // ── IN-APP MODAL SHEET CONTROLLER (100% IN-APP) ──
  window.openInAppSheet = function(actionType) {
    const sheet = document.getElementById('inAppSheetBackdrop');
    const titleEl = document.getElementById('inAppSheetTitle');
    const subtitleEl = document.getElementById('inAppSheetSubtitle');
    const iconEl = document.getElementById('inAppSheetIcon');
    const bodyEl = document.getElementById('inAppSheetBody');
    if (!sheet || !bodyEl) return;

    const data = getInAppSheetContent(actionType);
    if (titleEl) titleEl.textContent = data.title;
    if (subtitleEl) subtitleEl.textContent = data.subtitle;
    if (iconEl) iconEl.textContent = data.icon;
    bodyEl.innerHTML = data.html;

    sheet.classList.add('active');
  };

  window.closeInAppSheet = function() {
    const sheet = document.getElementById('inAppSheetBackdrop');
    if (sheet) sheet.classList.remove('active');
  };

  function getInAppSheetContent(type) {
    switch (type) {
      case 'student_apps':
        return {
          icon: '📄',
          title: 'My Applications',
          subtitle: 'Active admission files for Fall 2026',
          html: `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <strong style="color:#0f172a;">Amity University</strong>
                <span style="color:#059669; font-weight:700; font-size:0.75rem; background:#dcfce7; padding:2px 8px; border-radius:8px;">Offer Letter Issued</span>
              </div>
              <p style="font-size:0.78rem; color:#64748b; margin:0 0 6px;">B.Tech Computer Science & AI • Application #AM-8842</p>
              <div style="font-size:0.75rem; color:#2563eb; font-weight:600;">Status: Ready for Fee Verification</div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <strong style="color:#0f172a;">SRM Institute of Tech</strong>
                <span style="color:#2563eb; font-weight:700; font-size:0.75rem; background:#dbeafe; padding:2px 8px; border-radius:8px;">Under Review</span>
              </div>
              <p style="font-size:0.78rem; color:#64748b; margin:0 0 6px;">BCA (Cloud Computing) • Application #SRM-1904</p>
              <div style="font-size:0.75rem; color:#64748b;">Status: Counsellor Priya verifying 12th marksheet</div>
            </div>
          `
        };
      case 'student_unis':
        return {
          icon: '🏛️',
          title: 'Matched Universities',
          subtitle: '15 Top verified university partners',
          html: `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="padding:10px 12px; background:#f8fafc; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>Amity University, Noida</strong><div style="font-size:0.75rem; color:#64748b;">NAAC A+ • Top Placement</div></div>
                <span style="color:#059669; font-weight:700; font-size:0.78rem;">98% Match</span>
              </div>
              <div style="padding:10px 12px; background:#f8fafc; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>SRM Institute, Chennai</strong><div style="font-size:0.75rem; color:#64748b;">NIRF Top 30 • Tech Hub</div></div>
                <span style="color:#059669; font-weight:700; font-size:0.78rem;">94% Match</span>
              </div>
              <div style="padding:10px 12px; background:#f8fafc; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>Manipal University, Jaipur</strong><div style="font-size:0.75rem; color:#64748b;">Global Accreditation</div></div>
                <span style="color:#059669; font-weight:700; font-size:0.78rem;">91% Match</span>
              </div>
            </div>
          `
        };
      case 'student_chat':
        return {
          icon: '💬',
          title: 'Counsellor Desk Chat',
          subtitle: 'Connected with Priya Sharma (Senior Counsellor)',
          html: `
            <div style="padding:12px; background:#eff6ff; border-radius:12px; border-left:4px solid #2563eb;">
              <div style="font-weight:700; font-size:0.8rem; color:#1e40af; margin-bottom:4px;">Priya Sharma:</div>
              <div style="font-size:0.82rem; color:#1e293b;">"Hello Raghav! I have reviewed your Amity application. The provisional seat letter is ready. Let me know when we can finalize document submission!"</div>
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <input type="text" placeholder="Type your message..." style="flex:1; height:42px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:0.84rem;">
              <button onclick="showToast('Message sent to Counsellor Priya!', 'success')" style="background:#2563eb; color:#fff; border:none; border-radius:8px; padding:0 16px; font-weight:700; cursor:pointer;">Send</button>
            </div>
          `
        };
      case 'student_docs':
        return {
          icon: '📁',
          title: 'Verified Document Vault',
          subtitle: 'Direct encrypted cloud storage for admissions',
          html: `
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; padding:10px 12px; background:#f8fafc; border-radius:8px;">
                <span>📄 10th Marksheet</span>
                <span style="color:#059669; font-weight:700; font-size:0.75rem;">✓ Verified</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:10px 12px; background:#f8fafc; border-radius:8px;">
                <span>📄 12th Marksheet</span>
                <span style="color:#059669; font-weight:700; font-size:0.75rem;">✓ Verified</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:10px 12px; background:#f8fafc; border-radius:8px;">
                <span>🆔 Aadhaar Identity</span>
                <span style="color:#059669; font-weight:700; font-size:0.75rem;">✓ Verified</span>
              </div>
            </div>
          `
        };
      case 'counsellor_leads':
        return {
          icon: '👥',
          title: 'Assigned Student Leads',
          subtitle: 'Active admission inquiries assigned to you',
          html: `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="padding:10px 12px; background:#f8fafc; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>Raghav Raj</strong><div style="font-size:0.75rem; color:#64748b;">B.Tech CSE • Amity Offer</div></div>
                <button onclick="showToast('Calling Raghav Raj (+91 8303632103)...', 'info')" style="padding:4px 10px; background:#059669; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">📞 Call</button>
              </div>
              <div style="padding:10px 12px; background:#f8fafc; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>Ananya Verma</strong><div style="font-size:0.75rem; color:#64748b;">MBA Marketing • Interview Done</div></div>
                <button onclick="showToast('Calling Ananya Verma...', 'info')" style="padding:4px 10px; background:#059669; color:#fff; border:none; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;">📞 Call</button>
              </div>
            </div>
          `
        };
      case 'partner_leads':
        return {
          icon: '👥',
          title: 'Partner Candidate Pipeline',
          subtitle: '38 candidates referred under Apex Global',
          html: `
            <div style="padding:10px 12px; background:#f8fafc; border-radius:8px; margin-bottom:8px;">
              <div style="display:flex; justify-content:space-between;">
                <strong>14 Enrolled Candidates</strong>
                <span style="color:#d97706; font-weight:700;">₹1,40,000 Verified</span>
              </div>
              <p style="font-size:0.78rem; color:#64748b; margin:4px 0 0;">24 under active campus admission review.</p>
            </div>
          `
        };
      case 'partner_refer':
        return {
          icon: '➕',
          title: '1-Tap Candidate Referral',
          subtitle: 'Submit a new student lead to EduVision desk',
          html: `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <input type="text" placeholder="Candidate Full Name" style="height:40px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:0.84rem;">
              <input type="tel" placeholder="Mobile Number" style="height:40px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:0.84rem;">
              <input type="text" placeholder="Interested Course (e.g. B.Tech / MBA)" style="height:40px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:0.84rem;">
              <button onclick="showToast('Candidate submitted to Admissions Desk!', 'success'); closeInAppSheet();" style="height:42px; background:#d97706; color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Submit Lead &rarr;</button>
            </div>
          `
        };
      case 'admin_security':
        return {
          icon: '🛡️',
          title: 'Security & Cluster Audit',
          subtitle: 'Live system integrity & database status',
          html: `
            <div style="padding:12px; background:#f8fafc; border-radius:10px; font-size:0.8rem; line-height:1.6;">
              <div>🟢 <strong>Supabase Live Connection:</strong> Healthy (Latency: 28ms)</div>
              <div>🔒 <strong>SSL Encryption:</strong> 256-Bit TLS 1.3 Active</div>
              <div>🛡️ <strong>Portal Protection:</strong> Anti-Clickjacking & Brute-Force Active</div>
              <div>⚡ <strong>Cluster Status:</strong> 0 active alerts across 5 gateways</div>
            </div>
          `
        };
      case 'course_detail_btech':
        return {
          icon: '🎓',
          title: 'B.Tech Engineering',
          subtitle: 'Computer Science, AI & Emerging Tech',
          html: `
            <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
              <p style="margin-bottom:8px;"><strong>Duration:</strong> 4 Years (8 Semesters) • Full-Time Degree</p>
              <p style="margin-bottom:8px;"><strong>Eligibility:</strong> 10+2 with PCM (Minimum 60% aggregate)</p>
              <div style="padding:10px 12px; background:#eff6ff; border-radius:10px; margin-bottom:10px; border-left:4px solid #2563eb;">
                <div style="font-weight:700; color:#1e40af; margin-bottom:2px;">Top Universities (120+ Partners):</div>
                <div style="font-size:0.78rem; color:#1e293b;">• Lovely Professional University (LPU)<br>• SRM Institute of Science & Technology<br>• Amity University<br>• Sandip University</div>
              </div>
              <p style="font-size:0.78rem; color:#059669; font-weight:700; margin-bottom:12px;">Average Package: ₹8.5 LPA — ₹42 LPA</p>
              <button onclick="showToast('B.Tech application file initialized!', 'success'); closeInAppSheet(); switchAppView('applications');" style="width:100%; height:42px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer; font-size:0.84rem;">Apply for B.Tech &rarr;</button>
            </div>
          `
        };
      case 'course_detail_mba':
        return {
          icon: '💼',
          title: 'MBA Management',
          subtitle: 'Global Master of Business Administration',
          html: `
            <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
              <p style="margin-bottom:8px;"><strong>Duration:</strong> 2 Years • Dual Specializations Available</p>
              <p style="margin-bottom:8px;"><strong>Specializations:</strong> Marketing, Finance, HR, Business Analytics, FinTech</p>
              <div style="padding:10px 12px; background:#fef3c7; border-radius:10px; margin-bottom:10px; border-left:4px solid #d97706;">
                <div style="font-weight:700; color:#92400e; margin-bottom:2px;">Top B-Schools (80+ Partners):</div>
                <div style="font-size:0.78rem; color:#451a03;">• Amity Business School<br>• Manipal University Jaipur<br>• Kristu Jayanti College</div>
              </div>
              <button onclick="showToast('MBA application initiated!', 'success'); closeInAppSheet(); switchAppView('applications');" style="width:100%; height:42px; background:#0f172a; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer; font-size:0.84rem;">Apply for MBA &rarr;</button>
            </div>
          `
        };
      case 'course_detail_bca':
        return {
          icon: '💻',
          title: 'BCA (Computer Applications)',
          subtitle: 'Software Engineering & Cloud Computing',
          html: `
            <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
              <p style="margin-bottom:8px;"><strong>Duration:</strong> 3 Years • Industry Oriented Projects</p>
              <p style="margin-bottom:8px;"><strong>Tracks:</strong> Full Stack Web Dev, Mobile Apps, Cybersecurity, Cloud Infrastructure</p>
              <p style="font-size:0.78rem; color:#2563eb; font-weight:700; margin-bottom:12px;">Partner Universities: 90+ Across India</p>
              <button onclick="showToast('BCA application file created!', 'success'); closeInAppSheet(); switchAppView('applications');" style="width:100%; height:42px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer; font-size:0.84rem;">Apply for BCA &rarr;</button>
            </div>
          `
        };
      case 'course_detail_bsc':
      case 'course_detail_ba':
        return {
          icon: '📖',
          title: 'Undergraduate Program',
          subtitle: 'Comprehensive Higher Education Degrees',
          html: `
            <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
              <p style="margin-bottom:8px;"><strong>Eligibility:</strong> 10+2 from a recognized board.</p>
              <p style="margin-bottom:12px;">Expert admission mentorship provided with merit-based scholarship eligibility.</p>
              <button onclick="showToast('Inquiry registered! A counsellor will call you.', 'success'); closeInAppSheet();" style="width:100%; height:42px; background:#059669; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer; font-size:0.84rem;">Connect with Counsellor &rarr;</button>
            </div>
          `
        };
      case 'pay_now_sheet':
        return {
          icon: '💳',
          title: 'Pay Application Fee',
          subtitle: 'Lovely Professional University (LPU)',
          html: `
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="padding:12px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; color:#0f172a; font-size:0.88rem;">Application Fee (B.Tech CSE)</div>
                  <div style="font-size:0.72rem; color:#64748b;">Ref ID: #LPU-88219-FEE</div>
                </div>
                <span style="font-size:1.15rem; font-weight:800; color:#0f172a;">₹ 5,000</span>
              </div>
              <div style="font-size:0.75rem; color:#64748b; font-weight:600;">Select Payment Method:</div>
              <div style="display:flex; gap:8px;">
                <button onclick="this.style.borderColor='#2563eb'" style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; font-size:0.78rem; font-weight:700; cursor:pointer;">⚡ UPI / GPay</button>
                <button onclick="this.style.borderColor='#2563eb'" style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; font-size:0.78rem; font-weight:700; cursor:pointer;">💳 Cards</button>
                <button onclick="this.style.borderColor='#2563eb'" style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; font-size:0.78rem; font-weight:700; cursor:pointer;">🏦 Net Banking</button>
              </div>
              <button onclick="showToast('Payment of ₹5,000 completed successfully! Receipt generated.', 'success'); closeInAppSheet(); switchAppView('payments');" style="margin-top:6px; height:44px; background:#059669; color:#fff; border:none; border-radius:10px; font-weight:800; cursor:pointer; font-size:0.88rem;">Pay ₹5,000 Securely &rarr;</button>
            </div>
          `
        };
      case 'career_guidance':
        return {
          icon: '🧭',
          title: 'Career Guidance Assessment',
          subtitle: 'AI Stream Matching & Aptitude Analysis',
          html: `
            <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
              <p style="margin-bottom:8px;">Discover the right degree based on your interests, analytical score, and industry demand.</p>
              <div style="padding:10px 12px; background:#eff6ff; border-radius:10px; margin-bottom:12px;">
                <div style="font-weight:700; color:#1e40af;">Recommended For You:</div>
                <div style="font-size:0.78rem; color:#1e293b;">• Computer Science & AI (96% Match)<br>• Data Analytics & Cloud (91% Match)</div>
              </div>
              <button onclick="showToast('Assessment report emailed to you!', 'success'); closeInAppSheet();" style="width:100%; height:42px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">Download Full Career Report &rarr;</button>
            </div>
          `
        };
      case 'scholarships':
        return {
          icon: '🏆',
          title: 'Scholarship Eligibility Desk',
          subtitle: 'Up to 100% Tuition Fee Waivers',
          html: `
            <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
              <div style="padding:10px 12px; background:#f8fafc; border-radius:8px; margin-bottom:8px;">
                <strong>Merit Scholarship (12th Marks &gt; 90%):</strong>
                <p style="margin:2px 0 0; color:#059669; font-weight:700;">Up to 50% - 100% Tuition Fee Waiver</p>
              </div>
              <div style="padding:10px 12px; background:#f8fafc; border-radius:8px; margin-bottom:10px;">
                <strong>Early Admission Grant:</strong>
                <p style="margin:2px 0 0; color:#d97706; font-weight:700;">Flat ₹25,000 admission fee concession</p>
              </div>
              <button onclick="showToast('Scholarship application submitted for review!', 'success'); closeInAppSheet();" style="width:100%; height:42px; background:#ea580c; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">Apply for Scholarship &rarr;</button>
            </div>
          `
        };
      case 'support':
        return {
          icon: '❓',
          title: 'Support & Helpdesk',
          subtitle: 'Direct WhatsApp and Phone Assistance',
          html: `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="padding:12px; background:#f8fafc; border-radius:10px;">
                <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">EduVision Admission Toll-Free</div>
                <div style="font-size:0.84rem; color:#2563eb; font-weight:700;">📞 1800-EDV-WORLD (1800-338-9675)</div>
                <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">Available Mon - Sat, 9:00 AM to 7:00 PM</div>
              </div>
              <button onclick="showToast('WhatsApp Chat session initiated (+91 8303632103)', 'success')" style="height:42px; background:#16a34a; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">💬 Chat on WhatsApp</button>
            </div>
          `
        };
      case 'edit_profile':
        return {
          icon: '👤',
          title: 'Edit Student Profile',
          subtitle: 'Update your contact and academic records',
          html: `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <input type="text" value="Raghav Raj" id="editProfName" style="height:40px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:0.84rem;">
              <input type="email" value="raghavraj@gmail.com" id="editProfEmail" style="height:40px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:0.84rem;">
              <input type="tel" value="+91 8303632103" id="editProfPhone" style="height:40px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:0.84rem;">
              <button onclick="document.getElementById('profileFullName').textContent = document.getElementById('editProfName').value; showToast('Profile updated successfully!', 'success'); closeInAppSheet();" style="height:42px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">Save Changes</button>
            </div>
          `
        };
      case 'settings':
        return {
          icon: '⚙️',
          title: 'Settings & Security',
          subtitle: 'Preferences and data controls',
          html: `
            <div style="display:flex; flex-direction:column; gap:8px; font-size:0.84rem;">
              <label style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#f8fafc; border-radius:8px;">
                <span>Push Notifications</span>
                <input type="checkbox" checked>
              </label>
              <label style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#f8fafc; border-radius:8px;">
                <span>Admission SMS Alerts</span>
                <input type="checkbox" checked>
              </label>
              <label style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#f8fafc; border-radius:8px;">
                <span>Biometric / App Lock</span>
                <input type="checkbox">
              </label>
            </div>
          `
        };
      default:
        return {
          icon: '📱',
          title: 'In-App Operational Feature',
          subtitle: 'Managed securely inside EduVision App',
          html: `
            <div style="padding:14px; background:#f8fafc; border-radius:12px; text-align:center;">
              <p style="margin:0; font-size:0.85rem; color:#475569;">All actions are processed directly inside this mobile application interface with instant local synchronization.</p>
            </div>
          `
        };
    }
  }

  // ── USER SIGN OUT ──
  window.devLogoutUser = function() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem('eduvision_user');
    localStorage.removeItem('eduvision_admin');
    localStorage.removeItem('eduvision_counsellor');
    localStorage.removeItem('eduvision_partner');
    localStorage.removeItem('eduvision_team_leader');
    showToast('Signed out successfully! Returning to Login...', 'info');
    setTimeout(() => {
      navigateTo('screen-login');
    }, 500);
  };

  // ── TOGGLE PASSWORD VISIBILITY ──
  window.togglePasswordInput = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  };

  // ── DEVELOPER TESTING HELPERS (ON LAPTOP TOOLBAR) ──
  window.devReplaySplash = function() {
    navigateTo('screen-splash');
    runSplashSequence();
    showToast('✨ Splash Loading Replayed! (0% → 100%)', 'info');
  };

  window.devResetOnboarding = function() {
    localStorage.removeItem(STORAGE_ONBOARDED_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem('eduvision_user');
    showToast('First-time app state reset! Reloading launch sequence...', 'info');
    setTimeout(() => {
      window.location.hash = '';
      window.location.reload();
    }, 700);
  };

  window.devToggleFullWindow = function() {
    if (DOM.mobileFrame) {
      DOM.mobileFrame.classList.toggle('full-window-mode');
    }
  };

  window.devDirectToLogin = function() {
    navigateTo('screen-login');
  };

  window.devDirectToDashboard = function() {
    renderLoggedInHome({ full_name: 'Raghav Raj', role: 'student', email: 'raghavraj@gmail.com' }, 'student');
    navigateTo('screen-home-placeholder');
  };

  // ── EVENT BINDINGS ──
  function initEventBindings() {
    // Onboarding Buttons
    if (DOM.btnSkip) DOM.btnSkip.addEventListener('click', finishOnboarding);
    if (DOM.btnOnboardingCta) DOM.btnOnboardingCta.addEventListener('click', handleOnboardingNext);

    DOM.indicatorDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide') || '0', 10);
        goToSlide(slideIndex);
      });
    });

    // Student / Role Entry Setup
    setupEntryScreen();

    // Universal Login Form Submission
    if (DOM.loginForm) DOM.loginForm.addEventListener('submit', handleUniversalLogin);

    // Register Form Submission
    if (DOM.registerForm) DOM.registerForm.addEventListener('submit', handleStudentRegister);

    // Navigation Switches
    const btnToRegister = document.getElementById('btnSwitchToRegister');
    if (btnToRegister) {
      btnToRegister.addEventListener('click', () => navigateTo('screen-register'));
    }

    const btnToLogin = document.getElementById('btnSwitchToLogin');
    if (btnToLogin) {
      btnToLogin.addEventListener('click', () => navigateTo('screen-login'));
    }

    const btnBackFromLogin = document.getElementById('btnBackFromLogin');
    if (btnBackFromLogin) {
      btnBackFromLogin.addEventListener('click', () => navigateTo('screen-entry'));
    }

    const btnBackFromRegister = document.getElementById('btnBackFromRegister');
    if (btnBackFromRegister) {
      btnBackFromRegister.addEventListener('click', () => navigateTo('screen-login'));
    }

    const btnBackFromEntry = document.getElementById('btnBackFromEntry');
    if (btnBackFromEntry) {
      btnBackFromEntry.addEventListener('click', () => {
        goToSlide(3);
        navigateTo('screen-onboarding');
      });
    }

    // Role Segmented Tabs in Scroller
    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        switchRole(role);
      });
    });

    // Quick 1-Tap Demo Testing Fill Button
    const btnQuickFill = document.getElementById('btnQuickFill');
    if (btnQuickFill) {
      btnQuickFill.addEventListener('click', () => {
        const cfg = ROLE_CONFIGS[AppState.selectedRole || 'student'];
        if (cfg && cfg.quickFill) {
          DOM.loginIdentifier.value = cfg.quickFill.identifier;
          DOM.loginPassword.value = cfg.quickFill.password;
          showToast(`Filled verified demo credentials for ${cfg.name}!`, 'info');
        }
      });
    }

    // Google Sign-In Button
    const btnGoogle = document.getElementById('btnGoogleSignIn');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => {
        showToast('Connecting to Google Education Services...', 'info');
        setTimeout(() => {
          const googleUser = {
            id: 'GOOGLE_STD_' + Date.now().toString().slice(-6),
            student_id: 'EDV-GOOGLE-2026',
            full_name: 'Raghav Raj',
            email: 'raghavraj@gmail.com',
            role: 'student'
          };
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(googleUser));
          localStorage.setItem('eduvision_user', JSON.stringify(googleUser));
          showToast('Google Sign-In Successful! Welcome 👋', 'success');
          setTimeout(() => {
            renderLoggedInHome(googleUser, 'student');
            navigateTo('screen-home-placeholder');
          }, 800);
        }, 1100);
      });
    }

    // Forgot Password Button
    const btnForgot = document.getElementById('btnForgotPassword');
    if (btnForgot) {
      btnForgot.addEventListener('click', () => {
        const idVal = DOM.loginIdentifier ? DOM.loginIdentifier.value.trim() : '';
        const msg = idVal ? `Password reset instructions sent to ${idVal}` : 'Please enter your registered Email or Mobile number first.';
        showToast(msg, idVal ? 'success' : 'info');
      });
    }
  }

  // ── INIT APP ON LOAD ──
  window.addEventListener('DOMContentLoaded', () => {
    initEventBindings();
    runSplashSequence();
  });

})();
