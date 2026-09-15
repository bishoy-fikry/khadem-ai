/* ============================================================
   core/ui.js — مساعدات بناء الواجهة (HTML آمن دائمًا)
   كل الإدراج الديناميكي يمرّ عبر Util.esc.
   ============================================================ */
(function () {
  'use strict';

  var UI = {};
  var e = function (v) { return Util.esc(v); };

  UI.pageHead = function (icon, title, sub) {
    return '<section class="card"><h2>' + e(icon) + ' ' + e(title) + '</h2>' +
      (sub ? '<p class="muted small">' + e(sub) + '</p>' : '') + '</section>';
  };

  UI.hero = function (title, sub) {
    return '<section class="hero"><h2>' + e(title) + '</h2><p>' + e(sub) + '</p></section>';
  };

  UI.card = function (inner, cls) {
    return '<section class="card ' + (cls || '') + '">' + inner + '</section>';
  };

  UI.tile = function (icon, title, desc, link) {
    var href = Util.safeUrl(link) || '#/home';
    return '<a class="tile" href="' + e(href) + '">' +
      '<span class="tile-icon" aria-hidden="true">' + e(icon) + '</span>' +
      '<span class="tile-title">' + e(title) + '</span>' +
      (desc ? '<span class="tile-desc">' + e(desc) + '</span>' : '') + '</a>';
  };

  UI.grid = function (items, cls) {
    return '<div class="grid ' + (cls || '') + '">' + items.join('') + '</div>';
  };

  UI.badge = function (text, cls) { return '<span class="badge ' + (cls || '') + '">' + e(text) + '</span>'; };

  UI.chips = function (items, active, attr, id) {
    var a = attr || 'data-chip';
    return '<div class="chips" ' + (id ? 'id="' + e(id) + '"' : '') + '>' + items.map(function (it) {
      return '<button type="button" class="chip ' + (String(it.id) === String(active) ? 'active' : '') + '" ' + a + '="' + e(it.id) + '">' +
        e((it.icon ? it.icon + ' ' : '') + it.label) + '</button>';
    }).join('') + '</div>';
  };

  UI.btn = function (label, opts) {
    var o = opts || {};
    var cls = 'btn ' + (o.cls || '');
    var attrs = '';
    if (o.id) attrs += ' id="' + e(o.id) + '"';
    if (o.data) Object.keys(o.data).forEach(function (k) { attrs += ' data-' + e(k) + '="' + e(o.data[k]) + '"'; });
    if (o.href) return '<a class="' + e(cls) + '" href="' + e(Util.safeUrl(o.href) || '#/home') + '"' + attrs + '>' + e(label) + '</a>';
    return '<button type="button" class="' + e(cls) + '"' + attrs + (o.disabled ? ' disabled' : '') + '>' + e(label) + '</button>';
  };

  UI.progress = function (pct) {
    return '<div class="progress" role="progressbar" aria-valuenow="' + e(pct) + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + e(Math.max(0, Math.min(100, pct))) + '%"></span></div>';
  };

  UI.empty = function (text, icon) {
    return '<p class="muted center">' + e((icon || '🔍') + ' ' + text) + '</p>';
  };

  UI.needInput = function () {
    return '<span class="need-input">📝 NEEDS_ADMIN_INPUT</span>';
  };

  UI.sourceLink = function (id, name) {
    var s = window.Sources ? Sources.byId(id) : null;
    var label = name || (s ? s.name : id);
    var url = s && s.url ? Util.safeUrl(s.url) : '';
    var review = s && /NEEDS_ADMIN_INPUT/.test(s.access_note || '');
    var html = '<span class="badge ' + (review ? 'warn' : 'acc') + '" title="' + e(s ? (s.access_note || '') : '') + '">🔗 ' + e(label) + '</span>';
    if (url) html = '<a class="badge acc" href="' + e(url) + '" target="_blank" rel="noopener noreferrer">🔗 ' + e(label) + '</a>';
    return html;
  };

  UI.stat = function (num, label) {
    return '<div class="stat"><b>' + e(num) + '</b><span>' + e(label) + '</span></div>';
  };

  UI.itemList = function (rows) {
    if (!rows || !rows.length) return UI.empty('لا يوجد عنصر بعد', '📭');
    return '<ul class="item-list">' + rows.map(function (r) {
      return '<li>' +
        (r.link ? '<a href="' + e(Util.safeUrl(r.link)) + '" class="item-title">' + e(r.title) + '</a>'
          : '<span class="item-title">' + e(r.title) + '</span>') +
        (r.sub ? '<div class="item-meta">' + r.sub + '</div>' : '') +
        (r.meta ? '<div class="item-meta">' + r.meta + '</div>' : '') +
        '</li>';
    }).join('') + '</ul>';
  };

  UI.plainList = function (items) {
    return '<ul class="plain-list">' + items.map(function (i) { return '<li>' + e(i) + '</li>'; }).join('') + '</ul>';
  };

  UI.tabs = function (items, active, attr) {
    var a = attr || 'data-tab';
    return '<div class="tabs" role="tablist">' + items.map(function (it) {
      return '<button type="button" class="tab ' + (String(it.id) === String(active) ? 'active' : '') + '" ' + a + '="' + e(it.id) + '" role="tab">' + e(it.label) + '</button>';
    }).join('') + '</div>';
  };

  UI.field = function (label, inputHtml, hint) {
    return '<div class="field"><label>' + e(label) + '</label>' + inputHtml +
      (hint ? '<div class="item-meta">' + e(hint) + '</div>' : '') + '</div>';
  };

  UI.select = function (id, options, selected) {
    return '<select id="' + e(id) + '">' + options.map(function (o) {
      return '<option value="' + e(o.id) + '"' + (String(o.id) === String(selected) ? ' selected' : '') + '>' + e(o.label) + '</option>';
    }).join('') + '</select>';
  };

  UI.input = function (id, value, opts) {
    var o = opts || {};
    return '<input id="' + e(id) + '" type="' + e(o.type || 'text') + '" value="' + e(value || '') + '"' +
      (o.placeholder ? ' placeholder="' + e(o.placeholder) + '"' : '') +
      (o.maxlength ? ' maxlength="' + e(o.maxlength) + '"' : '') +
      (o.autocomplete ? ' autocomplete="' + e(o.autocomplete) + '"' : ' autocomplete="off"') +
      (o.inputmode ? ' inputmode="' + e(o.inputmode) + '"' : '') + '>';
  };

  UI.textarea = function (id, value, opts) {
    var o = opts || {};
    return '<textarea id="' + e(id) + '"' + (o.maxlength ? ' maxlength="' + e(o.maxlength) + '"' : '') +
      (o.placeholder ? ' placeholder="' + e(o.placeholder) + '"' : '') + '>' + e(value || '') + '</textarea>';
  };

  /* تنسيق نص بسيط آمن: **عريض** + أسطر جديدة */
  UI.rich = function (text) {
    var safe = e(text || '');
    return safe.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  };

  UI.meta = function (parts) {
    return parts.filter(Boolean).map(function (p) { return UI.badge(p.t, p.c); }).join(' ');
  };

  window.UI = UI;
})();
