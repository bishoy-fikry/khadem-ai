/* ============================================================
   views/coptic.js — اللغة القبطية
   تبويبات: الحروف | الأرقام | المصطلحات | تدريب | قواعد النطق
   ============================================================ */
(function () {
  'use strict';

  var state = { tab: 'letters', q: '', trainIndex: 0 };

  function lettersView() {
    var list = Coptic.letters();
    if (state.q) list = list.filter(function (L) {
      return Util.scoreText([L.ch, L.lower, L.name, L.translit, L.sound, L.ex].join(' '), state.q) > 0;
    });

    var html = UI.card('<h2>🔤 الأبجدية القبطية — 32 حرفًا</h2>' +
      '<p class="small muted">24 حرفًا يونانيًا + 7 حروف ديموطيقية + الرقم ⲋ. اضغط أي حرف لتسمع تفاصيله (النطق تقريبي للتدريب).</p>' +
      UI.field('ابحث في الحروف', UI.input('copticSearch', state.q, { placeholder: 'اكتب حرفًا أو اسمه أو نطقه…', maxlength: window.APP.LIMITS.SEARCH })));

    html += '<div class="card tight"><h3 class="small">الأبجدية كاملة</h3><div style="display:flex;flex-wrap:wrap;gap:6px">' +
      Coptic.letters().map(function (L) {
        return '<button type="button" class="letter-btn coptic" data-letter="' + Util.esc(L.ch) + '" title="' + Util.esc(L.name + ' — ' + L.sound) + '">' + Util.esc(L.ch) + '</button>';
      }).join('') + '</div></div>';

    html += '<div class="grid">' + list.map(function (L) {
      return '<div class="tile">' +
        '<span style="font-size:2rem" class="coptic">' + Util.esc(L.ch) + ' ' + Util.esc(L.lower) + '</span>' +
        '<span class="tile-title">' + Util.esc(L.name) + '</span>' +
        '<span class="tile-desc">النطق: ' + Util.esc(L.sound) + ' • نطق لاتيني: ' + Util.esc(L.translit) + '</span>' +
        '<span class="tile-desc">الأصل: ' + Util.esc(L.origin) + (L.ex ? ' • مثال: ' + Util.esc(L.ex) : '') + '</span>' +
        '</div>';
    }).join('') + '</div>';

    return html;
  }

  function numeralsView() {
    var n = Coptic.numerals();
    return UI.card('<h2>🔢 الأرقام القبطية (حساب الجُمّل)</h2>' +
      '<p class="small muted">الأرقام القبطية تُكتب بحروف، ولها قيمة عددية لكل حرف. هذا أساس قراءة الأرقام في المخطوطات (مثال: ϯⲃ = 12).</p>') +
      '<div class="grid">' + n.map(function (x) {
        return '<div class="tile"><span style="font-size:2rem" class="coptic">' + Util.esc(x.ch) + '</span>' +
          '<span class="tile-title">' + Util.esc(Util.arNum(x.v)) + '</span></div>';
      }).join('') + '</div>' +
      UI.card('<h3>💡 مثال تطبيقي</h3><p class="coptic" style="font-size:1.2rem">ⲓⲃ = 12</p><p class="small muted">(Ⲓ = 10 و Ⲃ = 2)</p><div class="btn-row"><a class="btn gold sm" href="#/games/memory">🧠 جرّب لعبة الذاكرة</a><a class="btn ghost sm" href="#/games/word">🔡 فكّ الكلمة</a></div>');
  }

  function wordsView() {
    var list = Coptic.words();
    if (state.q) list = list.filter(function (w) {
      return Util.scoreText([w.coptic, w.translit, w.ar, w.where].join(' '), state.q) > 0;
    });

    var html = UI.card('<h2>📚 المصطلحات الليتورجية</h2>' +
      '<p class="small muted">' + Util.arNum(Coptic.wordCount) + ' مصطلحًا أساسيًا تسمعها فعليًا في القداس والتسبحة — مع المعنى وموضع الاستخدام.</p>' +
      UI.field('ابحث في المصطلحات', UI.input('wordSearch', state.q, { placeholder: 'اكتب: صلاة، الكنيسة، الروح…', maxlength: window.APP.LIMITS.SEARCH })));

    html += '<div class="grid">' + list.map(function (w) {
      return '<div class="tile">' +
        '<span style="font-size:1.5rem" class="coptic">' + Util.esc(w.coptic) + '</span>' +
        '<span class="tile-title">' + Util.esc(w.ar) + (w.key ? ' ⭐' : '') + '</span>' +
        '<span class="tile-desc">نطق: ' + Util.esc(w.translit) + '</span>' +
        '<span class="tile-desc">الاستخدام: ' + Util.esc(w.where) + '</span>' +
        '</div>';
    }).join('') + '</div>';

    html += UI.card('<h3>🔗 العبارات الليتورجية القصيرة</h3>' + UI.itemList(Coptic.phrases().map(function (p) {
      return { title: p.coptic, sub: 'المعنى: ' + Util.esc(p.ar) };
    })));

    return html;
  }

  /* ==================== تدريب تفاعلي ==================== */
  function trainView() {
    var letters = Coptic.letters();
    var idx = state.trainIndex % letters.length;
    var L = letters[idx];
    var options = [L].concat(Util.shuffle(letters.filter(function (x) { return x.i !== L.i; })).slice(0, 3));

    var html = UI.card('<h2>🎯 تدريب: ما نطق هذا الحرف؟</h2>' +
      '<p class="small muted">تدريب سريع على الحروف. كل إجابة صحيحة = 5 نقاط + شعار «قاريء قبطي» بعد 20 حرفًا.</p>' +
      '<div class="center" style="margin:16px 0"><span class="coptic" style="font-size:4rem">' + Util.esc(L.ch) + '</span>' +
      '<div class="muted small">' + Util.esc(L.lower) + '</div></div>');

    html += '<div class="answers">' + Util.shuffle(options).map(function (o) {
      return '<button type="button" class="answer" data-train-answer="' + Util.esc(o.i) + '">' + Util.esc(o.name + ' — ' + o.sound) + '</button>';
    }).join('') + '</div>';

    html += '<div id="trainFeedback" aria-live="polite" style="margin-top:10px"></div>';

    /* بطاقة مراجعة */
    var p = Store.get();
    html += UI.card('<h3>📊 تقدّمك في التدريب</h3>' +
      '<div class="stat-grid">' +
      UI.stat(Util.arNum(p.copticTrained), 'حرفًا تدربت عليه') +
      UI.stat(Util.arNum(p.copticWords), 'مصطلحًا راجعته') +
      '</div>' +
      '<p class="small muted" style="margin-top:8px">النطق المكتوب تقريبي للتدريب. النطق النهائي يُدقَّق مع مرتل متقن (📝 NEEDS_ADMIN_INPUT).</p>', 'warn-card');

    return html;
  }

  /* ==================== قواعد النطق ==================== */
  function rulesView() {
    return UI.card('<h2>🗣 قواعد النطق الأساسية</h2>' +
      '<p class="small muted">مبادئ عامة تساعدك في القراءة — والتدقيق النهائي مع المرتل.</p>' +
      '<ul class="plain-list">' +
      '<li><b>Ⲃ (فيتا):</b> تُلفظ «ب» في أول الكلمة، و«ڤ/و» بين حرفين (ⲣⲱⲙⲓ).</li>' +
      '<li><b>Ⲫ (في):</b> تُلفظ «ف» (ⲫⲓⲱⲧ = الآب).</li>' +
      '<li><b>Ⲯ (إپسي):</b> تُلفظ «پس» (ⲯⲁⲗⲙⲟⲥ = مزمور).</li>' +
      '<li><b>Ϣ (شاي):</b> تُلفظ «ش» (ϣⲗⲏⲗ = صلِّ).</li>' +
      '<li><b>Ϩ (هوري):</b> تُلفظ «هـ» (ϩⲱⲥ = تسبيح).</li>' +
      '<li><b>Ϧ (خاي):</b> «خ» من الحلق (ϧⲉⲛ = في).</li>' +
      '<li><b>Ϫ (جانجا):</b> «ج» (ϫⲟⲉⲓⲥ = رب).</li>' +
      '<li><b>Ϭ (تشيما):</b> «تش» (ϭⲓⲛⲙⲓⲥⲓ = الميلاد).</li>' +
      '<li><b>Ⲑ (ثيتا):</b> «ث» (ⲑⲉⲟⲥ = الله).</li>' +
      '<li><b>Ⲭ (خي):</b> «خ» (ⲭⲣⲓⲥⲧⲟⲥ = المسيح).</li>' +
      '</ul>') +
      UI.card('<h3>⚠️ تنبيه</h3><p>النطق القبطي يختلف بين المدارس (اليوناني/البحيري)، ولذلك نضع كل نطق هنا بوصفه «تقريبيًا للتدريب» حتى يدقّقه مرتل. لا تُعلّم أحدًا نطقًا غير مُدقّق.</p>', 'warn-card') +
      UI.card('<h3>🎮 تدرّب الآن</h3><div class="btn-row"><a class="btn gold" href="#/games/memory">🧠 الذاكرة (حرف ↔ نطق)</a><a class="btn ghost" href="#/games/word">🔡 فكّ الكلمة</a></div>');
  }

  function render(main, route) {
    var tabs = [
      { id: 'letters', label: '🔤 الحروف' },
      { id: 'numerals', label: '🔢 الأرقام' },
      { id: 'words', label: '📚 المصطلحات' },
      { id: 'train', label: '🎯 تدريب' },
      { id: 'rules', label: '🗣 النطق' }
    ];
    var body;
    if (state.tab === 'words') body = wordsView();
    else if (state.tab === 'train') body = trainView();
    else if (state.tab === 'rules') body = rulesView();
    else if (state.tab === 'numerals') body = numeralsView();
    else body = lettersView();

    main.innerHTML = UI.tabs(tabs, state.tab, 'data-ctab') + body;

    main.querySelectorAll('[data-ctab]').forEach(function (b) {
      b.addEventListener('click', function () { state.tab = b.getAttribute('data-ctab'); Router.render(); });
    });

    var s1 = document.getElementById('copticSearch');
    if (s1) s1.addEventListener('input', Util.debounce(function () {
      state.q = Util.clampText(s1.value, window.APP.LIMITS.SEARCH); Router.render();
      var el = document.getElementById('copticSearch'); if (el) el.focus();
    }, 250));
    var s2 = document.getElementById('wordSearch');
    if (s2) s2.addEventListener('input', Util.debounce(function () {
      state.q = Util.clampText(s2.value, window.APP.LIMITS.SEARCH); Router.render();
      var el = document.getElementById('wordSearch'); if (el) el.focus();
    }, 250));

    /* ضغط حرف = معلومة */
    main.querySelectorAll('[data-letter]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ch = b.getAttribute('data-letter');
        var info = Coptic.info(ch);
        if (info) {
          Util.toast(info.ch + ' (' + info.lower + ') — ' + info.name + ': ' + info.sound + ' | مثال: ' + (info.ex || '—'), '', 5000);
          Store.bump('copticTrained');
          Store.interest('language');
          Store.checkBadges();
        }
      });
    });

    /* تدريب */
    main.querySelectorAll('[data-train-answer]').forEach(function (b) {
      b.addEventListener('click', function () {
        var letters = Coptic.letters();
        var idx = state.trainIndex % letters.length;
        var L = letters[idx];
        var chosen = Number(b.getAttribute('data-train-answer'));
        var fb = document.getElementById('trainFeedback');
        var ok = chosen === L.i;
        main.querySelectorAll('[data-train-answer]').forEach(function (x) {
          x.disabled = true;
          if (Number(x.getAttribute('data-train-answer')) === L.i) x.classList.add('correct');
          else if (x === b) x.classList.add('wrong');
        });
        if (ok) {
          Store.bump('copticTrained');
          Store.addXP(5, 'تدريب حرف قبطي');
          Store.interest('language');
          if (fb) fb.innerHTML = '<div class="explain"><b>✅ صحيح!</b> ' + Util.esc(L.ch + ' — ' + L.name + ': ' + L.sound) + (L.ex ? '<br>مثال: ' + Util.esc(L.ex) : '') + '</div>';
        } else {
          if (fb) fb.innerHTML = '<div class="explain"><b>❌ ليس دقيقًا.</b> الحرف ' + Util.esc(L.ch) + ' هو «' + Util.esc(L.name) + '» ويُنطق: ' + Util.esc(L.sound) + '</div>';
        }
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'btn gold'; btn.textContent = 'الحرف التالي ➡️';
        btn.addEventListener('click', function () { state.trainIndex++; Router.render(); });
        if (fb) fb.appendChild(btn);
      });
    });
  }

  Router.define('coptic', { render: render });
})();
