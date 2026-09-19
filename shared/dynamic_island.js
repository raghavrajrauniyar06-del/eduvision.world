/* ═══════════════════════════════════════════════════════════════════
   DYNAMIC ISLAND — EduVision  v5.0 (v20)
   • Always visible — never dismisses, only minimize / maximize
   • Alt + D to Toggle, smooth Apple spring physics animations
   • Interactive clicks switch pages (Chats, FUP student profile, Leads CRM)
   • Integrated search and filter chips (All, Chats, Follow-ups, Leads)
   • Live DB updates, unread chat popup notifications, custom sounds
   • Auto-responsive mobile tables (converts scrollable rows to clean cards)
   • Fully color-coded styling (Today is Yellow, Tomorrow is Orange, Overdue is Red)
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {
  console.log("[DI] version 20 loaded");

  /* ── CSS ──────────────────────────────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --di-center: 50%;
      --di-max-w: 140px;
    }
    #di-island {
      position: fixed;
      top: 14px;
      left: var(--di-center, 50%);
      transform: translateX(-50%) scaleY(0.2) scaleX(0.5);
      z-index: 990;
      background: rgba(10, 10, 14, 0.96);
      backdrop-filter: blur(24px) saturate(1.8);
      -webkit-backdrop-filter: blur(24px) saturate(1.8);
      border-radius: 50px;
      overflow: hidden;
      cursor: pointer;
      box-shadow:
        0 8px 32px rgba(0,0,0,0.75),
        0 1px 0 rgba(255,255,255,0.12) inset,
        0 0 0 1px rgba(168,85,247,0.25);
      opacity: 0;
      pointer-events: none;
      transition:
        transform     0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        left          0.3s cubic-bezier(0.16, 1, 0.3, 1),
        top           0.3s ease,
        border-radius 0.35s ease,
        opacity       0.25s ease,
        width         0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        height        0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        box-shadow    0.3s ease;
      width: auto;
      min-width: 95px;
      max-width: var(--di-max-w, 140px);
      height: 28px;
      will-change: transform, width, height, left;
    }
    #di-island:hover {
      box-shadow:
        0 10px 36px rgba(0,0,0,0.85),
        0 1px 0 rgba(255,255,255,0.18) inset,
        0 0 0 1px rgba(168,85,247,0.45);
    }
    #di-island:active {
      transform: translateX(-50%) scale(0.96);
    }
    #di-island.di-expanded:active {
      transform: translateX(-50%) scale(1);
    }
    #di-island.di-visible {
      opacity: 1;
      transform: translateX(-50%) scale(1);
      pointer-events: auto;
    }
    #di-island.di-expanded {
      left: var(--di-center, 50%) !important;
      width: clamp(340px, 92vw, 540px) !important;
      max-width: 540px !important;
      height: auto !important;
      min-height: 280px !important;
      max-height: 86vh !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      border-radius: 26px !important;
      box-shadow:
        0 24px 64px rgba(0,0,0,0.92),
        0 0 0 1px rgba(168,85,247,0.35),
        0 1px 0 rgba(255,255,255,0.15) inset !important;
    }
    #di-island.di-expanded #di-pill  { display: none !important; }
    #di-island.di-expanded #di-panel {
      display: block !important;
      height: auto !important;
      overflow: visible !important;
    }

    /* === Collapsed Pill === */
    #di-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 9px;
      height: 28px;
      white-space: nowrap;
      overflow: hidden;
      user-select: none;
    }
    .di-live-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #a855f7;
      flex-shrink: 0;
      animation: di-livepulse 2s ease-in-out infinite;
      box-shadow: 0 0 5px rgba(168,85,247,0.8);
    }
    .di-live-dot.green { background:#22c55e; box-shadow:0 0 5px rgba(34,197,94,0.8); }
    .di-live-dot.red   { background:#ef4444; box-shadow:0 0 5px rgba(239,68,68,0.8); animation:di-livepulse 0.9s ease-in-out infinite; }
    .di-live-dot.amber { background:#f59e0b; box-shadow:0 0 5px rgba(245,158,11,0.8); }
    #di-pill-label {
      font-family: Outfit, "SF Pro Display", -apple-system, sans-serif;
      font-size: 0.67rem; font-weight: 600; color: #e2e8f0;
      letter-spacing: 0.01em;
      max-width: 68px; overflow: hidden; text-overflow: ellipsis;
    }
    #di-pill-badge {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: #fff; font-family: Outfit, sans-serif;
      font-size: 0.58rem; font-weight: 700;
      border-radius: 20px; padding: 1px 5px;
      flex-shrink: 0; min-width: 15px; text-align: center;
      line-height: 1.2;
    }
    #di-mini-btn {
      background: rgba(255,255,255,0.08); border: none; color: #94a3b8;
      border-radius: 50%; width: 16px; height: 16px; flex-shrink: 0;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.50rem; transition: background 0.2s, color 0.2s; line-height: 1;
    }
    #di-mini-btn:hover { background: rgba(168,85,247,0.3); color: #d8b4fe; }

    /* === Expanded Panel === */
    #di-panel { display: none; padding: 16px 18px 15px; }
    .di-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 13px;
    }
    .di-title {
      font-family: Outfit, "SF Pro Display", -apple-system, sans-serif;
      font-size: 0.86rem; font-weight: 700; color: #f1f5f9;
      display: flex; align-items: center; gap: 9px;
    }
    .di-title-icon {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      border-radius: 9px; width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.88rem; flex-shrink: 0;
    }
    .di-header-actions { display: flex; gap: 6px; align-items: center; }
    .di-refresh-btn, .di-collapse-btn {
      background: rgba(255,255,255,0.07); border: none; cursor: pointer;
      border-radius: 50%; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; color: #94a3b8;
      transition: background 0.2s, color 0.2s, transform 0.3s;
    }
    .di-refresh-btn:hover { background: rgba(255,255,255,0.14); color: #a78bfa; transform: rotate(180deg); }
    .di-collapse-btn:hover { background: rgba(255,255,255,0.14); color: #f1f5f9; }
    
    .di-date-chip {
      font-family: Outfit, sans-serif; font-size: 0.65rem; font-weight: 600;
      color: #7c3aed; background: rgba(168,85,247,0.12);
      border: 1px solid rgba(168,85,247,0.2); border-radius: 20px;
      padding: 3px 10px; margin-bottom: 12px; display: inline-block;
    }

    /* === Filters & Search === */
    .di-filter-bar {
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    #di-search-input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 7px 14px;
      font-size: 0.72rem;
      color: #fff;
      font-family: Outfit, sans-serif;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    #di-search-input:focus {
      border-color: rgba(168, 85, 247, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }
    .di-chips {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }
    .di-chips::-webkit-scrollbar { display: none; }
    .di-chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      color: #94a3b8;
      font-size: 0.62rem;
      font-weight: 600;
      padding: 3px 10px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .di-chip:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
    }
    .di-chip.active {
      background: rgba(168, 85, 247, 0.16);
      border-color: rgba(168, 85, 247, 0.4);
      color: #d8b4fe;
    }

    .di-list {
      display: flex; flex-direction: column; gap: 6px;
      max-height: 280px; overflow-y: auto;
      scrollbar-width: thin; scrollbar-color: rgba(168,85,247,0.3) transparent;
    }
    .di-list::-webkit-scrollbar { width: 3px; }
    .di-list::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.35); border-radius: 3px; }
    
    .di-sec-label {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.09em;
      color: #475569; text-transform: uppercase; padding: 7px 2px 3px; margin-top: 2px;
    }
    .di-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 9px 11px; border-radius: 13px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.055);
      animation: di-slidein 0.22s ease both;
      transition: background 0.15s, transform 0.1s;
      cursor: pointer;
    }
    .di-item:hover {
      background: rgba(255,255,255,0.075);
      transform: translateY(-1px);
    }
    .di-item:active {
      transform: translateY(0) scale(0.98);
    }
    .di-item-urgent { border-color: rgba(239,68,68,0.22) !important; background: rgba(239,68,68,0.04) !important; }
    .di-item-chat-urgent { border-color: rgba(168,85,247,0.25) !important; background: rgba(168,85,247,0.05) !important; }
    
    /* Dynamic Color Classes (Color code engine updates) */
    .di-icon {
      width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 0.88rem;
    }
    .ic-today    { background: rgba(245,158,11,0.16) !important;  color: #fbbf24 !important; } /* Yellow/Amber */
    .ic-tomorrow { background: rgba(249,115,22,0.16) !important;   color: #fdba74 !important; } /* Orange */
    .ic-lead     { background: rgba(59,130,246,0.16) !important;  color: #60a5fa !important; } /* Blue */
    .ic-overdue  { background: rgba(239,68,68,0.22) !important;   color: #f87171 !important; } /* Red */
    .ic-chat     { background: rgba(168,85,247,0.18) !important;  color: #c084fc !important; } /* Purple */
    .ic-next     { background: rgba(16,185,129,0.16) !important;  color: #34d399 !important; } /* Green */
    
    .di-body { flex: 1; min-width: 0; }
    .di-name {
      font-family: Outfit, sans-serif; font-size: 0.79rem; font-weight: 600;
      color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .di-detail { font-size: 0.67rem; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .di-tag {
      font-size: 0.58rem; font-weight: 700; padding: 2px 7px; border-radius: 20px;
      white-space: nowrap; flex-shrink: 0; align-self: flex-start; margin-top: 4px;
    }
    .tg-today    { background: rgba(245,158,11,0.18) !important;  color: #fbbf24 !important; border: 1px solid rgba(245,158,11,0.25) !important; }
    .tg-tomorrow { background: rgba(249,115,22,0.18) !important;   color: #fdba74 !important; border: 1px solid rgba(249,115,22,0.25) !important; }
    .tg-lead     { background: rgba(59,130,246,0.18) !important;  color: #60a5fa !important; border: 1px solid rgba(59,130,246,0.25) !important; }
    .tg-overdue  { background: rgba(239,68,68,0.2) !important;    color: #f87171 !important; border: 1px solid rgba(239,68,68,0.3) !important; }
    .tg-chat     { background: rgba(168,85,247,0.2) !important;   color: #c084fc !important; border: 1px solid rgba(168,85,247,0.3) !important; }
    .tg-next     { background: rgba(16,185,129,0.18) !important;  color: #34d399 !important; border: 1px solid rgba(16,185,129,0.3) !important; font-size: 0.56rem; }
    
    .di-empty {
      text-align: center; padding: 20px 0;
      font-size: 0.78rem; color: #475569; line-height: 1.6;
    }
    .di-footer {
      margin-top: 11px; display: flex; align-items: center; justify-content: space-between;
      padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);
    }
    .di-footer-txt  { font-size: 0.62rem; color: #475569; font-family: Outfit, sans-serif; }
    .di-footer-time { font-size: 0.62rem; color: #334155; }
    .di-skeleton {
      height: 50px; border-radius: 13px;
      background: linear-gradient(90deg,
        rgba(255,255,255,0.04) 25%,
        rgba(255,255,255,0.09) 50%,
        rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: di-shimmer 1.4s infinite;
    }

    @keyframes di-livepulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%     { opacity:0.3; transform:scale(0.55); }
    }
    @keyframes di-slidein {
      from { opacity:0; transform:translateY(-5px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes di-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes di-slideDown {
      from { opacity:0; transform:translateX(-50%) translateY(-14px); }
      to   { opacity:1; transform:translateX(-50%) translateY(0); }
    }
    .di-item:nth-child(1){animation-delay:.03s}
    .di-item:nth-child(2){animation-delay:.08s}
    .di-item:nth-child(3){animation-delay:.13s}
    .di-item:nth-child(4){animation-delay:.18s}
    .di-item:nth-child(5){animation-delay:.23s}
    .di-item:nth-child(6){animation-delay:.28s}

    /* Notch / safe area */
    @supports (padding-top: env(safe-area-inset-top)) {
      #di-island { top: calc(10px + env(safe-area-inset-top)); }
      @media (max-width: 767px) {
        #di-island { top: calc(11px + env(safe-area-inset-top)) !important; }
        #di-island.di-expanded { top: calc(54px + env(safe-area-inset-top)) !important; }
      }
    }

    /* === TABLETS & MEDIUM SCREENS (768px - 1024px) === */
    @media (max-width: 1024px) and (min-width: 768px) {
      #di-island {
        top: 13px;
        left: var(--di-center, 50%) !important;
        transform: translateX(-50%) scale(1);
        height: 28px;
        min-width: 90px;
        max-width: 135px;
      }
      #di-island.di-expanded {
        top: 12px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: clamp(320px, 86vw, 480px) !important;
        height: auto !important;
        min-height: 280px !important;
        max-height: 85vh !important;
        overflow-y: auto !important;
      }
    }

    /* === MOBILE PHONES (max-width: 767px) — COMPACT HEADER PILL (ZERO TEXT OVERLAP) === */
    @media (max-width: 767px) {
      #di-island {
        top: 13px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        height: 24px !important;
        min-width: 75px !important;
        width: auto !important;
        max-width: 102px !important;
        border-radius: 50px !important;
        padding: 0 !important;
        z-index: 1002 !important;
        box-shadow: 0 4px 14px rgba(0,0,0,0.85), 0 0 0 1px rgba(168,85,247,0.35) !important;
      }
      #di-pill {
        height: 24px !important;
        padding: 0 6px !important;
        gap: 4px !important;
        justify-content: center !important;
      }
      #di-pill-label {
        display: inline-block !important;
        font-size: 0.58rem !important;
        font-weight: 600 !important;
        max-width: 46px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      .di-live-dot {
        width: 5px !important;
        height: 5px !important;
        flex-shrink: 0 !important;
      }
      #di-pill-badge {
        font-size: 0.50rem !important;
        padding: 1px 4px !important;
        min-width: 13px !important;
        line-height: 1.2 !important;
      }
      #di-mini-btn {
        width: 15px !important;
        height: 15px !important;
        font-size: 0.45rem !important;
        display: flex !important;
      }
      #di-island.di-expanded {
        top: 50px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 94vw !important;
        max-width: 420px !important;
        height: auto !important;
        min-height: 300px !important;
        max-height: 82vh !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        border-radius: 20px !important;
        padding: 0 !important;
        z-index: 99995 !important;
        box-shadow: 0 20px 60px rgba(0,0,0,0.95), 0 0 0 1px rgba(168,85,247,0.4) !important;
      }
      #di-panel {
        padding: 14px 14px 12px !important;
      }
      #di-island.di-expanded #di-panel {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
      }
      .di-list {
        max-height: 240px !important;
      }
      .di-name {
        font-size: 0.76rem !important;
      }
      .di-detail {
        font-size: 0.64rem !important;
      }
      #di-chat-popup {
        top: 100px !important;
        width: 92vw !important;
      }
    }

    /* === RESPONSIVE MOBILE TABLES (SCROLL-FREE UX ENHANCEMENT) === */
    @media (max-width: 768px) {
      .table-container {
        background: none !important;
        border: none !important;
        overflow: visible !important;
        margin-bottom: 15px !important;
      }
      table.data-table {
        display: block !important;
        width: 100% !important;
        overflow: visible !important;
      }
      table.data-table thead {
        display: none !important;
      }
      table.data-table tbody {
        display: block !important;
        width: 100% !important;
      }
      table.data-table tr {
        display: block !important;
        width: 100% !important;
        background: #0f172a !important; /* Premium dark background */
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 16px !important;
        margin-bottom: 14px !important;
        padding: 14px 16px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        box-sizing: border-box !important;
      }
      table.data-table td {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 9px 0 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
        font-size: 0.85rem !important;
        text-align: right !important;
        width: 100% !important;
        box-sizing: border-box !important;
        white-space: normal !important;
      }
      table.data-table td:last-child {
        border-bottom: none !important;
        padding-top: 10px !important;
        justify-content: flex-end !important;
      }
      table.data-table td::before {
        content: attr(data-label);
        font-weight: 600 !important;
        color: #94a3b8 !important; /* var(--text-muted) */
        text-align: left !important;
        padding-right: 10px !important;
        font-size: 0.82rem !important;
        flex-shrink: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);

  /* ── HTML ─────────────────────────────────────────────────────── */
  const el = document.createElement("div");
  el.id = "di-island";
  el.innerHTML = `
    <div id="di-pill">
      <div class="di-live-dot" id="di-dot"></div>
      <span id="di-pill-label">EduVision…</span>
      <span id="di-pill-badge" style="display:none">0</span>
      <button id="di-mini-btn" title="Expand" onclick="diToggle(event)">▲</button>
    </div>
    <div id="di-panel">
      <div class="di-header">
        <div class="di-title">
          <div class="di-title-icon">🔔</div>
          Today's Briefing <span style="font-size:0.58rem;opacity:0.5;margin-left:4px">v20</span>
        </div>
        <div class="di-header-actions">
          <button class="di-refresh-btn" onclick="diRefresh(event)" title="Refresh">↻</button>
          <button class="di-collapse-btn" onclick="diCollapse(event)" title="Minimize">▼</button>
        </div>
      </div>
      <div class="di-date-chip" id="di-date-chip">📅 Loading…</div>
      
      <!-- Filters and Search -->
      <div class="di-filter-bar" id="di-filter-bar" style="display:none">
        <input type="text" id="di-search-input" placeholder="Search briefing..." oninput="diApplyFilters(event)" onclick="event.stopPropagation()">
        <div class="di-chips" onclick="event.stopPropagation()">
          <button class="di-chip active" id="chip-all" onclick="diSetFilter('all')">All</button>
          <button class="di-chip" id="chip-chat" onclick="diSetFilter('chat')">Chats</button>
          <button class="di-chip" id="chip-fup" onclick="diSetFilter('fup')">Follow-ups</button>
          <button class="di-chip" id="chip-lead" onclick="diSetFilter('lead')">Leads</button>
        </div>
      </div>

      <div class="di-list" id="di-list">
        <div class="di-skeleton"></div>
        <div class="di-skeleton" style="height:40px;margin-top:4px;opacity:0.6"></div>
      </div>
      <div class="di-footer">
        <span class="di-footer-txt" id="di-footer-txt">Fetching…</span>
        <span class="di-footer-time" id="di-footer-time"></span>
      </div>
    </div>
  `;

  // Tap pill body to expand
  el.addEventListener("click", function (e) {
    if (!this.classList.contains("di-expanded")) {
      if (!e.target.closest("#di-mini-btn")) diExpand();
    }
  });
  document.body.appendChild(el);

  // Click outside → collapse
  document.addEventListener("click", function (e) {
    const island = document.getElementById("di-island");
    if (island && island.classList.contains("di-expanded") && !island.contains(e.target)) {
      diCollapse();
    }
  });

  // Hotkey listener Alt + D / Cmd + D to Toggle
  document.addEventListener("keydown", function (e) {
    if ((e.altKey && e.key.toLowerCase() === 'd') || (e.metaKey && e.key.toLowerCase() === 'd')) {
      e.preventDefault();
      diToggle();
    }
  });

  // ── Auto-responsive Tables Helper (Realtime Observer) ──
  function makeTablesResponsive() {
    document.querySelectorAll("table").forEach(function(table) {
      const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
      table.querySelectorAll("tbody tr").forEach(function(row) {
        row.querySelectorAll("td").forEach(function(td, index) {
          if (headers[index] && !td.getAttribute("data-label")) {
            td.setAttribute("data-label", headers[index]);
          }
        });
      });
    });
  }

  makeTablesResponsive();
  
  const observer = new MutationObserver(function() {
    makeTablesResponsive();
  });
  // ── Dynamic Responsive Alignment & Gap Measurement ──
  function updateDynamicIslandPosition() {
    if (window.innerWidth <= 767) {
      document.documentElement.style.removeProperty('--di-center');
      document.documentElement.style.removeProperty('--di-max-w');
      return;
    }

    try {
      // Find left boundary (right edge of left cluster)
      let leftBoundary = 0;
      const leftCandidates = document.querySelectorAll(
        '.admin-topbar .topbar-left, .topbar-left, .top-bar > div:first-child, .tl-topbar > div:first-child, .page-title, .topbar-title'
      );
      leftCandidates.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > 0) {
          leftBoundary = Math.max(leftBoundary, r.right);
        }
      });

      // Find right boundary (left edge of right cluster)
      let rightBoundary = window.innerWidth;
      const rightCandidates = document.querySelectorAll(
        '#adminAttendanceCapsule, #counsellorAttendanceCapsule, #tlAttendanceCapsule, .topbar-right, .topbar-user, .admin-profile, .counsellor-profile, .security-status-indicator'
      );
      rightCandidates.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.left > 0 && r.left > leftBoundary) {
          rightBoundary = Math.min(rightBoundary, r.left);
        }
      });

      // Also detect sidebar if active
      const sidebar = document.querySelector('.admin-sidebar, .sidebar, .tl-sidebar');
      const sidebarWidth = (sidebar && getComputedStyle(sidebar).display !== 'none') ? sidebar.getBoundingClientRect().width : 0;

      const gapLeft = leftBoundary + 14;
      const gapRight = rightBoundary - 14;
      const gapWidth = gapRight - gapLeft;

      if (gapWidth >= 100) {
        const center = Math.round((gapLeft + gapRight) / 2);
        const maxW = Math.min(138, Math.max(90, Math.floor(gapWidth - 8)));
        document.documentElement.style.setProperty('--di-center', center + 'px');
        document.documentElement.style.setProperty('--di-max-w', maxW + 'px');
        return;
      }

      // If gap is tight, position midway in the available main workspace
      const mainLeft = Math.max(sidebarWidth, leftBoundary) + 10;
      const mainRight = rightBoundary - 10;
      if (mainRight > mainLeft + 85) {
        const center = Math.round((mainLeft + mainRight) / 2);
        const maxW = Math.min(125, Math.floor(mainRight - mainLeft - 8));
        document.documentElement.style.setProperty('--di-center', center + 'px');
        document.documentElement.style.setProperty('--di-max-w', maxW + 'px');
        return;
      }
    } catch(e) {}

    // Fallback: center in main workspace (accounting for sidebar)
    const sb = document.querySelector('.admin-sidebar, .sidebar');
    const sbW = (sb && getComputedStyle(sb).display !== 'none') ? sb.getBoundingClientRect().width : 0;
    const fallbackCenter = sbW > 0 ? Math.round(sbW + (window.innerWidth - sbW) / 2) : '50%';
    document.documentElement.style.setProperty('--di-center', typeof fallbackCenter === 'number' ? fallbackCenter + 'px' : fallbackCenter);
    document.documentElement.style.setProperty('--di-max-w', '135px');
  }

  window.addEventListener('resize', updateDynamicIslandPosition);
  updateDynamicIslandPosition();
  setTimeout(updateDynamicIslandPosition, 250);
  setTimeout(updateDynamicIslandPosition, 800);

  // ── Auto-Initialize session across all pages ──
  function autoInitDynamicIsland() {
    if (window._diUser && window._diSb) return;

    let sb = window.sb || window.supabaseClient || window.supabase;
    if (!sb && typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
      try {
        sb = supabase.createClient(
          'https://ewxvqpyusveiynplzxed.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eHZxcHl1c3ZlaXlucGx6eGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg2NjQsImV4cCI6MjA1NjgxNDY2NH0.pB_1q4kH7K37b5fK9n1_N4u6G7x7r0R_e5v0Q4Q2W1A'
        );
      } catch(e) {}
    }

    let user = window.currentUser || window.currentAdmin || window.currentStaff || window.currentTL || window.currentStudent;
    if (!user) {
      const storageKeys = ['currentUser', 'adminUser', 'eduvision_user', 'counsellorUser', 'student_profile', 'partner_user'];
      for (const key of storageKeys) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              user = parsed;
              break;
            }
          }
        } catch(e) {}
      }
    }

    if (sb && user) {
      loadDynamicIsland(sb, user);
    } else if (sb) {
      loadDynamicIsland(sb, { full_name: 'Team Member', role: 'Staff' });
    }
  }

  setTimeout(autoInitDynamicIsland, 500);
  setTimeout(autoInitDynamicIsland, 1500);

  window.updateDynamicIslandPosition = updateDynamicIslandPosition;
  window.autoInitDynamicIsland = autoInitDynamicIsland;

}); // end DOMContentLoaded

/* ════════════════════════════════════════════════════════════════
   TIMEZONE-AWARE LOCAL DATE FORMATTERS
   ════════════════════════════════════════════════════════════════ */
function diGetLocalDateStr(dateStr) {
  if (!dateStr) return "";
  const cleanStr = String(dateStr).trim();
  if (cleanStr.length === 10 && cleanStr.includes("-") && !cleanStr.includes("T")) {
    return cleanStr;
  }
  try {
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return cleanStr.slice(0, 10);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yyyy + "-" + mm + "-" + dd;
  } catch (e) {
    return cleanStr.slice(0, 10);
  }
}

function diFormatFriendlyDate(dateStr) {
  if (!dateStr) return "-";
  const localStr = diGetLocalDateStr(dateStr);
  const parts = localStr.split("-");
  if (parts.length === 3) {
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (monthIdx >= 0 && monthIdx < 12) {
      return day + " " + months[monthIdx];
    }
  }
  return dateStr;
}

/* ════════════════════════════════════════════════════════════════
   SEARCH & FILTER ENGINE
   ════════════════════════════════════════════════════════════════ */
let _diCurrentFilter = 'all';

function diSetFilter(filterType) {
  _diCurrentFilter = filterType;
  document.querySelectorAll('.di-chip').forEach(btn => btn.classList.remove('active'));
  const target = document.getElementById('chip-' + filterType);
  if (target) target.classList.add('active');
  diApplyFilters();
}

function diApplyFilters(e) {
  if (e) e.stopPropagation();
  const query = (document.getElementById('di-search-input')?.value || '').toLowerCase();
  const wrappers = document.querySelectorAll('.di-item-wrapper');
  
  wrappers.forEach(wrapper => {
    const text = wrapper.innerText.toLowerCase();
    const type = wrapper.getAttribute('data-type');
    
    let matchFilter = true;
    if (_diCurrentFilter === 'chat' && type !== 'chat') matchFilter = false;
    else if (_diCurrentFilter === 'fup' && !['today','tomorrow','overdue','next'].includes(type)) matchFilter = false;
    else if (_diCurrentFilter === 'lead' && type !== 'lead') matchFilter = false;
    
    let matchQuery = text.includes(query);
    
    if (matchFilter && matchQuery) {
      wrapper.style.display = '';
    } else {
      wrapper.style.display = 'none';
    }
  });
  
  // Hide section containers if all their items are hidden
  const containers = document.querySelectorAll('.di-sec-container');
  containers.forEach(container => {
    const items = container.querySelectorAll('.di-item-wrapper');
    const hasVisible = Array.from(items).some(item => item.style.display !== 'none');
    container.style.display = hasVisible ? '' : 'none';
  });
  
  // Show empty state if no visible elements
  const visible = Array.from(wrappers).some(w => w.style.display !== 'none');
  const empty = document.getElementById('di-empty-search');
  if (empty) {
    empty.style.display = (!visible && wrappers.length > 0) ? '' : 'none';
  }
}

/* ════════════════════════════════════════════════════════════════
   SMOOTH NAVIGATION ENGINE (DIRECT ACTION ON CLICK)
   ════════════════════════════════════════════════════════════════ */
function diNavigateToItem(type, id) {
  diCollapse(); // minimize island first
  diSoundPop(); // play touch click feedback sound

  if (type === "chat") {
    if (typeof switchView === "function") {
      switchView("chat");
    } else if (typeof switchModule === "function") {
      switchModule("alerts");
    }
  } else if (["overdue", "today", "tomorrow", "next"].includes(type)) {
    if (id && typeof quickOpenStudent === "function") {
      quickOpenStudent(id);
    } else {
      if (typeof switchView === "function") {
        switchView("followups");
      } else if (typeof switchModule === "function") {
        switchModule("followups");
      }
    }
  } else if (type === "lead") {
    if (id && typeof openLeadCRM === "function") {
      openLeadCRM(id);
    } else {
      if (typeof switchView === "function") {
        switchView("leads");
      } else if (typeof switchModule === "function") {
        switchModule("leads");
      }
    }
  }
}

/* ════════════════════════════════════════════════════════════════
   APPLE-STYLE SOUND ENGINE (MP3 COPY WITH SYNTHETIC FALLBACK)
   ════════════════════════════════════════════════════════════════ */
let _diAudioCtx = null;
function _diCtx() {
  if (!_diAudioCtx) {
    try { _diAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  if (_diAudioCtx.state === "suspended") _diAudioCtx.resume();
  return _diAudioCtx;
}

function diSoundPop() {
  try {
    const a = new Audio("../shared/son_duquotidient-message-envoye-iphone-apple-391098.mp3");
    a.volume = 0.5;
    a.play().then(() => {
      console.log("[DI] Custom mp3 played");
    }).catch(function(err) {
      _diOscillatorPop();
    });
  } catch(e) {
    _diOscillatorPop();
  }
}

// Custom Synthetic oscillator sounds
function _diOscillatorPop() {
  const ctx = _diCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const m = ctx.createGain();
  m.gain.setValueAtTime(0, t);
  m.gain.linearRampToValueAtTime(0.16, t + 0.007);
  m.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  m.connect(ctx.destination);
  [[120,55,0.12,1.0,"sine"],[680,360,0.08,0.5,"sine"],[1800,900,0.09,0.22,"sine"]].forEach(function(p) {
    var o = ctx.createOscillator(), gn = ctx.createGain();
    o.type = p[4]; o.frequency.setValueAtTime(p[0], t); o.frequency.exponentialRampToValueAtTime(p[1], t+p[2]);
    gn.gain.setValueAtTime(p[3], t); gn.gain.exponentialRampToValueAtTime(0.001, t+p[2]);
    o.connect(gn); gn.connect(m); o.start(t); o.stop(t+p[2]+0.02);
  });
}

function diSoundExpand() {
  const ctx = _diCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const m = ctx.createGain();
  m.gain.setValueAtTime(0.11, t); m.gain.exponentialRampToValueAtTime(0.0001, t+0.16);
  m.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = "sine"; o.frequency.setValueAtTime(260, t);
  o.frequency.exponentialRampToValueAtTime(740, t+0.06);
  o.frequency.exponentialRampToValueAtTime(520, t+0.13);
  o.connect(m); o.start(t); o.stop(t+0.17);
  const o2 = ctx.createOscillator(), g2 = ctx.createGain();
  o2.type = "triangle"; o2.frequency.setValueAtTime(2400, t+0.01);
  g2.gain.setValueAtTime(0.07, t+0.01); g2.gain.exponentialRampToValueAtTime(0.0001, t+0.06);
  o2.connect(g2); g2.connect(ctx.destination); o2.start(t+0.01); o2.stop(t+0.07);
}

function diSoundCollapse() {
  const ctx = _diCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const m = ctx.createGain();
  m.gain.setValueAtTime(0.08, t); m.gain.exponentialRampToValueAtTime(0.0001, t+0.16);
  m.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = "sine"; o.frequency.setValueAtTime(580, t);
  o.frequency.exponentialRampToValueAtTime(200, t+0.09);
  o.connect(m); o.start(t); o.stop(t+0.11);
}

/* ════════════════════════════════════════════════════════════════
   CONTROLS  — always visible, only minimize / maximize
   ════════════════════════════════════════════════════════════════ */
function diExpand(e) {
  if (e) e.stopPropagation();
  const el = document.getElementById("di-island");
  if (!el || el.classList.contains("di-expanded")) return;
  diSoundExpand();
  el.classList.add("di-expanded");
  el.scrollTop = 0;
  const btn = document.getElementById("di-mini-btn");
  if (btn) btn.textContent = "▼";
  
  // Only autofocus search on desktop to prevent mobile viewport scroll jump & keyboard popup
  if (window.innerWidth > 767) {
    setTimeout(() => {
      document.getElementById("di-search-input")?.focus();
    }, 350);
  }
}

function diCollapse(e) {
  if (e) e.stopPropagation();
  const el = document.getElementById("di-island");
  if (!el || !el.classList.contains("di-expanded")) return;
  diSoundCollapse();
  el.classList.remove("di-expanded");
  el.scrollTop = 0;
  const btn = document.getElementById("di-mini-btn");
  if (btn) btn.textContent = "▲";
}

function diToggle(e) {
  if (e) e.stopPropagation();
  const el = document.getElementById("di-island");
  if (!el) return;
  el.classList.contains("di-expanded") ? diCollapse(e) : diExpand(e);
}

function diRefresh(e) {
  if (e) e.stopPropagation();
  if (window._diSb && window._diUser) {
    const list = document.getElementById("di-list");
    if (list) list.innerHTML = '<div class="di-skeleton"></div><div class="di-skeleton" style="height:40px;margin-top:5px;opacity:0.55"></div>';
    loadDynamicIsland(window._diSb, window._diUser);
  }
}

/* ════════════════════════════════════════════════════════════════
   UNREAD CHAT POPUP (iOS NOTIFICATION STYLE CARD)
   ════════════════════════════════════════════════════════════════ */
let _diLastChatPopupId = null;

function diShowChatPopup(sender, message, groupName) {
  const old = document.getElementById("di-chat-popup");
  if (old) old.remove();

  const isMobile = window.innerWidth <= 767;
  const popupTop = isMobile ? "100px" : "54px";

  const popup = document.createElement("div");
  popup.id = "di-chat-popup";
  popup.style.cssText = [
    "position:fixed",
    "top:" + popupTop,
    "left:var(--di-center, 50%)",
    "transform:translateX(-50%) translateY(0)",
    "z-index:2147483646",
    "background:rgba(10,10,14,0.97)",
    "backdrop-filter:blur(20px)",
    "-webkit-backdrop-filter:blur(20px)",
    "border:1px solid rgba(168,85,247,0.3)",
    "border-radius:18px",
    "padding:12px 16px",
    "width:clamp(260px,85vw,390px)",
    "box-shadow:0 12px 40px rgba(0,0,0,0.85),0 0 0 1px rgba(168,85,247,0.15)",
    "animation:di-slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)",
    "cursor:pointer"
  ].join(";");

  popup.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#a855f7,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">💬</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-family:Outfit,sans-serif;font-size:0.72rem;font-weight:700;color:#a78bfa;margin-bottom:2px;">' + (groupName || "Chat") + '</div>' +
        '<div style="font-family:Outfit,sans-serif;font-size:0.8rem;font-weight:600;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sender + '</div>' +
        '<div style="font-size:0.68rem;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;">' + (message || "") + '</div>' +
      '</div>' +
      '<button id="di-popup-close" style="background:rgba(255,255,255,0.07);border:none;color:#64748b;border-radius:50%;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.7rem;flex-shrink:0;">✕</button>' +
    '</div>';

  document.body.appendChild(popup);
  diSoundPop();

  document.getElementById("di-popup-close").onclick = function(e) {
    e.stopPropagation();
    popup.remove();
  };
  popup.onclick = function(e) {
    if (!e.target.closest("#di-popup-close")) {
      diNavigateToItem("chat", null);
      popup.remove();
    }
  };

  setTimeout(function() {
    if (popup.parentNode) {
      popup.style.transition = "opacity 0.3s, transform 0.3s";
      popup.style.opacity = "0";
      popup.style.transform = "translateX(-50%) translateY(-8px)";
      setTimeout(function() { popup.remove(); }, 320);
    }
  }, 7000);
}

/* ════════════════════════════════════════════════════════════════
   RENDER
   ════════════════════════════════════════════════════════════════ */
function diRender(items) {
  const el       = document.getElementById("di-island");
  const lbl      = document.getElementById("di-pill-label");
  const badge    = document.getElementById("di-pill-badge");
  const dot      = document.getElementById("di-dot");
  const list     = document.getElementById("di-list");
  const chip     = document.getElementById("di-date-chip");
  const footTxt  = document.getElementById("di-footer-txt");
  const footTime = document.getElementById("di-footer-time");
  if (!el) return;

  const total     = items.length;
  const overdueN  = items.filter(function(i){ return i.type === "overdue"; }).length;
  const chatN     = items.filter(function(i){ return i.type === "chat"; }).length;
  const todayN    = items.filter(function(i){ return i.type === "today" || (i.type === "lead" && i.isToday); }).length;
  const tomorrowN = items.filter(function(i){ return i.type === "tomorrow" || (i.type === "lead" && i.isTomorrow); }).length;
  const leadN     = items.filter(function(i){ return i.type === "lead" && !i.isToday && !i.isTomorrow; }).length;
  const urgentN   = overdueN + chatN + todayN;

  /* Date chip */
  var now = new Date();
  var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var months   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (chip) chip.textContent = "📅 " + dayNames[now.getDay()] + ", " + now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();

  /* Collapsed pill label - compact & collision-free */
  var labelText = "Sab clear ✓";
  if (total > 0) {
    var parts = [];
    if (overdueN)  parts.push(overdueN + " Overdue");
    if (chatN)     parts.push(chatN + (chatN > 1 ? " Chats" : " Chat"));
    if (parts.length === 0) {
      if (todayN)    parts.push(todayN + " Today");
      else if (tomorrowN) parts.push(tomorrowN + " Tomorrow");
      else if (leadN)     parts.push(leadN + (leadN > 1 ? " Leads" : " Lead"));
      else parts.push(total + " Pending");
    }
    labelText = parts.join(" · ");
  }
  if (lbl)   lbl.textContent  = labelText;
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? "" : "none"; }
  try { updateDynamicIslandPosition(); } catch(e) {}

  /* Dot colour */
  if (dot) dot.className = "di-live-dot " + (urgentN > 0 ? "red" : total > 0 ? "amber" : "green");

  /* List Rendering */
  if (list) {
    const filterBar = document.getElementById("di-filter-bar");
    if (total === 0) {
      list.innerHTML = '<div class="di-empty">🎉 Sab clear!<br><span style="color:#334155;font-size:0.63rem">No pending follow-ups, leads or unread messages</span></div>';
      if (filterBar) filterBar.style.display = "none";
    } else {
      if (filterBar) filterBar.style.display = "";
      
      var SECS = [
        { key:"chat",     lbl:"💬 Unread Group Chats",    icon:"ic-chat",     tag:"tg-chat",     emoji:"💬", urg:"di-item-chat-urgent" },
        { key:"overdue",  lbl:"⚠️ Overdue Follow-ups",    icon:"ic-overdue",  tag:"tg-overdue",  emoji:"⚠️", urg:"di-item-urgent" },
        { key:"today",    lbl:"📞 Aaj ke Follow-ups",      icon:"ic-today",    tag:"tg-today",    emoji:"📞", urg:"" },
        { key:"tomorrow", lbl:"📅 Kal ke Follow-ups",      icon:"ic-tomorrow", tag:"tg-tomorrow", emoji:"📅", urg:"" },
        { key:"next",     lbl:"🗓️ Next Scheduled",        icon:"ic-next",     tag:"tg-next",     emoji:"🗓️", urg:"" },
        { key:"lead",     lbl:"🚀 Hot Leads / Callbacks", icon:"ic-lead",     tag:"tg-lead",     emoji:"🚀", urg:"" }
      ];
      
      var html = "";
      SECS.forEach(function(sec) {
        var its = items.filter(function(i){ return i.type === sec.key; });
        if (!its.length) return;
        
        html += '<div class="di-sec-container" data-type="' + sec.key + '">';
        html += '<div class="di-sec-label">' + sec.lbl + '</div>';
        its.forEach(function(item) {
          var urgClass = (item.urgent && sec.urg) ? " " + sec.urg : "";
          var targetId = item.id || "";
          
          // Dynamic styling override (e.g. today's callbacks in yellow, tomorrow's in orange)
          var itemIconClass = item.iconClass || sec.icon;
          var itemTagClass  = item.tagClass || sec.tag;
          
          html +=
            '<div class="di-item-wrapper" data-type="' + item.type + '">' +
              '<div class="di-item' + urgClass + '" onclick="diNavigateToItem(\'' + item.type + '\', \'' + targetId + '\')">' +
                '<div class="di-icon ' + itemIconClass + '">' + sec.emoji + '</div>' +
                '<div class="di-body">' +
                  '<div class="di-name">' + item.name + '</div>' +
                  '<div class="di-detail">' + item.detail + '</div>' +
                '</div>' +
                '<span class="di-tag ' + itemTagClass + '">' + item.tag + '</span>' +
              '</div>' +
            '</div>';
        });
        html += '</div>';
      });
      list.innerHTML = html + '<div id="di-empty-search" class="di-empty" style="display:none">🔍 No matching briefing items found</div>';
      
      // Re-apply current filter/search values if list updated in background
      diApplyFilters();
    }
  }

  /* Footer */
  if (footTxt)  footTxt.textContent  = total > 0 ? (total + " item" + (total !== 1 ? "s" : "") + " need attention") : "Nothing urgent 👍";
  var hh = String(now.getHours()).padStart(2,"0"), mm = String(now.getMinutes()).padStart(2,"0");
  if (footTime) footTime.textContent = "Updated " + hh + ":" + mm;

  /* Expansion animation pop on initial load */
  if (!el.classList.contains("di-visible")) {
    diSoundPop();
    setTimeout(function(){ el.classList.add("di-visible"); }, 300);
    setTimeout(function(){ diExpand(); }, 1000);
    setTimeout(function(){ diCollapse(); }, 16000);
  } else {
    if (urgentN > 0) diSoundPop();
  }
}

/* ════════════════════════════════════════════════════════════════
   DATA FETCHER
   ════════════════════════════════════════════════════════════════ */
async function loadDynamicIsland(sb, currentUser) {
  window._diSb   = sb;
  window._diUser = currentUser;

  const el = document.getElementById("di-island");
  if (el && !el.classList.contains("di-visible")) {
    setTimeout(function(){ el.classList.add("di-visible"); }, 350);
  }

  try {
    const cid      = currentUser.counsellor_id || currentUser.employee_id || null;
    const userName = currentUser.full_name || "";
    const userId   = currentUser.id || currentUser.employee_id || cid || "";

    /* Timezone-aware today & tomorrow dates */
    const todayDate = new Date();
    const todayStr = todayDate.getFullYear() + "-" + String(todayDate.getMonth() + 1).padStart(2, '0') + "-" + String(todayDate.getDate()).padStart(2, '0');
    
    const tmrwDate = new Date(Date.now() + 86400000);
    const tmrwStr = tmrwDate.getFullYear() + "-" + String(tmrwDate.getMonth() + 1).padStart(2, '0') + "-" + String(tmrwDate.getDate()).padStart(2, '0');
    
    const items    = [];

    /* Fetch chat groups mapping to resolve group_id -> name */
    let groupMap = {
      '00000000-0000-0000-0000-000000000001': 'Admin & Team Leader Group',
      '00000000-0000-0000-0000-000000000002': 'Admission Broadcasts',
      '00000000-0000-0000-0000-000000000003': 'System Activity Feed'
    };
    try {
      const { data: cGroups } = await sb.from("chat_groups").select("id, name");
      if (cGroups) {
        cGroups.forEach(function(cg) {
          if (cg.id) groupMap[cg.id] = cg.name;
        });
      }
    } catch(e) {}

    /* Fetch student profiles map to resolve student_id -> full_name */
    let studentMap = {};
    try {
      const { data: students } = await sb.from("student_profiles").select("student_id, full_name");
      if (students) {
        students.forEach(function(s) {
          if (s.student_id) studentMap[s.student_id] = s.full_name;
        });
      }
    } catch(e) {}

    /* ── 1. Follow-ups ── */
    let fups = [];
    try {
      if (cid) {
        const { data, error } = await sb.rpc("get_followups", { p_counsellor_id: cid });
        if (!error && data) fups = data;
      }
      if (!fups.length) {
        const { data, error } = await sb.rpc("rpc_tl_get_all_followups");
        if (!error && data) fups = data;
      }
    } catch(e) {}

    // Group by student_id to identify latest completed followup and next_followup_date
    let studentGroups = {};
    fups.forEach(function(f) {
      if (!f.student_id) return;
      if (!studentGroups[f.student_id]) studentGroups[f.student_id] = [];
      studentGroups[f.student_id].push(f);
    });

    let processedFups = [];
    Object.keys(studentGroups).forEach(function(sid) {
      let sFups = studentGroups[sid];
      
      let maxCompletedDate = "";
      let nextFupDateVal = null;
      let nextFupTimeVal = null;
      
      sFups.forEach(function(f) {
        const status = (f.status || "").toLowerCase();
        const d = diGetLocalDateStr(f.followup_date);
        if (status === "completed") {
          if (d > maxCompletedDate) {
            maxCompletedDate = d;
            nextFupDateVal = f.next_followup_date || null;
            nextFupTimeVal = f.followup_time || null;
          }
        }
      });
      
      // Filter out any row on or before the maxCompletedDate (obsolete scheduled tasks)
      let activeRows = sFups.filter(function(f) {
        const status = (f.status || "").toLowerCase();
        if (status === "completed") return false;
        const d = diGetLocalDateStr(f.followup_date);
        if (maxCompletedDate !== "" && d <= maxCompletedDate) {
          return false; 
        }
        return true;
      });
      
      activeRows.forEach(function(f) {
        processedFups.push(f);
      });
      
      // If there are no newer scheduled rows in activeRows, and nextFupDateVal is set, synthesize a virtual followup
      if (nextFupDateVal) {
        const nextDateStr = diGetLocalDateStr(nextFupDateVal);
        const hasNewerActive = activeRows.some(function(af) {
          const ad = diGetLocalDateStr(af.followup_date);
          return ad >= nextDateStr;
        });
        
        if (!hasNewerActive) {
          if (maxCompletedDate === "" || nextDateStr > maxCompletedDate) {
            processedFups.push({
              student_id: sid,
              student_name: sFups[0].student_name || null,
              followup_date: nextDateStr,
              followup_time: nextFupTimeVal,
              status: "Scheduled",
              followup_result: "",
              notes: "Scheduled from previous completed follow-up"
            });
          }
        }
      }
    });

    fups = processedFups;
    fups.sort(function(a,b){ return (a.followup_date||"").localeCompare(b.followup_date||""); });

    let nextFupAdded = false;
    fups.forEach(function(f) {
      const status = (f.status || "").toLowerCase();
      if (status === "completed") return;

      const d    = diGetLocalDateStr(f.followup_date);
      const name = f.student_name || studentMap[f.student_id] || f.student_id || "Unknown";
      const time = f.followup_time ? " at " + String(f.followup_time).slice(0,5) : "";
      const note = f.notes ? " · " + String(f.notes).slice(0,45) : "";
      
      const resText = f.followup_result || f.status || "Pending";

      if (d < todayStr && d !== "") {
        const friendlyDate = diFormatFriendlyDate(d);
        items.push({
          type:"overdue", urgent:true, id: f.student_id,
          name: name,
          detail: "Follow-up missed on " + friendlyDate + note + " · " + resText,
          tag: friendlyDate.toUpperCase() + " ⚠️",
          iconClass: "ic-overdue",
          tagClass: "tg-overdue"
        });
      } else if (d === todayStr) {
        items.push({
          type:"today", id: f.student_id,
          name: name,
          detail: "Follow-up" + time + note + " · " + resText,
          tag: "TODAY",
          iconClass: "ic-today",
          tagClass: "tg-today"
        });
      } else if (d === tmrwStr) {
        items.push({
          type:"tomorrow", id: f.student_id,
          name: name,
          detail: "Kal follow-up" + time + " · " + resText,
          tag: "TOMORROW",
          iconClass: "ic-tomorrow",
          tagClass: "tg-tomorrow"
        });
      } else if (d > tmrwStr && !nextFupAdded && (status === "scheduled" || status === "")) {
        nextFupAdded = true;
        const friendlyDate = diFormatFriendlyDate(d);
        items.push({
          type:"next", id: f.student_id,
          name: name,
          detail: "Next: " + friendlyDate + time + " · " + resText,
          tag: friendlyDate.toUpperCase(),
          iconClass: "ic-next",
          tagClass: "tg-next"
        });
      }
    });

    /* ── 2. Hot Leads / Callbacks ── */
    let leads = [];
    try {
      if (cid) {
        const { data, error } = await sb.rpc("rpc_counsellor_get_leads", { p_counsellor_id: cid });
        if (!error && data) leads = data;
      }
      if (!leads.length) {
        const { data, error } = await sb.from("leads").select("*").limit(200);
        if (!error && data) leads = data;
      }
    } catch(e) {}

    leads.forEach(function(l) {
      const stage = (l.status || l.stage || "").toLowerCase();
      if (["closed","won","lost","rejected","registered"].includes(stage)) return;
      
      const cb = diGetLocalDateStr(l.next_followup_date || l.callback_date);
      if (!cb) return;

      const isWarm  = ["warm", "hot"].includes(stage);
      const cbToday = cb === todayStr;
      const cbTmrw  = cb === tmrwStr;
      if (!isWarm && !cbToday && !cbTmrw) return;
      
      const name  = l.full_name || l.lead_name || l.name || "Lead";
      const phone = l.phone || l.mobile || "";
      const when  = cbToday ? "Today" : cbTmrw ? "Tomorrow" : "Warm Lead";
      const callbackDateStr = cb ? " (" + diFormatFriendlyDate(cb) + ")" : "";
      
      // Dynamic Styling according to callback date (today: yellow, tomorrow: orange, rest: blue)
      var itemIconClass = cbToday ? "ic-today" : cbTmrw ? "ic-tomorrow" : "ic-lead";
      var itemTagClass  = cbToday ? "tg-today" : cbTmrw ? "tg-tomorrow" : "tg-lead";

      items.push({
        type:"lead", id: l.lead_id,
        name: name,
        detail: (l.status || "Lead") + " · Callback " + when + callbackDateStr + (phone ? " · "+phone : ""),
        tag: isWarm ? "WARM 🔥" : cbToday ? "TODAY" : "TOMORROW",
        isToday: cbToday,
        isTomorrow: cbTmrw,
        iconClass: itemIconClass,
        tagClass: itemTagClass
      });
    });

    /* ── 3. Unread Chat Messages (Group-aware Premium Notification Builder) ── */
    try {
      const { data: msgs, error: ce } = await sb
        .from("notifications")
        .select("id, sender_id, sender_name, message, read_by, group_id, category, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!ce && msgs) {
        const unreadMsgs = msgs.filter(function(m) {
          if (m.sender_id === userId) return false;
          if ((m.sender_name || "") === userName) return false;
          let readList = [];
          try { readList = typeof m.read_by === "string" ? JSON.parse(m.read_by) : (m.read_by || []); } catch(e) {}
          if (!Array.isArray(readList)) readList = [];
          return !readList.includes(userName);
        });

        // Group by Chat Room (Group ID or Direct Sender)
        const byChatRoom = {};
        unreadMsgs.forEach(function(m) {
          const roomKey = m.group_id ? ("group_" + m.group_id) : ("direct_" + (m.sender_name || m.category || "Broadcast"));
          if (!byChatRoom[roomKey]) byChatRoom[roomKey] = [];
          byChatRoom[roomKey].push(m);
        });

        Object.keys(byChatRoom).forEach(function(rk) {
          const roomMsgs = byChatRoom[rk];
          const latest = roomMsgs[0];
          const count  = roomMsgs.length;
          
          let name, detail, idVal;
          if (rk.startsWith("group_")) {
            const gid = rk.substring(6);
            name = "👥 " + (groupMap[gid] || "Group Chat");
            detail = latest.sender_name + ": " + latest.message;
            idVal = gid;
          } else {
            name = latest.sender_name || latest.category || "Broadcast";
            detail = latest.message;
            idVal = latest.sender_id || "";
          }

          items.push({
            type:"chat", urgent:true, id: idVal,
            name: name,
            detail: (count > 1 ? "(" + count + ") " : "") + (detail || "").slice(0, 60),
            tag: count > 1 ? count + " NEW" : "NEW",
            iconClass: "ic-chat",
            tagClass: "tg-chat"
          });

          // Popup for messages in last 5 min
          const msgAge = (Date.now() - new Date(latest.created_at).getTime()) / 60000;
          if (msgAge < 5 && latest.id !== _diLastChatPopupId) {
            _diLastChatPopupId = latest.id;
            setTimeout(function(){ 
              diShowChatPopup(latest.sender_name || "Someone", latest.message || "", name); 
            }, 1500);
          }
        });
      }
    } catch(e) {}

    diRender(items);
  } catch(err) {
    console.warn("[DI] fetch error:", err);
    diRender([]);
  }
}

/* ════════════════════════════════════════════════════════════════
   AUTO-REFRESH every 5 min + chat poll every 30s
   ════════════════════════════════════════════════════════════════ */
setInterval(function() {
  if (window._diSb && window._diUser) {
    loadDynamicIsland(window._diSb, window._diUser);
  }
}, 5 * 60 * 1000);

setInterval(function() {
  if (!window._diSb || !window._diUser) return;
  (async function() {
    try {
      const userName   = window._diUser.full_name || "";
      const userId     = window._diUser.id || window._diUser.employee_id || window._diUser.counsellor_id || "";
      const fiveMinsAgo = new Date(Date.now() - 5*60*1000).toISOString();
      const { data: msgs } = await window._diSb
        .from("notifications")
        .select("id, sender_id, sender_name, message, read_by, created_at")
        .gt("created_at", fiveMinsAgo)
        .order("created_at", { ascending: false })
        .limit(10);

      (msgs || []).forEach(function(m) {
        if (m.sender_id === userId) return;
        if ((m.sender_name || "") === userName) return;
        let readList = [];
        try { readList = typeof m.read_by === "string" ? JSON.parse(m.read_by) : (m.read_by || []); } catch(e) {}
        if (!Array.isArray(readList)) readList = [];
        if (!readList.includes(userName) && m.id !== _diLastChatPopupId) {
          _diLastChatPopupId = m.id;
          diShowChatPopup(m.sender_name || "Someone", m.message || "", "New Message");
        }
      });
    } catch(e) {}
  })();
}, 30 * 1000);
