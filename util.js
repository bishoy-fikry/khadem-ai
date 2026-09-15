/* ============================================================
   core/util.js — دوال مساعدة آمنة (تهريب، تطبيع عربي، بذور، تنبيهات)
   ============================================================ */
(function () {
  'use strict';

  var U = {};

  /* ---------- تهريب النص (منع XSS) — يُستخدم في كل إدراج ديناميكي ---------- */
  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;', '=': '&#61;' };
  U.esc = function (v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/[&<>"'`=]/g, function (c) { return ESC_MAP[c]; });
  };

  /* ---------- تنظيف أي HTML قادم من الخارج (احتياطي إضافي) ---------- */
  U.stripTags = function (v) {
    return String(v === null || v === undefined ? '' : v).replace(/<[^>]*>/g, '');
  };

  /* للاستخدام داخل خصائص HTML */
  U.attr = function (v) { return U.esc(v); };

  /* ---------- تقييد الطول (حماية من إساءة الإدخال) ---------- */
  U.clampText = function (v, max) {
    var s = U.stripTags(String(v === null || v === undefined ? '' : v)).replace(/\s+/g, ' ').trim();
    if (!max) return s;
    return s.length > max ? s.slice(0, max) : s;
  };
  U.safeUrl = function (u) {
    var s = String(u || '').trim();
    if (!s) return '';
    return /^(https?:|#|mailto:|tel:)/i.test(s) ? s : '';
  };

  /* ---------- تطبيع العربية: همزات، تاء مربوطة، تشكيل، تطويل، أرقام ---------- */
  var AR_DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
  U.normalizeAr = function (v) {
    var s = String(v === null || v === undefined ? '' : v).toLowerCase();
    s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '');   // تشكيل + تطويل
    s = s.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');          // آ أ إ ٱ → ا
    s = s.replace(/\u0649/g, '\u064A').replace(/\u0629/g, '\u0647'); // ى→ي ، ة→ه
    s = s.replace(/\u0624/g, '\u0648').replace(/\u0626/g, '\u064A'); // ؤ→و ، ئ→ي
    s = s.replace(/[\u060C\u061B\u061F\u066B\u066C.,!?;:"'()\[\]{}«»]/g, ' ');
    s = s.replace(/[٠-٩]/g, function (d) { return AR_DIGITS[d] || d; });
    s = s.replace(/[أإآ]/g, 'ا');
    return s.replace(/\s+/g, ' ').trim();
  };

  /* مطابقة نصية متسامحة (substring بعد التطبيع) */
  U.matches = function (haystack, needle) {
    var h = U.normalizeAr(haystack), n = U.normalizeAr(needle);
    if (!n) return false;
    return h.indexOf(n) !== -1;
  };

  /* ---------- بحث ضبابي بسيط: كلمات السؤال مقابل النص ---------- */
  U.scoreText = function (text, query) {
    var t = U.normalizeAr(text), q = U.normalizeAr(query);
    if (!t || !q) return 0;
    var score = 0;
    if (t === q) score += 100;
    if (t.indexOf(q) === q.length - q.length && t.indexOf(q) !== -1) score += 25;
    var words = q.split(' ').filter(Boolean);
    var hits = 0;
    for (var i = 0; i < words.length; i++) {
      if (words[i].length < 2) continue;
      if (t.indexOf(words[i]) !== -1) hits++;
    }
    score += hits * 6;
    return score;
  };

  /* ---------- مولّد أرقام ببذرة (للتحديات الجماعية/اليومية) ---------- */
  U.hashStr = function (str) {
    var h = 2166136261;
    str = String(str || '');
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  };
  U.rngFrom = function (seed) {
    var s = (U.hashStr(seed) % 2147483647) || 1234567;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  U.seededShuffle = function (arr, seed) {
    var a = (arr || []).slice();
    var rnd = U.rngFrom(seed);
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  U.shuffle = function (arr) { return U.seededShuffle(arr, String(Math.random())); };
  U.pick = function (arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; };

  /* بذرة تحدي اليوم (تتغير كل يوم بالتاريخ المحلي — نفس البذرة للجميع) */
  U.dayKey = function (d) {
    var x = d ? new Date(d) : new Date();
    var y = x.getFullYear(), m = String(x.getMonth() + 1).padStart(2, '0'), da = String(x.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + da;
  };

  /* ---------- الوقت والتنسيق ---------- */
  U.mmss = function (sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  };
  U.arabicDate = function (ts) {
    try {
      var d = ts ? new Date(ts) : new Date();
      return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return ''; }
  };
  U.ago = function (ts) {
    var diff = Date.now() - Number(ts || 0);
    if (!diff || diff < 0) return 'الآن';
    var m = Math.floor(diff / 60000);
    if (m < 1) return 'الآن';
    if (m < 60) return 'منذ ' + m + ' دقيقة';
    var h = Math.floor(m / 60);
    if (h < 24) return 'منذ ' + h + ' ساعة';
    var dd = Math.floor(h / 24);
    return 'منذ ' + dd + ' يوم';
  };

  /* ---------- شريط التنبيهات ---------- */
  U.toast = function (msg, type, ms) {
    try {
      var wrap = document.getElementById('toasts');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'toasts';
        wrap.className = 'toast-wrap';
        wrap.setAttribute('role', 'status');
        wrap.setAttribute('aria-live', 'polite');
        document.body.appendChild(wrap);
      }
      var el = document.createElement('div');
      el.className = 'toast ' + (type === 'good' ? 'good' : type === 'bad' ? 'bad' : type === 'warn' ? 'warn' : '');
      el.textContent = String(msg || '');
      wrap.appendChild(el);
      setTimeout(function () {
        el.style.opacity = '0';
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
      }, ms || 3200);
    } catch (e) { /* لا نُسقط الصفحة بسبب تنبيه */ }
  };

  /* ---------- حماية تنفيذ أي دالة (لا ينهار الموقع) ---------- */
  U.guard = function (fn, fallback) {
    return function () {
      try { return fn.apply(this, arguments); }
      catch (err) {
        try {
          if (window.Analytics && window.Analytics.track) window.Analytics.track('error', String(err && err.message || err));
        } catch (e2) { }
        if (typeof fallback === 'function') { try { return fallback.apply(this, arguments); } catch (e3) { } }
        return undefined;
      }
    };
  };

  /* ---------- debounce ---------- */
  U.debounce = function (fn, wait) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, wait || 250);
    };
  };

  /* ---------- إنشاء عنصر بسرعة وبأمان ---------- */
  U.el = function (tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') e.textContent = String(attrs[k]);
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k === 'class') e.className = attrs[k];
        else e.setAttribute(k, String(attrs[k]));
      });
    }
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  };

  /* ---------- أرقام عربية للعرض ---------- */
  U.arNum = function (n) {
    try { return Number(n || 0).toLocaleString('ar-EG'); } catch (e) { return String(n); }
  };

  /* ---------- نسبة مئوية آمنة ---------- */
  U.pct = function (a, b) {
    if (!b) return 0;
    return Math.max(0, Math.min(100, Math.round((a / b) * 100)));
  };

  window.Util = U;
})();
