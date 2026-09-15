/* ============================================================
   views/home.js — اللوحة الرئيسية
   ============================================================ */
(function () {
  'use strict';

  function render(main) {
    var p = Store.get();
    var lvl = Store.level(p.xp);
    var badges = Store.badges();
    var allBadges = window.APP.BADGES || [];
    var today = Liturgy.today();
    var dayStreak = Store.touchDay();
    var recs = Search.recommend();
    var dk = Util.dayKey();
    var doneDaily = !!p.doneDaily[dk];

    var html = '';

    /* ---------- الترحيب ---------- */
    html += '<section class="hero">' +
      '<h2>⛪ أهلًا بك في مكتبتك القبطية</h2>' +
      '<p>' + Util.esc(window.APP.MOTTO) + '</p>' +
      '</section>';

    /* ---------- شريط المستوى ---------- */
    html += UI.card(
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<div style="font-size:2rem" aria-hidden="true">' + Util.esc(lvl.icon) + '</div>' +
      '<div style="flex:1;min-width:200px">' +
      '<b>' + Util.esc(lvl.name) + '</b> <span class="muted small">— ' + Util.esc(Util.arNum(p.xp)) + ' XP</span>' +
      (lvl.next ? '<div class="item-meta">المستوى القادم: ' + Util.esc(lvl.next) + ' — باقي ' + Util.esc(Util.arNum(lvl.remaining)) + ' XP</div>' : '<div class="item-meta">وصلت لأعلى مستوى 👑</div>') +
      UI.progress(lvl.progress) +
      '</div>' +
      '<div class="stat" style="min-width:96px"><b>' + Util.esc(Util.arNum(dayStreak)) + '</b><span>يوم متصل 🔥</span></div>' +
      '</div>', 'gold');

    /* ---------- تحدي اليوم ---------- */
    html += UI.card(
      '<h3>🔥 تحدي اليوم</h3>' +
      '<p class="small muted">نفس الأسئلة لكل اللاعبين اليوم — ' + Util.esc(Util.arabicDate()) + '</p>' +
      (doneDaily
        ? '<p>' + UI.badge('✅ أكملت تحدي اليوم', 'good') + ' تعال بكرة لتحدٍّ جديد!</p>'
        : '<div class="btn-row"><a class="btn gold" href="#/quiz/lobby?mode=daily">ابدأ تحدي اليوم</a>' +
        '<a class="btn ghost" href="#/quiz/lobby?mode=quick">مسابقة سريعة ⚡</a></div>'),
      'gold');

    /* ---------- طقس اليوم ---------- */
    html += UI.card(
      '<h3>📅 طقس اليوم</h3>' +
      '<p><b>' + Util.esc(today.copticLabel) + '</b> <span class="muted small">(' + Util.esc(today.gregorian) + ')</span></p>' +
      (today.feast ? '<p>' + UI.badge('عيد', 'gold') + ' ' + Util.esc(today.feast.name) + '</p>' : '') +
      (today.monthInfo && today.monthInfo.note ? '<p class="small">' + Util.esc(today.monthInfo.note) + '</p>' : '') +
      (today.isKiahk ? '<p>' + UI.badge('شهر كيهك — الشهر المريمي', 'gold') + '</p>' : '') +
      (today.needsInput ? '<p class="small muted">' + UI.needInput() + ' مدخل سنكسار اليوم غير متوفر بعد.</p>' : '') +
      '<div class="btn-row"><a class="btn ghost sm" href="#/liturgy">📅 التقويم والسنكسار</a></div>');

    /* ---------- البلاطات ---------- */
    var tiles = [
      UI.tile('🎵', 'مكتبة الألحان', Hymns.count + ' لحنًا • نغمات وترتيب القداس', '#/hymns'),
      UI.tile('🎮', 'الألعاب والمسابقات', '6 ألعاب • نقاط وشعارات', '#/games'),
      UI.tile('🔤', 'اللغة القبطية', Coptic.count + ' حرفًا • ' + Coptic.wordCount + ' مصطلحًا', '#/coptic'),
      UI.tile('🤖', 'اسأل خادم', 'مساعد محلي بدون مفتاح', '#/bot'),
      UI.tile('🔎', 'البحث الذكي', 'ابحث في المشروع كله', '#/search'),
      UI.tile('📚', 'المكتبة', Content.count + ' عنصرًا تعليميًا', '#/library'),
      UI.tile('🏆', 'المتصدرون', 'اليوم • الأسبوع • الشهر', '#/leaderboard'),
      UI.tile('👤', 'ملفي', Util.arNum(badges.length) + ' من ' + allBadges.length + ' شعارًا', '#/profile')
    ];
    html += UI.grid(tiles);

    /* ---------- موصى به لك ---------- */
    if (recs.length) {
      html += UI.card('<h3>💡 موصى به لك</h3>' + UI.grid(recs.map(function (r) {
        return UI.tile(r.icon, r.title, r.sub, r.link);
      })));
    }

    /* ---------- الشعارات القريبة ---------- */
    var locked = allBadges.filter(function (b) { return badges.indexOf(b.id) === -1; }).slice(0, 4);
    if (locked.length) {
      html += UI.card('<h3>🏅 شعارات قريبة</h3><div class="grid">' + locked.map(function (b) {
        return '<div class="tile"><span class="tile-icon">' + Util.esc(b.icon) + '</span><span class="tile-title">' + Util.esc(b.label) + '</span><span class="tile-desc">' + Util.esc(b.desc) + '</span></div>';
      }).join('') + '</div>');
    }

    /* ---------- رسالة الأمانة ---------- */
    html += UI.card('<h3>🛡 قاعدة المشروع</h3><ul class="plain-list">' +
      '<li>لا نخمّن معلومة: أي عنصر غير مؤكد يظهر بوسم 📝 NEEDS_ADMIN_INPUT.</li>' +
      '<li>المصادر للاستناد والتحقق، ولها سجل مركزي في المشروع.</li>' +
      '<li>لا ننسخ كتبًا أو عظات كاملة — مقتطفات قصيرة وروابط.</li>' +
      '<li>لا يوجد أي مفتاح أو API في الموقع — المساعد يعمل محليًا.</li>' +
      '</ul><div class="btn-row"><a class="btn ghost sm" href="#/more">⋯ المزيد والتفاصيل</a></div>', 'warn-card');

    main.innerHTML = html;
  }

  Router.define('home', { render: render });
})();
