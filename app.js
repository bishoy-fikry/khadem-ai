/* ============================================================
   js/app.js — التشغيل: التنقل، الثيم، الأخطاء العامة، البداية
   ============================================================ */
(function () {
  'use strict';

  /* ---------- الحالة العامة ---------- */
  window.__APP_READY__ = false;
  window.__SANDBOX_DEBUG__ = false;   /* اجعله true لو أردت رؤية سجلات الإحصائيات */

  /* ---------- 1) تنظيف المفاتيح القديمة (أمان) ---------- */
  try {
    var removed = Store.purgeLegacySecrets();
    if (removed.length && window.__SANDBOX_DEBUG__) console.log('[security] حُذفت مفاتيح قديمة:', removed);
  } catch (e) { }

  /* ---------- 2) التنقل العلوي + الشريط السفلي ---------- */
  function buildNav() {
    var nav = document.getElementById('mainNav');
    if (nav) {
      nav.innerHTML = (window.APP.NAV || []).map(function (n) {
        return '<a class="nav-link" href="' + Util.esc(n.path) + '">' + Util.esc(n.label) + '</a>';
      }).join('');
    }
    var bottom = document.getElementById('bottomNav');
    if (bottom) {
      var items = [
        { path: '#/home', icon: '🏠', label: 'الرئيسية', key: 'home' },
        { path: '#/hymns', icon: '🎵', label: 'الألحان', key: 'hymns' },
        { path: '#/games', icon: '🎮', label: 'الألعاب', key: 'games' },
        { path: '#/coptic', icon: '🔤', label: 'القبطي', key: 'coptic' },
        { path: '#/bot', icon: '🤖', label: 'خادم', key: 'bot' }
      ];
      bottom.innerHTML = items.map(function (i) {
        return '<a class="bn-item" href="' + Util.esc(i.path) + '"><span aria-hidden="true">' + Util.esc(i.icon) + '</span><span>' + Util.esc(i.label) + '</span></a>';
      }).join('');
    }
  }

  /* ---------- 3) الثيم (ليلي/نهاري) ---------- */
  function initTheme() {
    var prefs = Store.prefs();
    var saved = prefs.theme;
    var wantLight = saved ? saved === 'light' : false;
    document.body.classList.toggle('light', wantLight);
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = wantLight ? '☀️' : '🌙';
      btn.setAttribute('aria-pressed', wantLight ? 'true' : 'false');
      btn.addEventListener('click', function () {
        var isLight = document.body.classList.toggle('light');
        Store.setPref('theme', isLight ? 'light' : 'dark');
        btn.textContent = isLight ? '☀️' : '🌙';
        btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        Util.toast(isLight ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي', '', 1400);
      });
    }
  }

  /* ---------- 4) قائمة الموبايل ---------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('nav-link')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 5) تلميحات سريعة لوحة المفاتيح ---------- */
  function initShortcuts() {
    document.addEventListener('keydown', function (e) {
      /* / = بحث سريع */
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault();
        Router.go('#/search');
      }
      /* h = الرئيسية */
      if (e.key === 'h' && e.altKey) { e.preventDefault(); Router.go('#/home'); }
      /* g = الألعاب */
      if (e.key === 'g' && e.altKey) { e.preventDefault(); Router.go('#/games'); }
    });
  }

  /* ---------- 6) صمام الأمان العام: أي خطأ يُسجَّل ولا يكسر الموقع ---------- */
  function initErrorSafety() {
    window.addEventListener('error', function (ev) {
      try { Analytics.track('error', 'window:' + String(ev.message || '').slice(0, 90)); } catch (e) { }
    });
    window.addEventListener('unhandledrejection', function (ev) {
      try { Analytics.track('error', 'promise:' + String(ev.reason && ev.reason.message || ev.reason || '').slice(0, 90)); } catch (e) { }
    });
  }

  /* ---------- 7) لوحة المفاتيح: مؤشر الشبكة/الخروج ---------- */
  function initOnlineHint() {
    window.addEventListener('offline', function () { Util.toast('📴 أنت غير متصل — الموقع يعمل محليًا بالكامل، لا تقلق.', 'warn', 5000); });
    window.addEventListener('online', function () { Util.toast('✅ رجع الاتصال', 'good', 2000); });
  }

  /* ---------- 8) الراوتر: صفحة غير موجودة ---------- */
  function initNotFound() {
    Router.setNotFound(function (main, route) {
      main.innerHTML = '<section class="hero"><h2>🔍 الصفحة غير موجودة</h2><p>المسار «' + Util.esc(route.view) + '» غير معروف.</p></section>' +
        UI.card('<h3>جرب الصفحات دي</h3>' + UI.grid([
          UI.tile('🏠', 'الرئيسية', 'ابدأ من هنا', '#/home'),
          UI.tile('🎵', 'الألحان', 'مكتبة الألحان والنغمات', '#/hymns'),
          UI.tile('🎮', 'الألعاب', '6 ألعاب تعليمية', '#/games'),
          UI.tile('🔤', 'القبطي', 'الحروف والمصطلحات', '#/coptic'),
          UI.tile('🤖', 'اسأل خادم', 'مساعد محلي', '#/bot'),
          UI.tile('🔎', 'البحث', 'ابحث في كل شيء', '#/search')
        ]));
    });
  }

  /* ---------- 9) البداية ---------- */
  function boot() {
    try {
      buildNav();
      initTheme();
      initMobileNav();
      initShortcuts();
      initErrorSafety();
      initOnlineHint();
      initNotFound();

      /* معلومات النسخة */
      var v = document.getElementById('appVersion');
      if (v) v.textContent = 'v' + window.APP.VERSION;
      var pb = document.getElementById('poolBadge');
      if (pb) {
        try {
          pb.textContent = '🎵 ' + Util.arNum(Hymns.count) + ' لحنًا • ❓ ' + Util.arNum(Bank.count) + ' سؤالًا • 🔤 ' + Util.arNum(Coptic.count) + ' حرفًا';
        } catch (e) { pb.textContent = ''; }
      }

      /* تحديث السجل اليومي + الشعارات */
      try { Store.touchDay(); Store.checkBadges(); } catch (e) { }

      /* بدء الراوتر */
      Router.start();

      window.__APP_READY__ = true;
      if (window.__SANDBOX_DEBUG__) console.log('[app] جاهز — ' + window.APP.NAME + ' v' + window.APP.VERSION);
    } catch (err) {
      var main = document.getElementById('view');
      if (main) {
        main.innerHTML = '<section class="card err-card"><h2>⚠️ تعذّر تشغيل الموقع</h2>' +
          '<p>حدث خطأ أثناء التحميل. جرّب تحديث الصفحة (Ctrl+Shift+R).</p>' +
          '<p class="small muted">' + Util.esc(String(err && err.message || err)) + '</p></section>';
      }
      try { Analytics.track('error', 'boot:' + String(err && err.message || err)); } catch (e) { }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
