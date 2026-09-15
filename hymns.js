/* ============================================================
   views/hymns.js — مكتبة الألحان (القسم الأساسي للمشروع)
   تبويبات: كل الألحان | حسب المناسبة | النغمات الثلاث | رتبة القداس | خطوات الحفظ | تفاصيل اللحن
   ============================================================ */
(function () {
  'use strict';

  var state = { tab: 'all', occasion: 'all', tune: 'all', level: 'all', q: '' };

  function levelLabel(l) {
    return l === 1 ? '🟢 مبتدئ' : l === 2 ? '🟡 متوسط' : '🔴 متقدّم';
  }
  function occLabel(id) {
    var o = Hymns.occasions().filter(function (x) { return x.id === id; })[0];
    return o ? o.label : id;
  }
  function tuneLabel(id) {
    if (id === 'all') return 'حسب المناسبة';
    var t = Hymns.tunes().filter(function (x) { return x.id === id; })[0];
    return t ? t.label : id;
  }

  /* ==================== قائمة الألحان ==================== */
  function listView() {
    var list = Hymns.all();

    if (state.q) list = Hymns.search(state.q);
    if (state.occasion !== 'all') list = list.filter(function (h) { return (h.occasion || []).indexOf(state.occasion) !== -1; });
    if (state.tune !== 'all') list = list.filter(function (h) { return h.tune === state.tune || h.tune === 'all'; });
    if (state.level !== 'all') list = list.filter(function (h) { return h.level === Number(state.level); });

    /* ترتيب: المستوى ثم التسلسل */
    list.sort(function (a, b) { return (a.level - b.level) || (a.sequence - b.sequence); });

    var html = '';

    html += UI.card(
      '<h2>🎵 مكتبة الألحان</h2>' +
      '<p class="small muted">' + Util.esc(Util.arNum(Hymns.count)) + ' لحنًا موزّعة على 9 مناسبات و3 نغمات و3 مستويات حفظ. ' +
      Hymns.needsReview() + ' عنصرًا معلَّمًا للمراجعة مع مرتل.</p>' +
      '<div class="field"><label for="hymnSearch">ابحث في الألحان</label>' +
      UI.input('hymnSearch', state.q, { placeholder: 'اكتب: أجيوس، واطس، كيهك، رشومة…', maxlength: window.APP.LIMITS.SEARCH }) + '</div>');

    /* فلاتر المستوى */
    html += '<div class="card tight"><h3 class="small">مستوى الحفظ</h3>' +
      UI.chips([
        { id: 'all', label: 'الكل', icon: '🎼' },
        { id: 1, label: 'مبتدئ', icon: '🟢' },
        { id: 2, label: 'متوسط', icon: '🟡' },
        { id: 3, label: 'متقدّم', icon: '🔴' }
      ], state.level, 'data-hlevel') + '</div>';

    /* فلاتر المناسبات */
    html += '<div class="card tight"><h3 class="small">المناسبة</h3>' +
      UI.chips([{ id: 'all', label: 'كل المناسبات', icon: '📅' }].concat(Hymns.occasions().map(function (o) {
        return { id: o.id, label: o.label, icon: o.icon };
      })), state.occasion, 'data-hocc') + '</div>';

    /* فلاتر النغمات */
    html += '<div class="card tight"><h3 class="small">النغمة</h3>' +
      UI.chips([{ id: 'all', label: 'كل النغمات', icon: '🎼' }].concat(Hymns.tunes().map(function (t) {
        return { id: t.id, label: t.label, icon: '🎵' };
      })), state.tune, 'data-htune') + '</div>';

    if (!list.length) {
      html += UI.card(UI.empty('لا يوجد لحن مطابق للفلاتر الحالية. جرّب توسيع البحث.', '🔍'));
      return html;
    }

    html += '<div class="grid">' + list.map(function (h) {
      return '<a class="tile" href="#/hymns/' + Util.esc(h.id) + '">' +
        '<span class="tile-icon" aria-hidden="true">🎵</span>' +
        '<span class="tile-title">' + Util.esc(h.name) + '</span>' +
        (h.coptic ? '<span class="tile-desc coptic">' + Util.esc(h.coptic) + '</span>' : '') +
        '<span class="tile-desc">' + Util.esc(levelLabel(h.level)) + ' • ' + Util.esc(tuneLabel(h.tune)) +
        (h.needs_review ? ' • 📝' : '') + '</span></a>';
    }).join('') + '</div>';

    return html;
  }

  /* ==================== حسب المناسبة ==================== */
  function occasionView() {
    var html = '<h2>📅 الألحان حسب المناسبة</h2>';
    Hymns.occasions().forEach(function (o) {
      var list = Hymns.byOccasion(o.id);
      if (!list.length) return;
      html += UI.card(
        '<h3>' + Util.esc(o.icon + ' ' + o.label) + ' <span class="badge">' + Util.esc(Util.arNum(list.length)) + '</span></h3>' +
        '<ul class="item-list">' + list.map(function (h) {
          return '<li><a class="item-title" href="#/hymns/' + Util.esc(h.id) + '">' + Util.esc(h.name) + '</a>' +
            (h.coptic ? ' <span class="coptic muted small">' + Util.esc(h.coptic) + '</span>' : '') +
            '<div class="item-meta">' + Util.esc(levelLabel(h.level)) + ' • ' + Util.esc(tuneLabel(h.tune)) +
            (h.sequence ? ' • الترتيب في الرتبة: ' + Util.esc(Util.arNum(h.sequence)) : '') + '</div></li>';
        }).join('') + '</ul>');
    });
    return html;
  }

  /* ==================== النغمات الثلاث ==================== */
  function tunesView() {
    var html = '<h2>🎼 النغمات الثلاث (قلب الحفظ)</h2>' +
      UI.card('<p>الألحان القبطية ليست نغمة واحدة، بل ثلاث عائلات؛ ومعرفة النغمة شرط أساسي لأداء اللحن بشكل صحيح:</p>' +
        '<ul class="plain-list">' +
        Hymns.tunes().map(function (t) {
          return '<li><b>' + Util.esc(t.label) + '</b><br><span class="small muted">' + Util.esc(t.desc) + '</span></li>';
        }).join('') +
        '</ul>');

    Hymns.tunes().forEach(function (t) {
      var list = Hymns.all().filter(function (h) { return h.tune === t.id; });
      html += UI.card('<h3>' + Util.esc(t.label) + '</h3><p class="small muted">' + Util.esc(t.desc) + '</p>' +
        (list.length ? '<div class="grid">' + list.map(function (h) {
          return UI.tile('🎵', h.name, (h.coptic || '') + ' • ' + levelLabel(h.level), '#/hymns/' + h.id);
        }).join('') + '</div>' : '<p class="muted small">لا لحن مخصّص لهذه النغمة حاليًا — بقية الألحان تُؤدّى حسب المناسبة.</p>'));
    });
    return html;
  }

  /* ==================== رتبة القداس ==================== */
  function orderView() {
    var steps = Hymns.liturgyOrder();
    var html = UI.card('<h2>📖 رتبة القداس الإلهي</h2>' +
      '<p class="small muted">عشر خطوات من صلاة الشكر إلى الختام. هذه خريطة تعليمية للخادم المبتدئ — والتفاصيل الطقسية تُراجع مع كتاب طقسي مطبوع.</p>');

    html += '<ol class="plain-list" style="counter-reset:none">';
    steps.forEach(function (s) {
      var related = Hymns.all().filter(function (h) { return h.sequence === s.step; });
      html += '<li style="border:none;padding:10px 0">';
      html += '<div class="card tight hymn-card">' +
        '<b>' + Util.esc(Util.arNum(s.step) + '. ' + s.name) + '</b>' +
        (s.coptic ? ' <span class="coptic">' + Util.esc(s.coptic) + '</span>' : '') +
        '<div class="item-meta">' + Util.esc(s.note) + '</div>' +
        '<div class="hymn-meta">' + UI.badge('النغمة: ' + tuneLabel(s.tune), 'acc') +
        (related.length ? related.map(function (h) { return '<a class="badge gold" href="#/hymns/' + Util.esc(h.id) + '">🎵 ' + Util.esc(h.name) + '</a>'; }).join('') : '') +
        '</div></div></li>';
    });
    html += '</ol>';

    html += UI.card('<h3>💡 نصيحة عملية</h3><p>لا تحفظ الرتبة ككتلة واحدة. احفظ الألحان نفسها أولًا، ثم اربط كل لحن بموضعه في الرتبة. المرتل الجيد يحفظ «الترتيب» قبل «الحن».</p>');

    return html;
  }

  /* ==================== خطوات الحفظ ==================== */
  function learnView() {
    var steps = Hymns.learnSteps();
    var html = UI.card('<h2>🧠 كيف تحفظ لحنًا؟ (7 خطوات)</h2>' +
      '<p class="small muted">هذه منهجية داخلية للمشروع لتعلّم الألحان بأمانة — بلا سرعة وبلا تخمين.</p>');

    html += UI.card('<div class="grid">' + steps.map(function (s) {
      return '<div class="tile"><span class="tile-icon">' + Util.esc(Util.arNum(s.n)) + '️⃣</span>' +
        '<span class="tile-title">' + Util.esc(s.t) + '</span>' +
        '<span class="tile-desc">' + Util.esc(s.d) + '</span></div>';
    }).join('') + '</div>');

    html += UI.card('<h3>⚠️ قواعد الأمانة في الحفظ</h3><ul class="plain-list">' +
      '<li>لا تحفظ من مصدر مجهول — ارجع للمرتل أو كتاب طقسي معتمد.</li>' +
      '<li>اللحن يُحفظ بالنغمة لا بالكلمات فقط.</li>' +
      '<li>أي كلمة غير متأكد منها: اسأل، ولا تُعلّمها لغيرك.</li>' +
      '<li>الرشومة تُحفظ مع ردّ الجماعة، لأنها حوار لا مونولوج.</li>' +
      '</ul>' +
      '<div class="btn-row"><a class="btn gold" href="#/games/hymn">🎵 تدرّب: وصّل اللحن</a>' +
      '<a class="btn ghost" href="#/games/memory">🧠 لعبة الذاكرة</a></div>');

    return html;
  }

  /* ==================== تفاصيل لحن ==================== */
  function detailView(id) {
    var h = Hymns.byId(id);
    if (!h) {
      return UI.card('<h2>اللحن غير موجود</h2><p><a class="btn" href="#/hymns">رجوع لمكتبة الألحان</a></p>');
    }
    Store.bump('hymnSessions');
    Store.interest('hymns');
    Store.checkBadges();
    if (window.Analytics) Analytics.track('hymn_view', h.id);

    var html = '';
    html += UI.card(
      '<div class="btn-row" style="margin-bottom:8px"><a class="btn ghost sm" href="#/hymns">⬅️ كل الألحان</a></div>' +
      '<h2>🎵 ' + Util.esc(h.name) + '</h2>' +
      (h.coptic ? '<p class="coptic" style="font-size:1.3rem">⸢ ' + Util.esc(h.coptic) + ' ⸥</p>' : '') +
      (h.translit ? '<p class="muted small">نطق: ' + Util.esc(h.translit) + '</p>' : '') +
      '<div class="hymn-meta">' +
      UI.badge(levelLabel(h.level), h.level === 1 ? 'good' : h.level === 2 ? 'warn' : 'bad') +
      UI.badge('النغمة: ' + tuneLabel(h.tune), 'acc') +
      (h.sequence ? UI.badge('الموضع في الرتبة: ' + Util.arNum(h.sequence), 'gold') : '') +
      (h.needs_review ? UI.badge('📝 يحتاج مراجعة مرتل', 'warn') : UI.badge('✅ مراجَع في المصادر', 'good')) +
      '</div>', 'hymn-card');

    /* المناسبات */
    if ((h.occasion || []).length) {
      html += UI.card('<h3>📅 المناسبة</h3><div class="occasion-row">' +
        h.occasion.map(function (o) { return '<a class="badge gold" href="#/hymns?occasion=' + Util.esc(o) + '">' + Util.esc(occLabel(o)) + '</a>'; }).join('') +
        '</div>');
    }

    /* النص القبطي المتداول */
    if (h.incipit) {
      html += UI.card('<h3>📜 المطلع (مقتطف قصير)</h3><div class="hymn-body coptic">' + Util.esc(h.incipit) + '</div>' +
        '<p class="small muted" style="margin-top:8px">مقتطف قصير للتعريف باللحن. النص الكامل يُقرأ من الأبصلمودية/الكتاب الطقسي المعتمد.</p>');
    }

    /* المعنى والملاحظة */
    html += UI.card('<h3>💡 المعنى</h3><p>' + Util.esc(h.meaning) + '</p>' +
      (h.note ? '<div class="explain"><b>ملاحظة عملية:</b> ' + Util.esc(h.note) + '</div>' : ''));

    /* خطوات الحفظ */
    if ((h.learn || []).length) {
      html += UI.card('<h3>🧠 خطوات حفظ هذا اللحن</h3><ol class="plain-list" style="list-style:decimal;padding-inline-start:22px">' +
        h.learn.map(function (s) { return '<li>' + Util.esc(s) + '</li>'; }).join('') + '</ol>');
    }

    /* المصدر */
    html += UI.card('<h3>🔗 المصدر</h3><p>' + UI.sourceLink(h.source_id) + '</p>' +
      '<p class="small muted">المصادر تُستخدم للاستناد والتحقّق. لا نعرض محتوى المصدر أو ننسخه.</p>');

    /* تنقّل بين الألحان */
    var all = Hymns.all().slice().sort(function (a, b) { return (a.level - b.level) || (a.sequence - b.sequence); });
    var idx = all.map(function (x) { return x.id; }).indexOf(h.id);
    var prev = idx > 0 ? all[idx - 1] : null;
    var next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
    html += UI.card('<div class="btn-row">' +
      (prev ? '<a class="btn ghost sm" href="#/hymns/' + Util.esc(prev.id) + '">⬅️ ' + Util.esc(prev.name) + '</a>' : '') +
      (next ? '<a class="btn sm" href="#/hymns/' + Util.esc(next.id) + '">' + Util.esc(next.name) + ' ➡️</a>' : '') +
      '<a class="btn gold sm" href="#/quiz/lobby?mode=hymn">🎮 اختبر نفسك في الألحان</a>' +
      '</div>');

    return html;
  }

  /* ==================== الصفحة ==================== */
  function render(main, route) {
    /* تفاصيل لحن: #/hymns/<id> */
    if (route.sub) { main.innerHTML = detailView(route.sub); return; }

    /* فلتر من الرابط */
    if (route.params && route.params.occasion) { state.tab = 'occasions'; state.occasion = route.params.occasion; }
    if (route.params && route.params.tune) { state.tab = 'tunes'; state.tune = route.params.tune; }

    var tabs = [
      { id: 'all', label: '🎵 كل الألحان' },
      { id: 'occasions', label: '📅 حسب المناسبة' },
      { id: 'tunes', label: '🎼 النغمات' },
      { id: 'order', label: '📖 رتبة القداس' },
      { id: 'learn', label: '🧠 خطوات الحفظ' }
    ];

    var body;
    if (state.tab === 'occasions') body = occasionView();
    else if (state.tab === 'tunes') body = tunesView();
    else if (state.tab === 'order') body = orderView();
    else if (state.tab === 'learn') body = learnView();
    else body = listView();

    main.innerHTML = UI.tabs(tabs, state.tab, 'data-htab') + body;

    /* الأحداث */
    main.querySelectorAll('[data-htab]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.tab = b.getAttribute('data-htab');
        Router.render();
      });
    });
    var q = document.getElementById('hymnSearch');
    if (q) {
      q.addEventListener('input', Util.debounce(function () {
        state.q = Util.clampText(q.value, window.APP.LIMITS.SEARCH);
        var bodyEl = main.querySelector('.grid') || main.lastElementChild;
        var pos = q.selectionStart;
        Router.render();
        var nq = document.getElementById('hymnSearch');
        if (nq) { nq.focus(); try { nq.setSelectionRange(pos, pos); } catch (e) { } }
      }, 260));
    }
    main.querySelectorAll('[data-hlevel]').forEach(function (b) {
      b.addEventListener('click', function () { state.level = b.getAttribute('data-hlevel'); Router.render(); });
    });
    main.querySelectorAll('[data-hocc]').forEach(function (b) {
      b.addEventListener('click', function () { state.occasion = b.getAttribute('data-hocc'); Router.render(); });
    });
    main.querySelectorAll('[data-htune]').forEach(function (b) {
      b.addEventListener('click', function () { state.tune = b.getAttribute('data-htune'); Router.render(); });
    });
  }

  Router.define('hymns', { render: render });
})();
