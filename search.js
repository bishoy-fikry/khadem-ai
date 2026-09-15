/* ============================================================
   core/search.js — محرك البحث الذكي الموحّد
   يبحث في: الألحان • القبطي (حروف/كلمات) • المكتبة • الأسئلة • المصادر • الأشهر والأعياد
   مع تطبيع عربي متسامح + تجميع بالنتائج + اقتراحات جاهزة.
   ============================================================ */
(function () {
  'use strict';

  var S = {};
  var INDEX = null;

  function build() {
    var idx = [];

    try {
      Hymns.all().forEach(function (h) {
        idx.push({
          group: 'الألحان', icon: '🎵', id: h.id, title: h.name,
          coptic: h.coptic || '',
          sub: (h.meaning || '').slice(0, 150) + (h.tune ? ' • ' + tune(h.tune) : ''),
          link: '#/hymns/' + h.id,
          text: [h.name, h.coptic, h.translit, h.meaning, h.note, (h.occasion || []).map(occN).join(' '), (h.tags || []).join(' ')].join(' ')
        });
      });
    } catch (e) { }
    try {
      Coptic.words().forEach(function (w, i) {
        idx.push({
          group: 'القبطي — مصطلحات', icon: '🔤', id: 'w' + i, title: w.coptic, coptic: w.coptic,
          sub: w.translit + ' — ' + w.ar + (w.where ? ' • ' + w.where : ''), link: '#/coptic',
          text: [w.coptic, w.translit, w.ar, w.where].join(' ')
        });
      });
      Coptic.letters().forEach(function (L) {
        idx.push({
          group: 'القبطي — الحروف', icon: '🔤', id: 'l' + L.i, title: L.ch + ' ' + L.lower, coptic: L.ch + ' ' + L.lower,
          sub: L.name + ' — ' + L.sound, link: '#/coptic',
          text: [L.ch, L.lower, L.name, L.translit, L.sound, L.ex].join(' ')
        });
      });
    } catch (e) { }
    try {
      Content.all().forEach(function (c) {
        idx.push({
          group: 'المكتبة', icon: '📚', id: c.id, title: c.title, coptic: '',
          sub: (c.summary || '').slice(0, 150), link: '#/library?type=' + c.type,
          text: [c.title, c.summary, c.body, (c.tags || []).join(' ')].join(' ')
        });
      });
    } catch (e) { }
    try {
      Bank.all().forEach(function (q) {
        idx.push({
          group: 'بنك الأسئلة', icon: '❓', id: q.id, title: q.question, coptic: '',
          sub: 'الإجابة: ' + q.options[q.correct_index] + ' • ' + catName(q.category),
          link: '#/quiz/lobby?category=' + q.category,
          text: [q.question, q.options.join(' '), q.explanation, (q.tags || []).join(' ')].join(' ')
        });
      });
    } catch (e) { }
    try {
      Sources.all().forEach(function (s) {
        idx.push({
          group: 'المصادر', icon: '🔗', id: s.id, title: s.name, coptic: '',
          sub: (s.description || '').slice(0, 140), link: '#/sources',
          text: [s.name, s.description, s.category, s.type].join(' ')
        });
      });
    } catch (e) { }
    try {
      Liturgy.months().forEach(function (m) {
        idx.push({
          group: 'التقويم القبطي', icon: '📅', id: 'm' + m.i, title: 'شهر ' + m.name, coptic: '',
          sub: (m.note || m.season || m.days + ' يومًا') , link: '#/liturgy',
          text: [m.name, m.note || '', m.season || ''].join(' ')
        });
      });
      Liturgy.fixedFeasts().forEach(function (f, i) {
        idx.push({
          group: 'التقويم القبطي', icon: '📅', id: 'f' + i, title: f.name, coptic: '',
          sub: f.day + ' ' + (Liturgy.months()[f.month - 1] || {}).name + ' — ' + (f.note || ''), link: '#/liturgy',
          text: [f.name, f.note].join(' ')
        });
      });
    } catch (e) { }

    return idx;
  }

  function occN(id) { var o = (window.APP.HYMN_OCCASIONS || []).filter(function (x) { return x.id === id; })[0]; return o ? o.label : id; }
  function tune(id) { var t = (window.APP.HYMN_TUNES || []).filter(function (x) { return x.id === id; })[0]; return t ? t.label : (id === 'all' ? 'حسب المناسبة' : id); }
  function catName(id) { var c = (window.APP.CATEGORIES || []).filter(function (x) { return x.id === id; })[0]; return c ? c.label : id; }

  S.invalidate = function () { INDEX = null; };
  S.ensure = function () { if (!INDEX) INDEX = build(); return INDEX; };

  /* ---------- البحث ---------- */
  S.query = function (q, opts) {
    var o = opts || {};
    var term = Util.clampText(String(q || ''), (window.APP.LIMITS.SEARCH));
    var idx = S.ensure();
    if (!term) return { term: '', total: 0, groups: [], flat: [] };

    var results = [];
    idx.forEach(function (item) {
      if (o.group && item.group !== o.group) return;
      var sc = Util.scoreText(item.title, term) * 2.5 + Util.scoreText(item.text, term) + Util.scoreText(item.sub, term) * 1.2;
      if (item.coptic && Util.normalizeAr(item.coptic).indexOf(Util.normalizeAr(term)) !== -1) sc += 10;
      if (sc > 0) results.push({ item: item, score: sc });
    });
    results.sort(function (a, b) { return b.score - a.score; });

    var flat = results.slice(0, o.limit || 60).map(function (r) {
      var it = {}; Object.keys(r.item).forEach(function (k) { it[k] = r.item[k]; });
      it.score = Math.round(r.score);
      return it;
    });

    /* تجميع */
    var groups = {};
    flat.forEach(function (item) {
      groups[item.group] = groups[item.group] || { group: item.group, icon: item.icon, items: [] };
      groups[item.group].items.push(item);
    });
    var groupArr = Object.keys(groups).map(function (k) { return groups[k]; })
      .sort(function (a, b) { return b.items.length - a.items.length; });

    return { term: term, total: flat.length, groups: groupArr, flat: flat };
  };

  /* ---------- الاقتراحات السريعة ---------- */
  S.quick = function () {
    return [
      { t: 'كيرياليسون', q: 'كيرياليسون' },
      { t: 'نغمة الحزايني', q: 'الحزايني' },
      { t: 'الواطس (الفرايحي)', q: 'واطس' },
      { t: 'أجيوس', q: 'أجيوس' },
      { t: 'رتبة القداس', q: 'رتبة القداس' },
      { t: 'شهر كيهك', q: 'كيهك' },
      { t: 'الثيؤطوكية', q: 'ثيؤطوكية' },
      { t: 'الرشومة', q: 'الرشومة' },
      { t: 'القداس الباسيلي', q: 'الباسيلي' },
      { t: 'الرهبنة', q: 'الرهبنة' },
      { t: 'حرف ϣ', q: 'ϣ' },
      { t: 'مار مرقس', q: 'مرقس' }
    ];
  };

  /* ---------- الأنواع المتاحة للفلترة ---------- */
  S.groups = function () {
    var idx = S.ensure(), set = {};
    idx.forEach(function (i) { set[i.group] = (set[i.group] || 0) + 1; });
    return Object.keys(set).map(function (k) { return { group: k, count: set[k] }; });
  };

  /* ---------- توصيات مبنية على الاهتمام ---------- */
  S.recommend = function () {
    var p = Store.get();
    var interests = Object.keys(p.interests || {}).sort(function (a, b) { return p.interests[b] - p.interests[a]; });
    var idx = S.ensure();
    var out = [];

    /* توصية لحن من مستوى مناسب */
    try {
      var lvl = p.hymnSessions >= 10 ? 3 : p.hymnSessions >= 3 ? 2 : 1;
      var pool = Hymns.byLevel(lvl);
      if (!pool.length) pool = Hymns.all();
      var pick = Util.shuffle(pool)[0];
      if (pick) out.push({ icon: '🎵', title: 'لحن اليوم المقترح: ' + pick.name, sub: 'مستوى ' + lvl + ' • ' + tune(pick.tune), link: '#/hymns/' + pick.id });
    } catch (e) { }

    /* توصية لعبة */
    var games = (window.APP.GAMES || []).slice();
    var g = Util.pick(games);
    if (g) out.push({ icon: g.icon, title: 'جرّب: ' + g.label, sub: g.desc, link: g.path });

    /* توصية حسب الاهتمام */
    if (interests.length) {
      var cat = interests[0];
      var c = (window.APP.CATEGORIES || []).filter(function (x) { return x.id === cat; })[0];
      if (c) {
        var catQs = Bank.byCategory(cat);
        if (catQs.length) out.push({ icon: c.icon, title: 'مسابقة في: ' + c.label, sub: catQs.length + ' سؤالًا متاحًا', link: '#/quiz/lobby?category=' + cat });
      }
    }

    /* توصية قبطي */
    try {
      var w = Util.pick(Coptic.words());
      if (w) out.push({ icon: '🔤', title: 'كلمة قبطية اليوم: ' + w.coptic, sub: w.translit + ' — ' + w.ar, link: '#/coptic' });
    } catch (e) { }

    return out.slice(0, 4);
  };

  /* ---------- فهرس محلي للفهم السريع ---------- */
  S.stats = function () {
    var idx = S.ensure(), by = {};
    idx.forEach(function (i) { by[i.group] = (by[i.group] || 0) + 1; });
    return { total: idx.length, by: by };
  };

  window.Search = S;
})();
