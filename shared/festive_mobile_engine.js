/* ══════════════════════════════════════════════════════════════════════════════
   EDUVISION ENTERPRISE GLOBAL ENGINE: FESTIVE AMBIANCE & MOBILE SMOOTH UX
   • Master Architect: CTO Raghav Raj Rauniyar
   • Durga Puja & Navratri Festive Mode (Pure CSS/SVG + Web Audio Synthesizer)
   • 60/120 FPS Mobile Touch Smoothing, Table-to-Card Responsive Converter
   • Native Mobile Bottom Action Bars (Staff Portals & Public Website)
   • Top-Brand Floating Concierge Dock & Circular SVG Scroll Progress Ring
   • 100% Free & Self-Contained (0 External Paid APIs, 0KB MP3 Download)
   ══════════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';
  if (window.__eduvisionFestiveMobileEngineLoaded) return;
  window.__eduvisionFestiveMobileEngineLoaded = true;

  // ── DETECTION HELPERS ──
  const pathname = window.location.pathname.toLowerCase();
  const isStaffPortal = pathname.includes('/counsellor/') ||
                        pathname.includes('/admin/') ||
                        pathname.includes('/teamleader/') ||
                        pathname.includes('/super-admin/') ||
                        pathname.includes('/branch/') ||
                        pathname.includes('/associate/') ||
                        pathname.includes('/university/') ||
                        pathname.includes('/student/');

  const isPublicHome = !isStaffPortal && (
    pathname.endsWith('index.html') ||
    pathname.endsWith('/') ||
    pathname === '' ||
    pathname.includes('course-details') ||
    pathname.includes('latest-updates')
  );

  // ── STATE MANAGEMENT ──
  const STORAGE_KEY = 'eduvision_festive_mode';
  // Default to 'on' during the festive season (Durga Puja & Navratri)
  let isFestiveActive = localStorage.getItem(STORAGE_KEY) !== 'off';

  // ── 1. GLOBAL MOBILE TOUCH & SMOOTHNESS CSS ──
  const styleEl = document.createElement('style');
  styleEl.id = 'eduvision-festive-mobile-styles';
  styleEl.textContent = `
    /* === GLOBAL 60/120FPS TOUCH & SCROLLING OPTIMIZATION === */
    html {
      scroll-behavior: smooth !important;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    body {
      -webkit-overflow-scrolling: touch !important;
      touch-action: manipulation;
    }
    button, a, input, select, textarea, [role="button"], .tab-item, .nav-item, .chip, .card {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent !important;
    }

    /* Hardware acceleration for buttery smooth transitions */
    .card, .stat-card, .portal-modal-container, .modal-box, #di-island, .floating-concierge-dock, .staff-mobile-bar, .public-mobile-bar {
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }

    /* === UNIVERSAL AUTO-RESPONSIVE TABLE-TO-CARD TRANSFORMATION (< 768px) === */
    @media (max-width: 768px) {
      body {
        padding-bottom: 84px !important; /* Prevent bottom bar clipping */
      }

      /* Apply to all table variants across all staff portals */
      table.data-table,
      table.crm-data-table,
      table.admin-roster-table,
      table.crm-pipeline-table,
      table.team-grid-table,
      .table-container table,
      .responsive-table table,
      .table-responsive table {
        display: block !important;
        width: 100% !important;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .table-container,
      .table-responsive,
      [style*="overflow-x:auto"],
      [style*="overflow-x: auto"] {
        overflow-x: visible !important;
        background: transparent !important;
        border: none !important;
      }

      table.data-table,
      table.crm-data-table,
      table.admin-roster-table,
      table.crm-pipeline-table,
      table.team-grid-table,
      table.tl-table,
      table.tl-data-table,
      table.fee-table,
      .table-container table,
      .responsive-table table,
      .table-responsive table,
      table[id*="Table"],
      table[id*="table"] {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      table.data-table thead,
      table.crm-data-table thead,
      table.admin-roster-table thead,
      table.crm-pipeline-table thead,
      table.team-grid-table thead,
      table.tl-table thead,
      table.tl-data-table thead,
      table.fee-table thead,
      .table-container thead,
      .table-responsive thead,
      table[id*="Table"] thead,
      table[id*="table"] thead {
        display: none !important;
      }

      table.data-table tbody,
      table.crm-data-table tbody,
      table.admin-roster-table tbody,
      table.crm-pipeline-table tbody,
      table.team-grid-table tbody,
      table.tl-table tbody,
      table.tl-data-table tbody,
      table.fee-table tbody,
      .table-container tbody,
      .table-responsive tbody,
      table[id*="Table"] tbody,
      table[id*="table"] tbody {
        display: block !important;
        width: 100% !important;
      }

      table.data-table tr,
      table.crm-data-table tr,
      table.admin-roster-table tr,
      table.crm-pipeline-table tr,
      table.team-grid-table tr,
      table.tl-table tr,
      table.tl-data-table tr,
      table.fee-table tr,
      .table-container tbody tr,
      .table-responsive tbody tr,
      table[id*="Table"] tbody tr,
      table[id*="table"] tbody tr {
        display: block !important;
        width: 100% !important;
        background: rgba(15, 23, 42, 0.94) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 16px !important;
        margin-bottom: 14px !important;
        padding: 14px 16px !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45) !important;
        box-sizing: border-box !important;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }

      table.data-table tr:active,
      table.crm-data-table tr:active {
        transform: scale(0.99);
      }

      table.data-table td,
      table.crm-data-table td,
      table.admin-roster-table td,
      table.crm-pipeline-table td,
      table.team-grid-table td,
      table.tl-table td,
      table.tl-data-table td,
      table.fee-table td,
      .table-container tbody td,
      .table-responsive tbody td,
      table[id*="Table"] tbody td,
      table[id*="table"] tbody td {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 9px 0 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        font-size: 0.86rem !important;
        text-align: right !important;
        width: 100% !important;
        box-sizing: border-box !important;
        white-space: normal !important;
      }

      table.data-table td:last-child,
      table.crm-data-table td:last-child,
      table.admin-roster-table td:last-child,
      table.crm-pipeline-table td:last-child,
      table.team-grid-table td:last-child,
      .table-container tbody td:last-child {
        border-bottom: none !important;
        padding-top: 12px !important;
        justify-content: flex-end !important;
        gap: 8px !important;
        flex-wrap: wrap !important;
      }

      table.data-table td::before,
      table.crm-data-table td::before,
      table.admin-roster-table td::before,
      table.crm-pipeline-table td::before,
      table.team-grid-table td::before,
      table.tl-table td::before,
      table.tl-data-table td::before,
      table.fee-table td::before,
      .table-container tbody td::before,
      .table-responsive tbody td::before,
      table[id*="Table"] tbody td::before,
      table[id*="table"] tbody td::before {
        content: attr(data-label);
        font-weight: 600 !important;
        color: #94a3b8 !important;
        text-align: left !important;
        padding-right: 12px !important;
        font-size: 0.80rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.03em !important;
        flex-shrink: 0 !important;
      }
    }

    /* === DURGA PUJA & NAVRATRI FESTIVE THEME STYLING === */
    body.eduvision-festive-active {
      --festive-gold: #f59e0b;
      --festive-crimson: #e11d48;
      --festive-marigold: #fbbf24;
    }

    body.eduvision-festive-active .btn-primary,
    body.eduvision-festive-active .apply-glow,
    body.eduvision-festive-active .portal-modal-close:hover {
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.45) !important;
      border-color: rgba(251, 191, 36, 0.6) !important;
    }

    body.eduvision-festive-active #di-island {
      box-shadow: 0 8px 32px rgba(0,0,0,0.75), 0 0 0 1px rgba(245, 158, 11, 0.45), 0 0 16px rgba(225, 29, 72, 0.3) !important;
    }

    /* Floating Festive Canvas / Particles Overlay */
    #festive-particle-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 99998;
      opacity: 0;
      transition: opacity 0.6s ease;
    }
    body.eduvision-festive-active #festive-particle-canvas {
      opacity: 1;
    }

    /* Festive Top/Bottom Greeting Pill */
    .festive-greeting-pill {
      position: fixed;
      top: 14px;
      right: 18px;
      z-index: 99990;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      background: linear-gradient(135deg, rgba(30, 20, 10, 0.92) 0%, rgba(20, 10, 15, 0.94) 100%);
      border: 1px solid rgba(245, 158, 11, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 6px 14px 6px 12px;
      border-radius: 50px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(245, 158, 11, 0.25);
      color: #fef08a;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transform: translateY(-50px) scale(0.9);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
      user-select: none;
    }
    body.eduvision-festive-active .festive-greeting-pill {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }
    .festive-greeting-pill:hover {
      box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4), 0 0 18px rgba(225, 29, 72, 0.4);
      border-color: rgba(251, 191, 36, 0.8);
    }
    .festive-diya-icon {
      font-size: 1.15rem;
      animation: festiveDiyaFlicker 2s ease-in-out infinite alternate;
      display: inline-block;
    }
    @keyframes festiveDiyaFlicker {
      0% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 4px #f59e0b); }
      50% { transform: scale(1.08) rotate(-2deg); filter: drop-shadow(0 0 8px #fbbf24); }
      100% { transform: scale(1.02) rotate(2deg); filter: drop-shadow(0 0 6px #e11d48); }
    }

    /* Floating Festive Toggle Badge (Bottom Left) */
    .festive-toggle-badge {
      position: fixed;
      bottom: 22px;
      left: 20px;
      z-index: 99990;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.90);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 7px 13px;
      border-radius: 40px;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      color: #f8fafc;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      user-select: none;
    }
    .festive-toggle-badge:hover {
      background: rgba(30, 41, 59, 0.98);
      border-color: rgba(245, 158, 11, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
    }
    .festive-toggle-badge .festive-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
      transition: background 0.3s;
    }
    .festive-toggle-badge.is-off .festive-status-dot {
      background: #64748b;
      box-shadow: none;
    }

    /* === TOP-BRAND FLOATING CONCIERGE DOCK (PUBLIC SITE) === */
    .floating-concierge-dock {
      position: fixed;
      bottom: calc(26px + env(safe-area-inset-bottom, 0px));
      right: 24px;
      z-index: 99980;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
    }

    .concierge-wa-btn {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 10px 18px;
      border-radius: 50px;
      font-size: 0.88rem;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.42), 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .concierge-wa-btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 32px rgba(37, 211, 102, 0.55);
    }
    .wa-live-pulse {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
      animation: waPulseRing 1.8s infinite cubic-bezier(0.66, 0, 0, 1);
    }
    @keyframes waPulseRing {
      0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8); }
      70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }

    .concierge-offer-chip {
      background: linear-gradient(135deg, rgba(201, 147, 42, 0.95) 0%, rgba(180, 83, 9, 0.95) 100%);
      color: #fff;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 30px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      animation: offerBounce 4s ease-in-out infinite;
    }
    @keyframes offerBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    /* Circular SVG Scroll Progress Ring & Back to Top */
    .back-to-top-progress {
      position: relative;
      width: 44px;
      height: 44px;
      background: rgba(15, 23, 42, 0.88);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      opacity: 0;
      pointer-events: none;
      transform: scale(0.85);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .back-to-top-progress.visible {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }
    .back-to-top-progress:hover {
      transform: scale(1.08);
      background: rgba(30, 41, 59, 0.95);
      border-color: rgba(245, 158, 11, 0.6);
    }
    .back-to-top-progress svg {
      position: absolute;
      top: 0;
      left: 0;
      transform: rotate(-90deg);
    }
    .back-to-top-progress svg circle {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.1s linear;
    }
    .back-to-top-progress svg circle.bg {
      stroke: rgba(255, 255, 255, 0.12);
    }
    .back-to-top-progress svg circle.progress {
      stroke: #f59e0b;
      stroke-dasharray: 125.6; /* 2 * PI * 20 */
      stroke-dashoffset: 125.6;
    }
    .back-to-top-progress .arrow-icon {
      font-size: 0.95rem;
      color: #f8fafc;
      font-weight: bold;
    }

    /* === STAFF MOBILE DOCK (< 768px) === */
    .staff-mobile-bar {
      display: none;
    }
    @media (max-width: 768px) {
      .staff-mobile-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 64px;
        background: rgba(10, 14, 26, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 99990;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.6);
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
      .staff-mob-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 0.70rem;
        font-weight: 600;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 12px;
        transition: color 0.2s, transform 0.15s;
        text-decoration: none !important;
      }
      .staff-mob-item:active {
        transform: scale(0.92);
      }
      .staff-mob-item.active, .staff-mob-item:hover {
        color: #f59e0b;
      }
      .staff-mob-item .mob-icon {
        font-size: 1.15rem;
      }

            .floating-concierge-dock {
        bottom: calc(74px + env(safe-area-inset-bottom, 0px)) !important;
        right: 14px !important;
      }
      .floating-concierge-dock .concierge-wa-btn,
      .floating-concierge-dock .concierge-offer-chip {
        display: none !important;
      }
      .floating-concierge-dock .back-to-top-progress {
        display: flex !important;
      }
      .festive-toggle-badge {
        bottom: calc(74px + env(safe-area-inset-bottom, 0px)) !important;
        left: 14px !important;
        padding: 5px 10px !important;
        font-size: 0.72rem !important;
      }

      /* Public mobile bottom dock */
      .public-mobile-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 62px;
        background: rgba(10, 10, 14, 0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-top: 1px solid rgba(245, 158, 11, 0.35);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 99990;
        box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.7);
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
      .pub-mob-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        background: none;
        border: none;
        color: #cbd5e1;
        font-size: 0.68rem;
        font-weight: 600;
        cursor: pointer;
        padding: 5px 8px;
        text-decoration: none !important;
      }
      .pub-mob-item:active {
        transform: scale(0.92);
      }
      .pub-mob-item.highlight {
        color: #fbbf24;
      }
      .pub-mob-item .pub-icon {
        font-size: 1.1rem;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // ── 2. WEB AUDIO SYNTHESIZER: AUSPICIOUS TEMPLE CHIME ──
  // Pure math synthesis - 0 external files, 0KB bandwidth, works offline
  function playAuspiciousFestiveChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Pentatonic temple bell chord: G4 (392Hz), C5 (523Hz), E5 (659Hz), G5 (784Hz)
      const frequencies = [392, 523.25, 659.25, 783.99];
      const now = ctx.currentTime;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Bell timbre: Sine + soft triangle
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Exponential decay envelope (natural bell reverberation)
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.85);
      });
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // ── 3. DURGA PUJA & NAVRATRI FESTIVE PARTICLES (60FPS CANVAS) ──
  let particleCanvas = null;
  let particleCtx = null;
  let particles = [];
  let animFrameId = null;

  class FestiveParticle {
    constructor(w, h) {
      this.reset(w, h, true);
    }
    reset(w, h, randomY) {
      this.x = Math.random() * w;
      this.y = randomY ? Math.random() * h : h + 20;
      this.size = Math.random() * 14 + 10; // Lotus petal or diya size
      this.type = Math.random() > 0.4 ? 'petal' : (Math.random() > 0.5 ? 'sparkle' : 'diya');
      this.vy = -(Math.random() * 0.7 + 0.3); // Gentle upward float
      this.vx = Math.sin(Math.random() * Math.PI) * 0.5 - 0.25;
      this.rot = Math.random() * 360;
      this.vRot = (Math.random() - 0.5) * 1.2;
      this.opacity = Math.random() * 0.5 + 0.35;
    }
    update(w, h) {
      this.y += this.vy;
      this.x += this.vx + Math.sin(this.y * 0.015) * 0.4;
      this.rot += this.vRot;
      if (this.y < -30 || this.x < -20 || this.x > w + 20) {
        this.reset(w, h, false);
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rot * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'petal') {
        // Sacred Lotus Petal (Soft Pink-Gold Gradient)
        const rad = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -rad);
        ctx.bezierCurveTo(rad * 0.8, -rad * 0.5, rad * 0.8, rad * 0.5, 0, rad);
        ctx.bezierCurveTo(-rad * 0.8, rad * 0.5, -rad * 0.8, -rad * 0.5, 0, -rad);
        const grad = ctx.createLinearGradient(0, -rad, 0, rad);
        grad.addColorStop(0, '#f472b6'); // Rose pink
        grad.addColorStop(0.5, '#f59e0b'); // Marigold gold
        grad.addColorStop(1, '#e11d48'); // Crimson
        ctx.fillStyle = grad;
        ctx.fill();
      } else if (this.type === 'diya') {
        // Auspicious Golden Diya with Glowing Flame
        const r = this.size * 0.65;
        // Diya base
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#b45309'; // Terracotta gold
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Flame
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.3);
        ctx.quadraticCurveTo(r * 0.5, -r * 0.3, 0, 0);
        ctx.quadraticCurveTo(-r * 0.5, -r * 0.3, 0, -r * 1.3);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.fill();
      } else {
        // Sparkling Star
        const s = this.size * 0.45;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function initFestiveCanvas() {
    if (particleCanvas) return;
    particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'festive-particle-canvas';
    document.body.appendChild(particleCanvas);
    particleCtx = particleCanvas.getContext('2d');

    function resize() {
      if (!particleCanvas) return;
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // 12 particles on desktop, 6 on mobile for 60/120fps efficiency
    const count = window.innerWidth < 768 ? 7 : 14;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new FestiveParticle(particleCanvas.width, particleCanvas.height));
    }

    function loop() {
      if (!isFestiveActive) {
        animFrameId = null;
        return;
      }
      particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      const w = particleCanvas.width;
      const h = particleCanvas.height;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(w, h);
        particles[i].draw(particleCtx);
      }
      animFrameId = requestAnimationFrame(loop);
    }

    if (isFestiveActive) {
      animFrameId = requestAnimationFrame(loop);
    }
  }

  // ── 4. FESTIVE GREETING PILL & THEME TOGGLE ──
  function setupFestiveUI() {
    // 1. Greeting Pill
    const greetingPill = document.createElement('div');
    greetingPill.className = 'festive-greeting-pill';
    greetingPill.id = 'festiveGreetingPill';
    greetingPill.title = 'Click to hear festival chime';
    greetingPill.innerHTML = `
      <span class="festive-diya-icon">🪔</span>
      <span>शुभ नवरात्रि एवं दुर्गा पूजा! Happy Navratri 🌸</span>
    `;
    greetingPill.addEventListener('click', function() {
      playAuspiciousFestiveChime();
      greetingPill.style.transform = 'scale(1.08)';
      setTimeout(() => greetingPill.style.transform = 'scale(1)', 200);
    });
    document.body.appendChild(greetingPill);

    // 2. Bottom-Left Festive Toggle Switch
    const toggleBadge = document.createElement('div');
    toggleBadge.className = 'festive-toggle-badge' + (isFestiveActive ? '' : ' is-off');
    toggleBadge.id = 'festiveToggleBadge';
    toggleBadge.title = 'Toggle Durga Puja & Navratri Festive Mode';
    toggleBadge.innerHTML = `
      <span class="festive-status-dot"></span>
      <span class="festive-diya-icon">🪔</span>
      <span id="festiveToggleTxt">${isFestiveActive ? 'Festive Mode: ON' : 'Festive Mode: OFF'}</span>
    `;

    toggleBadge.addEventListener('click', function(e) {
      e.stopPropagation();
      setFestiveMode(!isFestiveActive);
      playAuspiciousFestiveChime();
    });
    document.body.appendChild(toggleBadge);
  }

  function setFestiveMode(active) {
    isFestiveActive = active;
    localStorage.setItem(STORAGE_KEY, active ? 'on' : 'off');

    const toggleBadge = document.getElementById('festiveToggleBadge');
    const toggleTxt = document.getElementById('festiveToggleTxt');

    if (active) {
      document.body.classList.add('eduvision-festive-active');
      if (toggleBadge) toggleBadge.classList.remove('is-off');
      if (toggleTxt) toggleTxt.textContent = 'Festive Mode: ON';
      if (!animFrameId && particleCanvas) {
        initFestiveCanvas();
      }
    } else {
      document.body.classList.remove('eduvision-festive-active');
      if (toggleBadge) toggleBadge.classList.add('is-off');
      if (toggleTxt) toggleTxt.textContent = 'Festive Mode: OFF';
      if (particleCtx && particleCanvas) {
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      }
    }
  }

  // ── 5. STAFF PORTAL MOBILE BOTTOM ACTION BAR (< 768px) ──
  function setupStaffMobileBar() {
    if (!isStaffPortal) return;
    if (document.getElementById('staffMobileBar')) return;

    const bar = document.createElement('div');
    bar.className = 'staff-mobile-bar';
    bar.id = 'staffMobileBar';
    bar.innerHTML = `
      <button class="staff-mob-item active" onclick="window.scrollTo({top:0, behavior:'smooth'})">
        <span class="mob-icon">📊</span>
        <span>Dashboard</span>
      </button>
      <button class="staff-mob-item" onclick="if(window.diToggle) window.diToggle(); else window.scrollTo({top:300, behavior:'smooth'});">
        <span class="mob-icon">🏝️</span>
        <span>Briefing</span>
      </button>
      <button class="staff-mob-item" onclick="if(window.EduFestiveEngine) window.EduFestiveEngine.toggle();">
        <span class="mob-icon">🪔</span>
        <span>Festive</span>
      </button>
      <button class="staff-mob-item" onclick="const q = document.querySelector('.table-container, .data-table, #dashboardQueueTable'); if(q) q.scrollIntoView({behavior:'smooth'}); else window.scrollTo({top:400, behavior:'smooth'});">
        <span class="mob-icon">📋</span>
        <span>Queue</span>
      </button>
      <button class="staff-mob-item" onclick="if(window.openProfileModal) window.openProfileModal(); else if(window.EduVisionAuthGuard) window.EduVisionAuthGuard.logout(); else window.location.href='../login.html';">
        <span class="mob-icon">👤</span>
        <span>Profile</span>
      </button>
    `;
    document.body.appendChild(bar);
  }

  // ── 6. TOP-BRAND PUBLIC FLOATING CONCIERGE DOCK ──
  function setupPublicFloatingDock() {
    if (!isPublicHome) return;

    // Check if dock already exists
    if (!document.getElementById('floatingConciergeDock')) {
      const dock = document.createElement('div');
      dock.className = 'floating-concierge-dock';
      dock.id = 'floatingConciergeDock';
      dock.innerHTML = `
        <!-- Festive Navratri Offer Chip -->
        <div class="concierge-offer-chip" onclick="const c = document.getElementById('counselling'); if(c) c.scrollIntoView({behavior:'smooth'}); else window.location.href='#counselling';">
          <span>🪔</span>
          <span>Navratri Offer: Free Counselling & ₹50K Scholarship</span>
        </div>

        <!-- WhatsApp Admissions Concierge -->
        <a href="https://wa.me/918303632103?text=Hello%20EduVision%2C%20I%20want%20to%20know%20more%20about%20Admissions%20and%20Scholarships" 
           target="_blank" rel="noopener noreferrer" class="concierge-wa-btn" title="Chat with Senior Admissions Team">
          <span class="wa-live-pulse"></span>
          <span>💬 Chat on WhatsApp</span>
        </a>

        <!-- Back to Top with SVG Circular Progress Ring -->
        <div class="back-to-top-progress" id="backToTopProgress" title="Scroll to top" onclick="window.scrollTo({top:0, behavior:'smooth'})">
          <svg width="44" height="44">
            <circle class="bg" cx="22" cy="22" r="18"></circle>
            <circle class="progress" id="scrollProgressCircle" cx="22" cy="22" r="18"></circle>
          </svg>
          <span class="arrow-icon">↑</span>
        </div>
      `;
      document.body.appendChild(dock);

      // Track scroll for Circular Progress Ring
      const progressBtn = document.getElementById('backToTopProgress');
      const progressCircle = document.getElementById('scrollProgressCircle');
      const circumference = 2 * Math.PI * 18; // approx 113.1

      if (progressCircle) {
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = circumference;
      }

      window.addEventListener('scroll', function() {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;

        if (currentScroll > 280) {
          if (progressBtn) progressBtn.classList.add('visible');
        } else {
          if (progressBtn) progressBtn.classList.remove('visible');
        }

        if (scrollTotal > 0 && progressCircle) {
          const progress = currentScroll / scrollTotal;
          const dashoffset = circumference - (progress * circumference);
          progressCircle.style.strokeDashoffset = Math.max(0, dashoffset);
        }
      }, { passive: true });
    }

    // Public Mobile Bottom App Bar (< 768px)
    if (!document.getElementById('publicMobileBar')) {
      const pubBar = document.createElement('div');
      pubBar.className = 'public-mobile-bar';
      pubBar.id = 'publicMobileBar';
      pubBar.innerHTML = `
        <a href="#top" class="pub-mob-item highlight" onclick="window.scrollTo({top:0, behavior:'smooth'})">
          <span class="pub-icon">🏠</span>
          <span>Home</span>
        </a>
        <a href="#courses" class="pub-mob-item">
          <span class="pub-icon">🎓</span>
          <span>Courses</span>
        </a>
        <a href="#counselling" class="pub-mob-item highlight" onclick="const c = document.getElementById('counselling'); if(c) { c.scrollIntoView({behavior:'smooth'}); return false; }">
          <span class="pub-icon">🪔</span>
          <span>Navratri Offer</span>
        </a>
        <a href="https://wa.me/918303632103?text=Hi%20EduVision%2C%20I%20want%20admission%20details" target="_blank" rel="noopener noreferrer" class="pub-mob-item">
          <span class="pub-icon">💬</span>
          <span>WhatsApp</span>
        </a>
        <a href="tel:+918303632103" class="pub-mob-item">
          <span class="pub-icon">📞</span>
          <span>Call Us</span>
        </a>
      `;
      document.body.appendChild(pubBar);
    }
  }

  // ── 7. AUTO-RESPONSIVE TABLE DATA-LABEL INJECTOR ──
  function enhanceAllTablesForMobile() {
    document.querySelectorAll("table").forEach(function(table) {
      const thList = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
      if (thList.length === 0) return;

      table.querySelectorAll("tbody tr").forEach(function(row) {
        row.querySelectorAll("td").forEach(function(td, index) {
          if (thList[index] && !td.getAttribute("data-label")) {
            td.setAttribute("data-label", thList[index]);
          }
        });
      });
    });
  }

  // MutationObserver to catch dynamically loaded database tables
  const tableObserver = new MutationObserver(function(mutations) {
    let hasNewTable = false;
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        hasNewTable = true;
        break;
      }
    }
    if (hasNewTable) enhanceAllTablesForMobile();
  });

  // ── INITIALIZATION ──
  function initEngine() {
    if (isFestiveActive) {
      document.body.classList.add('eduvision-festive-active');
    }

    initFestiveCanvas();
    setupFestiveUI();

    if (isStaffPortal) {
      setupStaffMobileBar();
    } else if (isPublicHome) {
      setupPublicFloatingDock();
    }

    enhanceAllTablesForMobile();
    if (document.body) {
      tableObserver.observe(document.body, { childList: true, subtree: true });
    }

    console.log('🌸 [EduVision] Festive Ambiance & Mobile Smooth Engine active. Mode:', isFestiveActive ? 'ON' : 'OFF');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

  // Global API
  window.EduFestiveEngine = {
    toggle: () => setFestiveMode(!isFestiveActive),
    setMode: setFestiveMode,
    isFestive: () => isFestiveActive,
    playChime: playAuspiciousFestiveChime,
    refreshTables: enhanceAllTablesForMobile
  };
})();
