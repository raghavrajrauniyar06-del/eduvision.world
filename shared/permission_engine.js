// ══════════════════════════════════════════════════════════════════════════════
// EDUVISION CENTRAL PERMISSION & FEATURE CONTROL ENGINE (v2.0 ENTERPRISE)
// CTO CONTROL ENGINE — RAGHAV
// ══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const SUPABASE_PROJECT_URL = 'https://ewxvqpyusveiynplzxed.supabase.co';
  const SUPABASE_ANON_KEY    = 'sb_publishable_NFUbLO9g-UTt-Z9fUuQoyw__Xrxq2IC';

  // Default Fallback Module Catalog (Used if database tables are in process of hydration)
  const FALLBACK_MODULE_CATALOG = {
    // CORE
    'core_dashboard': { category: 'core', name: 'Executive & Main Dashboard', icon: 'fa-chart-pie' },
    'core_profile': { category: 'core', name: 'User Profile & Account', icon: 'fa-user' },
    'core_notifications': { category: 'core', name: 'Notifications & Alerts', icon: 'fa-bell' },
    'core_search': { category: 'core', name: 'Global Search & Finder', icon: 'fa-magnifying-glass' },
    // COMMUNICATION
    'comm_chat': { category: 'communication', name: 'Command Chat Hub', icon: 'fa-comments' },
    'comm_group_chat': { category: 'communication', name: 'Group Channels & Chatrooms', icon: 'fa-users' },
    'comm_direct_messaging': { category: 'communication', name: 'Direct Staff Messaging', icon: 'fa-paper-plane' },
    'comm_broadcast': { category: 'communication', name: 'System Broadcast Channel', icon: 'fa-bullhorn' },
    'comm_reactions': { category: 'communication', name: 'Emoji & Reactions', icon: 'fa-face-smile' },
    'comm_message_edit': { category: 'communication', name: 'Message Edit', icon: 'fa-pen-to-square' },
    'comm_delete_everyone': { category: 'communication', name: 'Delete for Everyone', icon: 'fa-trash-can' },
    'comm_moderate_chat': { category: 'communication', name: 'Chat Moderation & Overrides', icon: 'fa-shield' },
    'comm_group_create': { category: 'communication', name: 'Create Custom Chat Groups', icon: 'fa-folder-plus' },
    'comm_group_manage': { category: 'communication', name: 'Manage Group Members', icon: 'fa-user-gear' },
    // STUDENT
    'student_dashboard': { category: 'student', name: 'Student Portal Dashboard', icon: 'fa-graduation-cap' },
    'student_profile': { category: 'student', name: 'Student Profile & Details', icon: 'fa-id-card' },
    'student_applications': { category: 'student', name: 'University Applications', icon: 'fa-file-signature' },
    'student_universities': { category: 'student', name: 'Browse Partner Universities', icon: 'fa-building-columns' },
    'student_courses': { category: 'student', name: 'Search Degree Courses', icon: 'fa-book-open' },
    'student_submission': { category: 'student', name: 'Document Submission Desk', icon: 'fa-upload' },
    'student_crm': { category: 'student', name: 'Student Tracking & CRM', icon: 'fa-users-viewfinder' },
    // COUNSELLOR
    'counsellor_dashboard': { category: 'counsellor', name: 'Counsellor Workspace', icon: 'fa-briefcase' },
    'counsellor_leads': { category: 'counsellor', name: 'Leads Management & Pipeline', icon: 'fa-filter-circle-dollar' },
    'counsellor_followups': { category: 'counsellor', name: 'Follow-ups Calendar & Tasks', icon: 'fa-calendar-check' },
    'counsellor_students': { category: 'counsellor', name: 'Counsellor Student Allocation', icon: 'fa-user-check' },
    'counsellor_applications': { category: 'counsellor', name: 'Counsellor Applications Hub', icon: 'fa-file-signature' },
    'counsellor_attendance': { category: 'counsellor', name: 'Counsellor Attendance Hub', icon: 'fa-clock' },
    'counsellor_reports': { category: 'counsellor', name: 'Counsellor Performance Metrics', icon: 'fa-chart-line' },
    'counsellor_call_recordings': { category: 'counsellor', name: 'Call Recording & Cloud Audio Vault', icon: 'fa-microphone-lines' },
    'counsellor_delete_recordings': { category: 'counsellor', name: 'Delete Call Recordings (Audio Vault)', icon: 'fa-trash-can' },
    // TEAM LEADER
    'team_dashboard': { category: 'teamleader', name: 'Team Leader Command Dashboard', icon: 'fa-chess-king' },
    'team_counsellors': { category: 'teamleader', name: 'Counsellor Team Oversight', icon: 'fa-users-gear' },
    'team_crm': { category: 'teamleader', name: 'Team CRM & Student Pipeline', icon: 'fa-sitemap' },
    'team_attendance': { category: 'teamleader', name: 'Team Attendance Oversight', icon: 'fa-clipboard-user' },
    'team_performance': { category: 'teamleader', name: 'Team Performance & Targets', icon: 'fa-trophy' },
    // ADMIN
    'admin_dashboard': { category: 'admin', name: 'Executive Overview', icon: 'fa-chart-column' },
    'admin_staff': { category: 'admin', name: 'Staff & Role Promotions', icon: 'fa-user-shield' },
    'admin_attendance': { category: 'admin', name: 'Master Attendance Hub', icon: 'fa-calendar-days' },
    'admin_counsellorcrm': { category: 'admin', name: 'Master Counsellor CRM', icon: 'fa-address-card' },
    'admin_partners': { category: 'admin', name: 'Associate Partners Desk', icon: 'fa-handshake' },
    'admin_students': { category: 'admin', name: 'Master Student Directory', icon: 'fa-user-graduate' },
    'admin_leads': { category: 'admin', name: 'Master Leads CRM Oversight', icon: 'fa-funnel-dollar' },
    'crm_web_forms': { category: 'admin', name: 'Web Form Submissions & Enquiries', icon: 'fa-file-signature' },
    'admin_universities': { category: 'admin', name: 'Universities & Master Course Fees', icon: 'fa-landmark' },
    'admin_security': { category: 'admin', name: 'System Health & Security', icon: 'fa-shield-halved' },
    // ASSOCIATE
    'associate_dashboard': { category: 'associate', name: 'Associate Partner Dashboard', icon: 'fa-briefcase' },
    'associate_universities': { category: 'associate', name: 'Partner Universities Directory', icon: 'fa-building' },
    'associate_courses': { category: 'associate', name: 'Degree Courses Catalog', icon: 'fa-list-check' },
    'associate_fees': { category: 'associate', name: 'Fee Structure & EMI Matrix', icon: 'fa-receipt' },
    'associate_leads': { category: 'associate', name: 'Referral & Student Submissions', icon: 'fa-user-plus' },
    'associate_account': { category: 'associate', name: 'Agency Profile & Commission', icon: 'fa-wallet' },
    // SYSTEM
    'system_permission_control': { category: 'system', name: 'CTO Master Permission Control', icon: 'fa-fingerprint' },
    'system_feature_locks': { category: 'system', name: 'Emergency Global Feature Locks', icon: 'fa-power-off' },
    'system_audit_logs': { category: 'system', name: 'Immutable Master Audit Trail', icon: 'fa-clock-rotate-left' }
  };

  // Inject Luxury Glass Styles for Locked State UI & Badges
  function injectPermissionStyles() {
    if (document.getElementById('eduvision-permission-engine-styles')) return;
    const style = document.createElement('style');
    style.id = 'eduvision-permission-engine-styles';
    style.textContent = `
      /* ── EDUVISION LOCKED STATE LUXURY UI ── */
      .eduvision-feature-locked-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 480px;
        width: 100%;
        padding: 40px 24px;
        box-sizing: border-box;
        animation: lockFadeSpring 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes lockFadeSpring {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .locked-card-liquid {
        background: radial-gradient(circle at 50% 0%, rgba(201, 147, 42, 0.12) 0%, rgba(13, 20, 36, 0.94) 75%), rgba(10, 15, 28, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 28px;
        max-width: 580px;
        width: 100%;
        padding: 44px 36px 36px;
        text-align: center;
        backdrop-filter: blur(45px) saturate(210%);
        -webkit-backdrop-filter: blur(45px) saturate(210%);
        box-shadow: 
          0 35px 90px rgba(0, 0, 0, 0.85),
          0 0 50px rgba(201, 147, 42, 0.12),
          inset 0 1.5px 0 rgba(255, 255, 255, 0.28);
        position: relative;
        overflow: hidden;
      }

      .locked-card-liquid::before {
        content: '';
        position: absolute;
        top: 0; left: 15%; right: 15%; height: 1.5px;
        background: linear-gradient(90deg, transparent 0%, rgba(201, 147, 42, 0.8) 50%, transparent 100%);
      }

      .locked-icon-halo {
        width: 76px;
        height: 76px;
        border-radius: 22px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(201, 147, 42, 0.25) 100%);
        border: 1px solid rgba(201, 147, 42, 0.45);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #f7d377;
        font-size: 2rem;
        margin-bottom: 22px;
        box-shadow: 
          0 10px 30px rgba(239, 68, 68, 0.25),
          inset 0 1px 1px rgba(255, 255, 255, 0.4);
        animation: lockPulseGlow 3.5s ease-in-out infinite alternate;
      }

      @keyframes lockPulseGlow {
        0% { transform: scale(1); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.25); }
        100% { transform: scale(1.04); box-shadow: 0 14px 45px rgba(201, 147, 42, 0.45); }
      }

      .locked-title {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0.6px;
        color: #ffffff;
        margin: 0 0 10px 0;
        text-transform: uppercase;
      }

      .locked-subtitle {
        font-size: 0.95rem;
        color: #cbd5e1;
        line-height: 1.55;
        margin: 0 auto 24px auto;
        max-width: 440px;
      }

      .locked-meta-box {
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 16px;
        padding: 16px 20px;
        text-align: left;
        margin-bottom: 24px;
      }

      .locked-meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 0.84rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .locked-meta-row:last-child {
        border-bottom: none;
      }

      .locked-meta-label {
        color: #94a3b8;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .locked-meta-value {
        color: #f7d377;
        font-weight: 700;
        font-family: var(--font-mono, monospace);
      }

      .locked-notice-banner {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 99px;
        padding: 6px 16px;
        font-size: 0.78rem;
        font-weight: 700;
        color: #fca5a5;
        letter-spacing: 0.3px;
      }

      /* ── SIDEBAR LOCKED BADGES ── */
      .nav-locked-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(239, 68, 68, 0.18);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #fca5a5;
        padding: 1px 6px;
        border-radius: 6px;
        font-size: 0.65rem;
        font-weight: 800;
        margin-left: auto;
        letter-spacing: 0.4px;
      }

      .nav-item-cto-locked {
        opacity: 0.72;
        transition: opacity 0.2s, background 0.2s;
      }
      .nav-item-cto-locked:hover {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Permission Engine Core Class
  class EduVisionPermissionEngine {
    constructor() {
      this.supabaseUrl = SUPABASE_PROJECT_URL;
      this.supabaseKey = SUPABASE_ANON_KEY;
      this.sb = (window.supabase) ? window.supabase.createClient(this.supabaseUrl, this.supabaseKey) : null;
      this.currentRole = 'student';
      this.currentUserId = '';
      this.isCto = false;
      this.permissionsMap = {};
      this.isHydrated = false;
      this.initPromise = null;
    }

    // Auto-detect current session context
    detectSession() {
      try {
        // 1. Check admin session
        const rawAdmin = localStorage.getItem('eduvision_admin');
        if (rawAdmin) {
          const admin = JSON.parse(rawAdmin);
          this.currentUserId = (admin.employee_id || admin.admin_id || admin.id || '').toUpperCase();
          this.currentRole = (admin.role || 'Admin').toLowerCase();
          const desig = (admin.designation || '').toLowerCase();
          const name = (admin.full_name || admin.name || '').toLowerCase();
          const email = (admin.email || '').toLowerCase();

          if (this.currentUserId === 'CTO001' || desig.includes('technology') || desig.includes('cto') || email.includes('raghavrajrauniyar') || name.includes('raghav')) {
            this.isCto = true;
            this.currentRole = 'cto';
          } else if (this.currentUserId === 'CEO001' || desig.includes('chief executive') || desig.includes('ceo') || this.currentRole === 'ceo' || name.includes('ishika') || email.includes('ceo')) {
            this.isCeo = true;
            this.currentRole = 'ceo';
          } else {
            this.currentRole = 'admin';
          }
          this.currentUser = admin;
          return;
        }

        // 2. Check team leader session
        const rawTl = localStorage.getItem('eduvision_team_leader');
        if (rawTl) {
          const tl = JSON.parse(rawTl);
          this.currentUserId = tl.team_leader_id || tl.employee_id || tl.id || '';
          this.currentRole = (tl.role || 'team_leader').toLowerCase().replace(/\s+/g, '_');
          this.currentUser = tl;
          return;
        }

        // 3. Check counsellor session
        const rawCns = localStorage.getItem('eduvision_counsellor');
        if (rawCns) {
          const cns = JSON.parse(rawCns);
          this.currentUserId = cns.counsellor_id || cns.employee_id || cns.id || '';
          this.currentRole = (cns.role || 'counsellor').toLowerCase().replace(/\s+/g, '_');
          this.currentUser = cns;
          return;
        }

        // 4. Check general user session
        const rawUser = localStorage.getItem('eduvision_user');
        if (rawUser) {
          const user = JSON.parse(rawUser);
          this.currentUserId = user.id || user.student_id || user.phone || user.email || '';
          this.currentRole = (user.role || 'student').toLowerCase().replace(/\s+/g, '_');
          this.currentUser = user;
          return;
        }
      } catch(e) {
        console.warn('[EduPerms] Session detection fallback:', e);
      }
    }

    // Hydrate directly from master matrix object
    hydrateFromMatrix(matrix) {
      if (!matrix || !matrix.modules) return;
      const rawRole = (this.currentRole || 'student').toLowerCase().replace(/\s+/g, '_');
      const role = (rawRole === 'cto' || rawRole === 'super_admin' || rawRole === 'admin' || rawRole === 'ceo') ? 'admin' : rawRole;
      const globalLocks = matrix.globalLocks || {};
      const rolePerms = matrix.rolePermissions || [];
      this.rolePermissionsList = rolePerms;
      this.userOverridesMap = matrix.userOverrides || {};

      matrix.modules.forEach(m => {
        const g = globalLocks[m.module_key] || {};
        let r = rolePerms.find(p => p.module_key === m.module_key && p.role_key === role);
        if (!r && (role === 'senior_counsellor' || role === 'counsellor')) {
          r = rolePerms.find(p => p.module_key === m.module_key && (p.role_key === 'counsellor' || p.role_key === 'senior_counsellor'));
        }
        if (!r) r = {};
        const isGloballyLocked = !!g.is_globally_locked;
        const isRoleEnabled = (r.is_enabled !== undefined) ? !!r.is_enabled : true;
        const isRoleLocked = !!r.is_locked;
        const isAccessible = (!isGloballyLocked && isRoleEnabled && !isRoleLocked);

        this.permissionsMap[m.module_key] = {
          display_name: m.display_name,
          category: m.category,
          icon_class: m.icon_class,
          is_globally_locked: isGloballyLocked,
          is_role_enabled: isRoleEnabled,
          is_role_locked: isRoleLocked,
          is_accessible: isAccessible,
          locked_by_name: isGloballyLocked ? (g.locked_by_name || 'CTO Raghav') : (r.locked_by_name || 'CTO Raghav'),
          lock_reason: isGloballyLocked ? (g.lock_reason || 'Locked by Admin') : (r.lock_reason || 'Restricted by Admin'),
          locked_at: isGloballyLocked ? g.locked_at : r.locked_at,
          actions: r.actions || { view: true, create: true, edit: true, delete: false },
          user_overrides: (this.userOverridesMap && this.userOverridesMap[m.module_key]) || {}
        };
      });

      this.isHydrated = true;
      this.decorateSidebar();
    }

    // Initialize Engine & Hydrate Permissions from Supabase
    // Initialize Engine & Hydrate Permissions from Supabase & Cloud Sync
    async init(overrideRole = null, overrideUserId = null) {
      injectPermissionStyles();
      this.detectSession();

      if (overrideRole) this.currentRole = overrideRole.toLowerCase();
      if (overrideUserId) this.currentUserId = overrideUserId;

      // 1. Generate base role defaults
      this.permissionsMap = this.generateDefaultMatrix(this.currentRole);

      // 2. Overlay saved customizations & global locks from localStorage
      try {
        const rawLocal = localStorage.getItem('eduvision_master_permissions');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (parsed && parsed.modules && parsed.modules.length > 0) {
            this.hydrateFromMatrix(parsed);
          }
        }
      } catch(e) {
        console.warn('[EduPerms] LocalStorage parse warning:', e);
      }

      // 3. Direct Zero-Dependency Cloud Sync from Supabase REST API
      await this.syncWithCloud();

      // Listen for visibility & live updates
      if (typeof window !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') this.syncWithCloud();
        });
        setInterval(() => this.syncWithCloud(), 10000);
      }

      this.isHydrated = true;
      this.decorateSidebar();
      return this.permissionsMap;
    }

    // Direct Supabase REST Matrix Hydration
    async syncWithCloud() {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/notifications?id=eq.00000000-0000-0000-0000-000000000405&select=*`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].message) {
          const cloudMatrix = JSON.parse(data[0].message);
          if (cloudMatrix && cloudMatrix.modules) {
            localStorage.setItem('eduvision_master_permissions', JSON.stringify(cloudMatrix));
            this.hydrateFromMatrix(cloudMatrix);
          }
        }
      } catch(e) {
        // Cloud matrix sync is non-blocking
      }
    }

    // Generate clean offline default matrix
    generateDefaultMatrix(role) {
      const map = {};
      const normRole = (role || 'student').toLowerCase();
      const isLeadership = ['cto', 'super_admin', 'super admin', 'admin', 'ceo'].includes(normRole);

      Object.keys(FALLBACK_MODULE_CATALOG).forEach(k => {
        const item = FALLBACK_MODULE_CATALOG[k];
        let accessible = true;
        if (item.category === 'system' && normRole !== 'cto') accessible = false;
        if (item.category === 'admin' && !isLeadership) accessible = false;
        if (item.category === 'teamleader' && !(isLeadership || ['team_leader', 'team leader'].includes(normRole))) accessible = false;
        if (item.category === 'counsellor' && !(isLeadership || ['team_leader', 'team leader', 'senior_counsellor', 'senior counsellor', 'counsellor'].includes(normRole))) accessible = false;
        if (item.category === 'associate' && !(isLeadership || ['associate', 'partner'].includes(normRole))) accessible = false;

        map[k] = {
          display_name: item.name,
          category: item.category,
          icon_class: item.icon,
          is_globally_locked: false,
          is_role_enabled: accessible,
          is_role_locked: false,
          is_accessible: accessible,
          locked_by_name: 'CTO Raghav',
          lock_reason: 'Role restriction',
          actions: { view: accessible, create: accessible, edit: accessible, delete: (normRole === 'cto' || isLeadership) }
        };
      });
      return map;
    }

    // Check if Module is Accessible (Evaluates Global Lock -> User Override -> Role Access)
    isModuleEnabled(moduleKey, targetUser = null) {
      // 0. Master CTO Permission Control Centre is ALWAYS accessible only to CTO
      if (moduleKey === 'system_permission_control' || moduleKey === 'permissions') {
        return this.isCto || (this.currentUserId === 'CTO001');
      }

      // 1. Global Administrative Lock: If globally locked, no user or role can access ("kuch bhi off")
      const perm = this.permissionsMap[moduleKey];
      const gLock = (this.globalLocks && this.globalLocks[moduleKey]) || (typeof ctoMasterMatrix !== 'undefined' && ctoMasterMatrix?.globalLocks?.[moduleKey]) || null;
      const isGloballyLocked = !!((perm && perm.is_globally_locked) || (gLock && gLock.is_globally_locked));
      if (isGloballyLocked) {
        return false;
      }

      const user = targetUser || this.currentUser || null;
      const uid = (user && (user.employee_id || user.counsellor_id || user.team_leader_id || user.id || user.student_id || user.user_id)) || this.currentUserId;
      const cleanUid = uid ? uid.toString().trim().toLowerCase() : '';
      const userRole = (user && user.role ? user.role : this.currentRole || 'student').toLowerCase().replace(/\s+/g, '_');
      const isLeadershipUser = this.isCto || this.isCeo || cleanUid === 'cto001' || cleanUid === 'ceo001' || ['cto', 'ceo', 'admin', 'super_admin'].includes(userRole);

      // 2. Individual Employee / User Override (HIGHEST PRIORITY: "kisi keliye off")
      // Allows CTO Raghav to grant/deny permission to specific employees
      const userOverrides = (perm && perm.user_overrides) || (this.userOverridesMap && this.userOverridesMap[moduleKey]) || (typeof ctoMasterMatrix !== 'undefined' && ctoMasterMatrix?.userOverrides?.[moduleKey]) || {};

      if (userOverrides && Object.keys(userOverrides).length > 0) {
        const possibleKeys = [
          user?.employee_id,
          user?.counsellor_id,
          user?.team_leader_id,
          user?.id,
          user?.user_id,
          user?.email,
          user?.student_id,
          user?.phone,
          user?.full_name,
          user?.name,
          this.currentUserId
        ].filter(Boolean).map(k => k.toString().trim().toLowerCase());

        const matchKey = Object.keys(userOverrides).find(k => {
          const cleanK = k.trim().toLowerCase();
          return possibleKeys.includes(cleanK);
        });

        if (matchKey && userOverrides[matchKey]) {
          const ov = userOverrides[matchKey];
          // If explicitly blocked/locked for this person
          if (ov.is_locked === true || ov.is_enabled === false) {
            // CTO and CEO cannot be locked out of core system by accident
            if (cleanUid !== 'cto001' && cleanUid !== 'ceo001') {
              return false;
            }
          }
          // If explicitly allowed for this person
          if (ov.is_enabled === true && !ov.is_locked) {
            return true;
          }
        }
      }

      // Leadership (CEO, Admin, Super Admin, CTO) always has full access to operational admin modules
      if (isLeadershipUser && moduleKey !== 'permissions' && moduleKey !== 'system_permission_control') {
        return true;
      }

      // 3. Role-Level Access Check ("role keliye off")
      const targetRole = (targetUser && targetUser.role ? targetUser.role : this.currentRole || 'student').toLowerCase().replace(/\s+/g, '_');
      const normalizedRole = (targetRole === 'cto' || targetRole === 'super_admin' || targetRole === 'admin' || targetRole === 'ceo') ? 'admin' : targetRole;
      
      const rolePerms = this.rolePermissionsList || (typeof ctoMasterMatrix !== 'undefined' && ctoMasterMatrix?.rolePermissions) || [];
      if (rolePerms && rolePerms.length > 0) {
        let rp = rolePerms.find(p => p.module_key === moduleKey && p.role_key === normalizedRole);
        if (!rp && (normalizedRole === 'senior_counsellor' || normalizedRole === 'counsellor')) {
          rp = rolePerms.find(p => p.module_key === moduleKey && (p.role_key === 'counsellor' || p.role_key === 'senior_counsellor'));
        }
        if (rp) {
          if (rp.is_locked === true || rp.is_enabled === false) {
            return false;
          }
          if (rp.is_enabled === true && !rp.is_locked) {
            return true;
          }
        }
      }

      if (perm) {
        if (perm.is_role_locked || perm.is_role_enabled === false || perm.is_accessible === false) {
          return false;
        }
      }

      return true;
    }

    // Check fine-grained action permission
    canPerformAction(moduleKey, actionKey) {
      if (moduleKey === 'system_permission_control' || moduleKey === 'permissions') return true;
      if (!this.isModuleEnabled(moduleKey)) return false;
      if (this.isCto) return true;
      const perm = this.permissionsMap[moduleKey];
      if (!perm) return true;
      if (!perm.is_accessible) return false;
      if (!perm.actions) return true;
      return !!perm.actions[actionKey];
    }

    // Retrieve lock details for display
    getLockDetails(moduleKey, targetUser = null) {
      const perm = this.permissionsMap[moduleKey] || {};
      const gLock = (this.globalLocks && this.globalLocks[moduleKey]) || (typeof ctoMasterMatrix !== 'undefined' && ctoMasterMatrix?.globalLocks?.[moduleKey]) || null;
      const isGloballyLocked = !!((perm && perm.is_globally_locked) || (gLock && gLock.is_globally_locked));

      const user = targetUser || this.currentUser || null;
      const uid = (user && (user.employee_id || user.counsellor_id || user.team_leader_id || user.id || user.student_id || user.user_id)) || this.currentUserId;
      const userOverrides = (perm && perm.user_overrides) || (this.userOverridesMap && this.userOverridesMap[moduleKey]) || (typeof ctoMasterMatrix !== 'undefined' && ctoMasterMatrix?.userOverrides?.[moduleKey]) || {};
      let userOv = null;
      if (uid && userOverrides && Object.keys(userOverrides).length > 0) {
        const cleanUid = uid.toString().trim().toLowerCase();
        const matchKey = Object.keys(userOverrides).find(k => k.trim().toLowerCase() === cleanUid);
        if (matchKey) userOv = userOverrides[matchKey];
      }

      const isLocked = !this.isModuleEnabled(moduleKey, targetUser);
      let reason = (isGloballyLocked ? gLock?.lock_reason : null) || perm.lock_reason || 'Administrative restriction by CTO';
      if (userOv && (userOv.is_locked || userOv.is_enabled === false) && userOv.lock_reason) {
        reason = userOv.lock_reason;
      }

      const lockTimestamp = (isGloballyLocked ? gLock?.locked_at : null) || perm.locked_at;

      return {
        isLocked: isLocked,
        isGlobal: isGloballyLocked,
        isUserOverride: !!(userOv && (userOv.is_locked || userOv.is_enabled === false)),
        lockedByName: 'CTO Raghav',
        reason: reason,
        lockedAt: lockTimestamp ? new Date(lockTimestamp).toLocaleString('en-IN') : 'Active'
      };
    }

    // Render Luxury Glass Locked State Card in Target Container
    renderLockedState(targetContainer, moduleKey) {
      injectPermissionStyles();
      const details = this.getLockDetails(moduleKey);
      const modInfo = this.permissionsMap[moduleKey] || FALLBACK_MODULE_CATALOG[moduleKey] || { name: 'Module' };
      const displayName = modInfo.display_name || modInfo.name || 'Requested Feature';

      // Immediate Notification Alert
      try {
        if (typeof window.showToast === 'function') {
          window.showToast('🚨 ACCESS RESTRICTED: FEATURE LOCKED BY CTO RAGHAV', 'error');
        }
      } catch(e) {}

      const htmlCard = `
        <div class="locked-card-liquid" style="max-width: 640px; width: 92%; margin: 30px auto; padding: 38px 28px; text-align: center; border-radius: 26px; border: 2px solid rgba(239, 68, 68, 0.6); background: radial-gradient(circle at 50% 0%, rgba(239,68,68,0.2) 0%, rgba(13,20,36,0.94) 100%); box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 35px rgba(239,68,68,0.25); animation: lockFadeSpring 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;">
          
          <div class="locked-icon-halo" style="width: 76px; height: 76px; border-radius: 50%; background: radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(185, 28, 28, 0.5) 100%); border: 2px solid rgba(239, 68, 68, 0.6); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px auto; box-shadow: 0 0 25px rgba(239, 68, 68, 0.4);">
            <i class="fa-solid fa-lock" style="color: #f87171; font-size: 2.2rem;"></i>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.4); padding: 5px 16px; border-radius: 99px; margin-bottom: 14px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 10px #ef4444;"></span>
            <span style="color: #fca5a5; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;">
              🔒 LOCKED BY ADMIN
            </span>
          </div>

          <h2 style="font-family: var(--font-heading, 'Outfit', sans-serif); font-size: 1.65rem; font-weight: 900; color: #fff; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.6px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
            FEATURE LOCKED BY CTO RAGHAV
          </h2>

          <h3 style="font-size: 1.15rem; font-weight: 800; color: #f7d377; margin: 0 0 12px 0;">
            ${escapeHtml(displayName)}
          </h3>

          <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.55; max-width: 480px; margin: 0 auto 22px auto;">
            This module has been restricted and locked by <strong>CTO Raghav</strong>. All operational interactions, data sync, and permissions for this feature are temporarily suspended.
          </p>

          <div class="locked-meta-box" style="background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 20px; text-align: left; margin-bottom: 22px;">
            <div class="locked-meta-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.82rem;">
              <span class="locked-meta-label" style="color: #94a3b8;"><i class="fa-solid fa-shield-halved" style="color: #60a5fa; margin-right: 6px;"></i> CTO Management</span>
              <span class="locked-meta-value" style="color: #f7d377; font-weight: 800;">CTO Raghav</span>
            </div>
            <div class="locked-meta-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.82rem;">
              <span class="locked-meta-label" style="color: #94a3b8;"><i class="fa-solid fa-shield-halved" style="color: #ef4444; margin-right: 6px;"></i> Lock Type</span>
              <span class="locked-meta-value" style="color: #f87171; font-weight: 800;">
                Locked by Admin
              </span>
            </div>
            <div class="locked-meta-row" style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.82rem;">
              <span class="locked-meta-label" style="color: #94a3b8;"><i class="fa-solid fa-clock" style="color: #34d399; margin-right: 6px;"></i> Lock Timestamp</span>
              <span class="locked-meta-value" style="color: #94a3b8; font-size: 0.78rem;">${escapeHtml(details.lockedAt)}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: center; align-items: center;">
            <button class="btn-outline" onclick="if(typeof switchAdminModule==='function'){switchAdminModule('overview');}else if(typeof switchView==='function'){switchView('dashboard');}else{window.history.back();}" style="padding: 10px 22px; font-size: 0.85rem; font-weight: 700; border-radius: 12px; color: #fff; border-color: rgba(255,255,255,0.25); display: inline-flex; align-items: center; gap: 8px; cursor: pointer; background: rgba(255,255,255,0.06);">
              <i class="fa-solid fa-arrow-left"></i> Return to Dashboard
            </button>
          </div>
        </div>
      `;

      let el = (typeof targetContainer === 'string') ? document.querySelector(targetContainer) : targetContainer;
      if (!el) return;

      // Non-destructive: Hide existing children, display locked container
      let lockedWrapper = el.querySelector(':scope > .eduvision-feature-locked-container');
      if (!lockedWrapper) {
        lockedWrapper = document.createElement('div');
        lockedWrapper.className = 'eduvision-feature-locked-container';
        Array.from(el.children).forEach(child => {
          if (!child.classList.contains('eduvision-feature-locked-container')) {
            if (!child.hasAttribute('data-cto-prev-display')) {
              child.setAttribute('data-cto-prev-display', child.style.display || '');
            }
            child.style.display = 'none';
          }
        });
        el.appendChild(lockedWrapper);
      }
      lockedWrapper.innerHTML = htmlCard;
      lockedWrapper.style.display = 'flex';
    }

    // Restore Container if Unlocked
    unlockState(targetContainer) {
      let el = (typeof targetContainer === 'string') ? document.querySelector(targetContainer) : targetContainer;
      if (!el) return;
      const lockedWrapper = el.querySelector(':scope > .eduvision-feature-locked-container');
      if (lockedWrapper) {
        if (typeof lockedWrapper.remove === 'function') {
          lockedWrapper.remove();
        } else if (lockedWrapper.parentNode && typeof lockedWrapper.parentNode.removeChild === 'function') {
          lockedWrapper.parentNode.removeChild(lockedWrapper);
        }
      }
      Array.from(el.children).forEach(child => {
        if (child.hasAttribute('data-cto-prev-display')) {
          child.style.display = child.getAttribute('data-cto-prev-display');
          child.removeAttribute('data-cto-prev-display');
        }
      });
    }

    // Scan & Decorate Sidebar Links with Subtle Lock Badges
    decorateSidebar() {
      const role = (this.currentRole || 'student').toLowerCase();
      let rolePrefix = 'student_';
      if (['cto', 'super_admin', 'super admin', 'admin', 'ceo'].includes(role)) rolePrefix = 'admin_';
      else if (['team_leader', 'team leader'].includes(role)) rolePrefix = 'team_';
      else if (['senior_counsellor', 'senior counsellor', 'counsellor'].includes(role)) rolePrefix = 'counsellor_';
      else if (['associate', 'partner'].includes(role)) rolePrefix = 'associate_';

      const commonMap = {
        'chat': 'comm_chat',
        'alerts': 'comm_chat',
        'comm_chat': 'comm_chat',
        'group_chat': 'comm_group_chat',
        'notifications': 'core_notifications',
        'profile': 'core_profile',
        'dashboard': rolePrefix + 'dashboard'
      };

      const links = document.querySelectorAll('a[data-module], a[data-tab], a[data-view], .sidebar-menu li, .nav-item');
      links.forEach(link => {
        let key = link.getAttribute('data-module') || link.getAttribute('data-tab') || link.getAttribute('data-view') || '';
        if (!key && link.id) {
          key = link.id.replace(/^(nav-|menu-|tab-|view-)/, '');
        }
        if (!key) {
          const onclickAttr = link.getAttribute('onclick') || '';
          const match = onclickAttr.match(/(?:switchView|switchModule|switchStudentTab)\s*\(\s*['"]([^'"]+)['"]\s*\)/);
          if (match) key = match[1];
        }
        if (!key) return;

        let resolvedKey = commonMap[key] || key;
        if (!this.permissionsMap[resolvedKey] && this.permissionsMap[rolePrefix + key]) {
          resolvedKey = rolePrefix + key;
        }

        const perm = this.permissionsMap[resolvedKey];
        if (perm && !this.isModuleEnabled(resolvedKey)) {
          link.classList.add('nav-item-cto-locked');
          if (!link.querySelector('.nav-locked-badge')) {
            const badge = document.createElement('span');
            badge.className = 'nav-locked-badge';
            badge.innerHTML = '<i class="fa-solid fa-lock"></i> Locked';
            link.appendChild(badge);
          }
        } else {
          link.classList.remove('nav-item-cto-locked');
          const badge = link.querySelector('.nav-locked-badge');
          if (badge) badge.remove();
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Instantiate Single Source of Truth
  window.EduPerms = new EduVisionPermissionEngine();

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.EduPerms.init());
  } else {
    window.EduPerms.init();
  }

  // Reactive Cross-Tab and Local Event Listeners
  window.addEventListener('eduvision-permissions-updated', (e) => {
    if (window.EduPerms && e.detail) {
      window.EduPerms.hydrateFromMatrix(e.detail);
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'eduvision_master_permissions' && e.newValue && window.EduPerms) {
      try {
        window.EduPerms.hydrateFromMatrix(JSON.parse(e.newValue));
      } catch(err) {}
    }
  });

})();
