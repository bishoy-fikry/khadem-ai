/* ============================================================
   core/analytics.js — إحصائيات محلية بلا بيانات شخصية
   لا يُرسل أي شيء إلا للحقول المسموحة صراحةً.
   ============================================================ */
(function () {
  'use strict';

  var LS = (window.APP && window.APP.LS) || {};
  var A = {};
  var MAX_LOCAL = 800;

  var ALLOWED_KEYS = ['event_type', 'detail', 'session_id', 'created_at'];
  var ALLOWED_TYPES = ['page_view', 'search', 'ask', 'quiz_start', 'quiz_end', 'game_end', 'note', 'feedback', 'error', 'share', 'hymn_view', 'coptic_train', 'download'];

  A.track = function (type, detail) {
    try {
      if (!type) return;
      var t = ALLOWED_TYPES.indexOf(type) === -1 ? 'other' : type;
      var ev = {
        event_type: t,
        detail: Util.clampText(String(detail === undefined ? '' : detail), 120),
        session_id: Store.sessionId(),
        created_at: Date.now()
      };
      var all = Store.read(LS.ANALYTICS, []);
      all.push(ev);
      Store.write(LS.ANALYTICS, all.slice(-MAX_LOCAL));
      if (window.__SANDBOX_DEBUG__) console.log('[analytics]', ev.event_type, ev.detail);
      return ev;
    } catch (e) { return null; }
  };

  A.all = function () { return Store.read(LS.ANALYTICS, []); };

  A.summary = function () {
    var all = A.all();
    var out = { total: all.length, byType: {}, byDay: {}, errors: 0 };
    all.forEach(function (e) {
      out.byType[e.event_type] = (out.byType[e.event_type] || 0) + 1;
      var d = Util.dayKey(e.created_at);
      out.byDay[d] = (out.byDay[d] || 0) + 1;
      if (e.event_type === 'error') out.errors++;
    });
    return out;
  };

  A.clear = function () { Store.write(LS.ANALYTICS, []); };

  /* ---------- إرسال حدث للقاعدة (اختياري، وبحقول مسموحة فقط) ---------- */
  A.flush = function () {
    var rows = A.all().slice(-5);
    if (!rows.length || !window.API) return Promise.resolve({ sent: 0 });
    var sent = 0;
    var chain = Promise.resolve();
    rows.forEach(function (r) {
      chain = chain.then(function () {
        var payload = {};
        ALLOWED_KEYS.forEach(function (k) { if (r[k] !== undefined) payload[k] = String(r[k]); });
        return window.API.post('analytics_events', payload).then(function (res) {
          if (res && res.ok) sent++;
        }).catch(function () { });
      });
    });
    return chain.then(function () { return { sent: sent }; });
  };

  window.Analytics = A;
})();
