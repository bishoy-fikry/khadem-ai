/* ============================================================
   views/games.js — مركز الألعاب + 4 ألعاب
   #/games · #/games/memory · #/games/word · #/games/hymn · #/games/verse
   (مسابقة الأسئلة في views/quiz.js)
   ============================================================ */
(function () {
  'use strict';

  /* ==================== مركز الألعاب ==================== */
  function hub() {
    var p = Store.get();
    var html = '<section class="hero"><h2>🎮 العب واتعلّم</h2><p>6 ألعاب تعليمية — كل نقاط تتحوّل XP وشعارات. بلا مال، بلا مقامرة، بلا ضغط.</p></section>';

    html += UI.card('<div class="stat-grid">' +
      UI.stat(Util.arNum(p.xp), 'مجموع XP') +
      UI.stat(Util.arNum(p.quizzes), 'مسابقة') +
      UI.stat(Util.arNum(p.bestStreak), 'أطول سلسلة') +
      UI.stat(Util.arNum(Store.badges().length), 'شعاراً') +
      '</div>');

    html += UI.grid((window.APP.GAMES || []).map(function (g) {
      return UI.tile(g.icon, g.label, g.desc, g.path);
    }));

    html += UI.card('<h3>💡 لماذا الألعاب؟</h3><ul class="plain-list">' +
      '<li>التعلّم بالممارسة أثبت وأمتع من الحفظ الجاف.</li>' +
      '<li>شرح بعد كل إجابة = معلومة تثبت في الذاكرة.</li>' +
      '<li>تنافس شريف: بلا مال ولا مقامرة ولا مخاطرة.</li>' +
      '<li>أسماء مستعارة اختيارية — خصوصيتك محفوظة.</li>' +
      '</ul>' +
      '<div class="btn-row"><a class="btn ghost sm" href="#/leaderboard">🏆 المتصدرون</a>' +
      '<a class="btn ghost sm" href="#/library?type=book&q=قواعد">📜 قواعد الألعاب</a></div>');

    return html;
  }

  /* ==================== لعبة الذاكرة ==================== */
  var memState = null;

  function memoryView() {
    if (!memState) {
      memState = GameLogic.memory.build(6, String(Date.now()));
      memState.open = [];
      memState.locked = false;
      memState.matched = {};
    }
    var st = memState;
    var html = UI.card('<h2>🧠 لعبة الذاكرة القبطية</h2>' +
      '<p class="small muted">اقلب البطاقات وطابِق كل حرف قبطي مع نطقه. الأزواج: ' + Util.arNum(st.pairs) + ' • المحاولات: ' + Util.arNum(st.tries) + ' • الأخطاء: ' + Util.arNum(st.wrong) + '</p>' +
      '<div class="btn-row"><button type="button" class="btn ghost sm" id="memRestart">🔄 لعبة جديدة</button></div>');

    html += '<section class="card"><div class="memory-grid" id="memGrid">' + st.cards.map(function (c, i) {
      var isOpen = st.open.indexOf(i) !== -1 || st.matched[i];
      var label = isOpen ? c.face : '✝';
      return '<button type="button" class="mem-card ' + (st.matched[i] ? 'done' : '') + ' ' + (isOpen ? 'flipped' : '') + '" data-mem="' + i + '" aria-label="بطاقة ' + (i + 1) + '">' +
        '<span class="' + (c.kind === 'letter' ? 'coptic' : '') + '">' + Util.esc(label) + '</span></button>';
    }).join('') + '</div>' +
      (st.found === st.pairs ? '<div class="explain" style="margin-top:12px"><b>🎉 أتممت اللعبة!</b> ' + Util.arNum(st.tries) + ' محاولة و ' + Util.arNum(st.wrong) + ' خطأ. اضغط «لعبة جديدة» للمزيد.</div>' : '') +
      '</section>';

    return html;
  }

  function bindMemory(main) {
    var st = memState;
    if (!st) return;
    main.querySelectorAll('[data-mem]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Number(b.getAttribute('data-mem'));
        if (st.locked || st.matched[i] || st.open.indexOf(i) !== -1) return;
        st.open.push(i);
        if (st.open.length === 2) {
          st.tries++;
          var a = st.cards[st.open[0]], b2 = st.cards[st.open[1]];
          if (GameLogic.memory.check(a, b2)) {
            st.matched[st.open[0]] = true; st.matched[st.open[1]] = true;
            st.found++;
            st.open = [];
            if (st.found === st.pairs) {
              Store.bump('memoryWins');
              Store.addXP(30 + Math.max(0, 20 - st.wrong * 2), 'لعبة الذاكرة');
              Store.interest('language');
              Store.checkBadges();
              if (window.Leaderboard) Leaderboard.submit({ player_name: Store.playerName() || 'لاعب', game: 'memory', score: 30 + Math.max(0, 20 - st.wrong * 2), correct: st.pairs, total: st.tries, mode: 'memory', category: 'language', room: '', duration_ms: 0, created_at: Date.now() });
              if (window.Analytics) Analytics.track('game_end', 'memory|' + st.tries);
            }
            Router.render(true);
          } else {
            st.wrong++;
            st.locked = true;
            Router.render(true);
            setTimeout(function () { st.open = []; st.locked = false; Router.render(true); }, 850);
          }
        } else {
          Router.render(true);
        }
      });
    });
    var rs = document.getElementById('memRestart');
    if (rs) rs.addEventListener('click', function () {
      memState = GameLogic.memory.build(6, String(Date.now()));
      memState.open = []; memState.locked = false; memState.matched = {};
      Router.render(true);
    });
  }

  /* ==================== فكّ الكلمة ==================== */
  var wordState = null;

  function wordView() {
    if (!wordState) wordState = GameLogic.word.build(Coptic.guessPool(), String(Date.now()));
    var st = wordState;
    var current = GameLogic.word.current(st);

    var html = UI.card('<h2>🔡 فكّ الكلمة القبطية</h2>' +
      '<p class="small muted">رتّب الحروف لتكوين كلمة قبطية. عدد الحروف: ' + Util.arNum(st.answer.length) + '</p>');

    /* مثال مساعد: نعرض معنى الكلمة للإجابة أولاً */
    var hintWord = Coptic.words().filter(function (w) { return (w.coptic || '').indexOf(st.answer) !== -1 || st.answer.indexOf(w.ar) !== -1; })[0];
    var phrase = Coptic.phrases().filter(function (p) { return p.coptic.indexOf(st.answer) !== -1; })[0];
    var meaningHint = phrase ? 'إرشاد: «' + phrase.ar + '»' : (hintWord ? 'إرشاد: ' + hintWord.ar : 'لا إرشاد متاح لهذه الكلمة');

    html += '<div class="drop-area" id="wordDrop">' + (current ? Util.esc(current.split('').join(' ')) : '<span class="muted">اضغط الحروف بالترتيب…</span>') + '</div>';
    html += '<div class="small muted center">' + Util.esc(meaningHint) + '</div>';

    html += '<div class="letters">' + st.letters.map(function (l, i) {
      if (l === null) return '<span class="letter-btn used" aria-hidden="true">—</span>';
      return '<button type="button" class="letter-btn coptic" data-wletter="' + i + '">' + Util.esc(l) + '</button>';
    }).join('') + '</div>';

    html += UI.card('<div class="btn-row">' +
      '<button type="button" class="btn ghost sm" id="wordUndo">↩️ رجوع</button>' +
      '<button type="button" class="btn ghost sm" id="wordHint">💡 تلميح</button>' +
      '<button type="button" class="btn gold sm" id="wordCheck">✅ تحقّق</button>' +
      '<button type="button" class="btn ghost sm" id="wordNew">🔄 كلمة جديدة</button>' +
      '</div><div id="wordFeedback" aria-live="polite"></div>');

    return html;
  }

  function bindWord(main) {
    var st = wordState;
    if (!st) return;
    main.querySelectorAll('[data-wletter]').forEach(function (b) {
      b.addEventListener('click', function () {
        GameLogic.word.place(st, Number(b.getAttribute('data-wletter')));
        Router.render(true);
      });
    });
    var u = document.getElementById('wordUndo');
    if (u) u.addEventListener('click', function () { GameLogic.word.undo(st); Router.render(true); });

    var h = document.getElementById('wordHint');
    if (h) h.addEventListener('click', function () {
      var fb = document.getElementById('wordFeedback');
      if (fb) fb.innerHTML = '<div class="explain">💡 ' + Util.esc(GameLogic.word.hint(st)) + '</div>';
    });

    var c = document.getElementById('wordCheck');
    if (c) c.addEventListener('click', function () {
      var fb = document.getElementById('wordFeedback');
      if (GameLogic.word.isSolved(st)) {
        Store.bump('wordWins');
        Store.addXP(20, 'فكّ كلمة قبطية');
        Store.interest('language');
        Store.checkBadges();
        if (window.Leaderboard) Leaderboard.submit({ player_name: Store.playerName() || 'لاعب', game: 'word', score: 20, correct: 1, total: 1, mode: 'word', category: 'language', room: '', duration_ms: 0, created_at: Date.now() });
        if (fb) fb.innerHTML = '<div class="explain"><b>✅ صحيح!</b> الكلمة هي «<span class="coptic">' + Util.esc(st.answer) + '</span>» — ' + Util.esc(meaningHintOf(st.answer)) + '</div>';
        if (window.Analytics) Analytics.track('game_end', 'word|ok');
      } else {
        if (fb) fb.innerHTML = '<div class="explain"><b>❌ لم تكتمل بعد.</b> الكلمة الحالية: <span class="coptic">' + Util.esc(GameLogic.word.current(st) || '—') + '</span></div>';
      }
    });

    var n = document.getElementById('wordNew');
    if (n) n.addEventListener('click', function () {
      wordState = GameLogic.word.build(Coptic.guessPool(), String(Date.now()));
      Router.render(true);
    });
  }

  function meaningHintOf(chars) {
    var phrase = Coptic.phrases().filter(function (p) { return p.coptic.indexOf(chars) !== -1; })[0];
    if (phrase) return phrase.ar;
    var w = Coptic.words().filter(function (x) { return (x.coptic || '').indexOf(chars) !== -1; })[0];
    return w ? w.ar : 'معنى غير مسجَّل';
  }

  /* ==================== وصّل اللحن ==================== */
  var hymnState = null;

  function hymnView() {
    if (!hymnState || hymnState.done) {
      var kind = (hymnState && hymnState.kind) || 'occasion';
      hymnState = { kind: kind, rounds: GameLogic.hymn.build(kind, 5, String(Date.now())), i: 0, score: 0, wrong: 0, answered: null, done: false };
    }
    var st = hymnState;
    if (!st.rounds || !st.rounds.length) return UI.card('<h2>لا تتوفر بيانات كافية</h2>');

    var r = st.rounds[st.i];
    var html = UI.card('<h2>🎵 وصّل اللحن' + (st.kind === 'tune' ? ' بنغمته' : ' بمناسبته') + '</h2>' +
      '<p class="small muted">السؤال ' + Util.arNum(st.i + 1) + ' من ' + Util.arNum(st.rounds.length) + ' • النقاط: ' + Util.arNum(st.score) + '</p>' +
      '<div class="chips"><button type="button" class="chip ' + (st.kind === 'occasion' ? 'active' : '') + '" data-hkind="occasion">المناسبة</button>' +
      '<button type="button" class="chip ' + (st.kind === 'tune' ? 'active' : '') + '" data-hkind="tune">النغمة</button></div>');

    html += '<section class="card"><div class="q-text">' + Util.esc(r.prompt) + '</div>' +
      '<p class="small muted">اختر ' + (st.kind === 'tune' ? 'النغمة' : 'المناسبة') + ' الصحيحة:</p>' +
      '<div class="answers">' + r.options.map(function (o, i) {
        var cls = '';
        if (st.answered !== null) {
          if (o === r.correct) cls = 'correct';
          else if (o === st.answered) cls = 'wrong';
        }
        return '<button type="button" class="answer ' + cls + '" data-hanswer="' + Util.esc(o) + '" ' + (st.answered !== null ? 'disabled' : '') + '>' + Util.esc(o) + '</button>';
      }).join('') + '</div>' +
      (st.answered !== null ? '<div class="explain">' + (st.answered === r.correct ? '✅ إجابة صحيحة! ' : '❌ الإجابة الصحيحة: ' + Util.esc(r.correct) + '. ') + '<a href="#/hymns/' + Util.esc(r.hymnId) + '">اقرأ عن اللحن ➡️</a></div>' : '') +
      '</section>';

    html += UI.card('<div class="btn-row">' +
      (st.answered !== null ? '<button type="button" class="btn gold sm" id="hymnNext">' + (st.i + 1 < st.rounds.length ? 'السؤال التالي ➡️' : 'إنهاء 🏁') + '</button>' : '') +
      '<button type="button" class="btn ghost sm" id="hymnRestart">🔄 لعبة جديدة</button>' +
      '</div>');

    return html;
  }

  function bindHymn(main) {
    var st = hymnState;
    if (!st) return;
    main.querySelectorAll('[data-hkind]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-hkind');
        hymnState = { kind: k, rounds: GameLogic.hymn.build(k, 5, String(Date.now())), i: 0, score: 0, wrong: 0, answered: null, done: false };
        Router.render(true);
      });
    });
    main.querySelectorAll('[data-hanswer]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (st.answered !== null) return;
        var r = st.rounds[st.i];
        var val = b.getAttribute('data-hanswer');
        st.answered = val;
        if (val === r.correct) { st.score += 15; Store.addXP(15, 'وصّل اللحن'); Store.interest('hymns'); }
        else st.wrong++;
        Router.render(true);
      });
    });
    var n = document.getElementById('hymnNext');
    if (n) n.addEventListener('click', function () {
      if (st.i + 1 < st.rounds.length) { st.i++; st.answered = null; Router.render(true); }
      else {
        Store.bump('hymnSessions');
        Store.checkBadges();
        if (window.Leaderboard) Leaderboard.submit({ player_name: Store.playerName() || 'لاعب', game: 'hymn', score: st.score, correct: st.rounds.length - st.wrong, total: st.rounds.length, mode: 'hymn', category: 'hymns', room: '', duration_ms: 0, created_at: Date.now() });
        if (window.Analytics) Analytics.track('game_end', 'hymn|' + st.score);
        hymnState.done = true;
        Router.render(true);
      }
    });
    var rs = document.getElementById('hymnRestart');
    if (rs) rs.addEventListener('click', function () {
      hymnState = { kind: st.kind, rounds: GameLogic.hymn.build(st.kind, 5, String(Date.now())), i: 0, score: 0, wrong: 0, answered: null, done: false };
      Router.render(true);
    });
  }

  /* ==================== أكمل الآية ==================== */
  var verseState = null;

  function verseView() {
    if (!verseState) {
      verseState = { rounds: GameLogic.verse.build(6, String(Date.now())), i: 0, score: 0, wrong: 0, answered: null, done: false };
    }
    var st = verseState;
    if (!st.rounds.length) return UI.card('<h2>لا تتوفر آيات كافية</h2>');
    var r = st.rounds[st.i];

    var html = UI.card('<h2>✝️ أكمل الآية</h2>' +
      '<p class="small muted">السؤال ' + Util.arNum(st.i + 1) + ' من ' + Util.arNum(st.rounds.length) + ' • النقاط: ' + Util.arNum(st.score) + '</p>');

    html += '<section class="card"><div class="item-meta">' + Util.esc(r.title) + '</div>' +
      '<div class="q-text">«' + Util.esc(r.head) + '»</div>' +
      '<div class="answers">' + r.options.map(function (o) {
        var cls = '';
        if (st.answered !== null) {
          if (o === r.tail) cls = 'correct';
          else if (o === st.answered) cls = 'wrong';
        }
        return '<button type="button" class="answer ' + cls + '" data-vanswer="' + Util.esc(o) + '" ' + (st.answered !== null ? 'disabled' : '') + '>' + Util.esc(o) + '</button>';
      }).join('') + '</div>' +
      (st.answered !== null ? '<div class="explain">' + (st.answered === r.tail ? '✅ بارك الله! إجابة صحيحة. ' : '❌ التكملة الصحيحة: «' + Util.esc(r.tail) + '». ') + 'المصدر: ' + Util.esc((Sources.byId(r.source) || {}).name || r.source) + '</div>' : '') +
      '</section>';

    html += UI.card('<div class="btn-row">' +
      (st.answered !== null ? '<button type="button" class="btn gold sm" id="verseNext">' + (st.i + 1 < st.rounds.length ? 'الآية التالية ➡️' : 'إنهاء 🏁') + '</button>' : '') +
      '<button type="button" class="btn ghost sm" id="verseRestart">🔄 لعبة جديدة</button>' +
      '</div>');

    return html;
  }

  function bindVerse(main) {
    var st = verseState;
    if (!st) return;
    main.querySelectorAll('[data-vanswer]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (st.answered !== null) return;
        var r = st.rounds[st.i];
        var val = b.getAttribute('data-vanswer');
        st.answered = val;
        if (val === r.tail) {
          st.score += 12;
          Store.bump('verseWins');
          Store.addXP(12, 'أكمل الآية');
          Store.interest('bible');
          Store.checkBadges();
        } else st.wrong++;
        Router.render(true);
      });
    });
    var n = document.getElementById('verseNext');
    if (n) n.addEventListener('click', function () {
      if (st.i + 1 < st.rounds.length) { st.i++; st.answered = null; Router.render(true); }
      else {
        if (window.Leaderboard) Leaderboard.submit({ player_name: Store.playerName() || 'لاعب', game: 'verse', score: st.score, correct: st.rounds.length - st.wrong, total: st.rounds.length, mode: 'verse', category: 'bible', room: '', duration_ms: 0, created_at: Date.now() });
        if (window.Analytics) Analytics.track('game_end', 'verse|' + st.score);
        verseState.done = true;
        Router.render(true);
      }
    });
    var rs = document.getElementById('verseRestart');
    if (rs) rs.addEventListener('click', function () {
      verseState = { rounds: GameLogic.verse.build(6, String(Date.now())), i: 0, score: 0, wrong: 0, answered: null, done: false };
      Router.render(true);
    });
  }

  /* ==================== الراوتر ==================== */
  function render(main, route) {
    var sub = route.sub || '';
    if (sub === 'memory') { main.innerHTML = memoryView(); bindMemory(main); return; }
    if (sub === 'word') { main.innerHTML = wordView(); bindWord(main); return; }
    if (sub === 'hymn') { main.innerHTML = hymnView(); bindHymn(main); return; }
    if (sub === 'verse') { main.innerHTML = verseView(); bindVerse(main); return; }
    if (sub === 'quiz') { return; }   /* تتعامل معها views/quiz.js */
    main.innerHTML = hub();
  }

  Router.define('games', { render: render });
})();
