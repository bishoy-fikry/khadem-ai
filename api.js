/* ============================================================
   core/api.js — عميل الجداول (RESTful Table API) + ارتداد آمن
   يعمل الموقع كاملًا بدون قاعدة بيانات (GitHub Pages مثلًا):
   أي فشل في fetch يُلتقط ويُستخدم fallback محلي.
   ============================================================ */
(function () {
  'use strict';

  var API = {};
  var TABLE = 'tables/';
  var cache = {};          // { table: { data, t } }
  var TTL = 30000;
  var online = null;       // null = غير معروف بعد

  API.available = function () { return online === true; };
  API.checked = function () { return online !== null; };

  function fetchJSON(url, opts) {
    if (typeof fetch !== 'function') return Promise.reject(new Error('no-fetch'));
    var o = opts || {};
    o.headers = Object.assign({ 'Accept': 'application/json' }, o.headers || {});
    return fetch(url, o).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.status === 204 ? null : res.json();
    });
  }

  /* يستخرج {data:[]} أو مصفوفة مباشرة */
  function asArray(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.rows)) return payload.rows;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
  }
  API.asArray = asArray;

  API.list = function (table, params) {
    var q = [];
    var p = params || {};
    q.push('page=' + (p.page || 1));
    q.push('limit=' + (p.limit || 100));
    if (p.search) q.push('search=' + encodeURIComponent(String(p.search).slice(0, 60)));
    if (p.sort) q.push('sort=' + encodeURIComponent(String(p.sort).slice(0, 30)));
    return fetchJSON(TABLE + table + '?' + q.join('&')).then(function (payload) {
      online = true;
      var arr = asArray(payload);
      cache[table] = { data: arr, t: Date.now() };
      return { data: arr, total: (payload && payload.total) || arr.length, schema: (payload && payload.schema) || null, online: true };
    }).catch(function (err) {
      online = false;
      return { data: (cache[table] && cache[table].data) || [], total: 0, schema: null, online: false, error: String(err && err.message || err) };
    });
  };

  API.get = function (table, id) {
    return fetchJSON(TABLE + table + '/' + encodeURIComponent(id)).then(function (r) { return { data: r, ok: true }; })
      .catch(function (e) { return { data: null, ok: false, error: String(e && e.message || e) }; });
  };

  API.post = function (table, body) {
    return fetchJSON(TABLE + table, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { online = true; return { data: r, ok: true }; })
      .catch(function (e) { online = false; return { data: null, ok: false, error: String(e && e.message || e) }; });
  };

  API.patch = function (table, id, body) {
    return fetchJSON(TABLE + table + '/' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return { data: r, ok: true }; })
      .catch(function (e) { return { data: null, ok: false, error: String(e && e.message || e) }; });
  };

  API.remove = function (table, id) {
    return fetchJSON(TABLE + table + '/' + encodeURIComponent(id), { method: 'DELETE' })
      .then(function () { return { ok: true }; })
      .catch(function (e) { return { ok: false, error: String(e && e.message || e) }; });
  };

  /* ---------- فحص حالة الجداول (لوحة الإدارة) ---------- */
  API.health = function () {
    var tables = ['sources', 'questions', 'content_items', 'leaderboard_entries', 'analytics_events', 'feedback'];
    return Promise.all(tables.map(function (t) {
      return API.list(t, { limit: 1 }).then(function (r) {
        return { table: t, online: r.online, total: r.total, error: r.error || null };
      });
    }));
  };

  API.hasDb = function () { return online === true; };

  window.API = API;
})();
