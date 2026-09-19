// EduVision PWA Engine & Install Prompt Handler
(function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function(reg) {
          console.log('[EduVision PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch(function(err) {
          console.warn('[EduVision PWA] Service Worker registration failed:', err);
        });
    });
  }

  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    window._pwaDeferredPrompt = e;

    var installBtns = document.querySelectorAll('.pwa-install-btn, #pwaInstallBtn, .btn-pwa-install');
    installBtns.forEach(function(btn) {
      btn.style.display = 'inline-flex';
    });

    // Show floating PWA Install Card ONLY on mobile
    if (isMobileDevice()) {
      showPwaInstallBanner();
    }
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  function isMobileDevice() {
    var hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var isNarrow = window.innerWidth <= 768;
    var isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isNarrow || (hasTouch && isMobileAgent);
  }

  window.addEventListener('resize', function() {
    if (!isMobileDevice()) {
      hidePwaInstallBanner();
    }
  });

  window.installEduVisionApp = async function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      var choice = await deferredPrompt.userChoice;
      console.log('[EduVision PWA] User install choice:', choice.outcome);
      deferredPrompt = null;
      window._pwaDeferredPrompt = null;
      hidePwaInstallBanner();
    }
  };

  window.addEventListener('appinstalled', function() {
    console.log('[EduVision PWA] EduVision installed successfully!');
    deferredPrompt = null;
    hidePwaInstallBanner();
  });

  function showPwaInstallBanner() {
    if (!isMobileDevice()) return; // strictly mobile only - never show on desktop/laptop
    if (localStorage.getItem('eduvision_pwa_dismissed') === 'true') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return; // already installed
    if (document.getElementById('pwa-install-banner')) return;

    if (!document.getElementById('pwa-mobile-banner-style')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'pwa-mobile-banner-style';
      styleEl.textContent = '@media (min-width: 769px) { #pwa-install-banner { display: none !important; } }';
      document.head.appendChild(styleEl);
    }

    var banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.style.cssText = [
      'position: fixed',
      'bottom: 84px',
      'left: 50%',
      'transform: translateX(-50%)',
      'width: clamp(280px, 90vw, 420px)',
      'background: rgba(13, 20, 36, 0.96)',
      'backdrop-filter: blur(20px)',
      '-webkit-backdrop-filter: blur(20px)',
      'border: 1px solid rgba(201, 147, 42, 0.4)',
      'border-radius: 18px',
      'padding: 12px 16px',
      'box-shadow: 0 16px 40px rgba(0,0,0,0.85), 0 0 20px rgba(201,147,42,0.15)',
      'z-index: 99999',
      'display: flex',
      'align-items: center',
      'justify-content: space-between',
      'gap: 12px',
      'animation: pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    ].join(';');

    banner.innerHTML = [
      '<div style="display:flex; align-items:center; gap:10px; min-width:0;">',
        '<img src="/eduvision_app_icon.png" style="width:38px; height:38px; border-radius:10px; border:1px solid rgba(201,147,42,0.5); object-fit:contain; background:#070b12; flex-shrink:0;">',
        '<div style="min-width:0;">',
          '<div style="font-family:Outfit,sans-serif; font-weight:700; font-size:0.85rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Install EduVision App</div>',
          '<div style="font-size:0.68rem; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Learn • Grow • Succeed — Shape Your Career ✦</div>',
        '</div>',
      '</div>',
      '<div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">',
        '<button onclick="window.installEduVisionApp()" style="background:linear-gradient(135deg,#c9932a,#e2ad47); color:#070b12; border:none; border-radius:10px; font-weight:700; font-size:0.75rem; padding:7px 14px; cursor:pointer; box-shadow:0 4px 12px rgba(201,147,42,0.3);">Install</button>',
        '<button onclick="window.dismissPwaBanner()" style="background:rgba(255,255,255,0.08); color:#94a3b8; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.7rem;">✕</button>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);
  }

  window.dismissPwaBanner = function() {
    var banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
      localStorage.setItem('eduvision_pwa_dismissed', 'true');
    }
  };

  function hidePwaInstallBanner() {
    var banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
  }
})();
