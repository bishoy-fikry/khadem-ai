/* ============================================================
   games/quiz.js — محرك المسابقة (منطق خالص قابل للاختبار)
   • لا يُرسل الإجابة الصحيحة للواجهة قبل إجابة اللاعب (public).
   • احتساب النقاط والسلسلة داخل المحرك لا في الـDOM.
   • بذرة ثابتة لتحدي اليوم / الغرفة.
   ============================================================ */
(function () {
  'use strict';

  var MODES = (window.APP && window.APP.QUIZ_MODES) || [];
  var DIFF = (window.APP && window.APP.DIFFICULTY) || [];

  function diffOf(id) { return DIFF.filter(function (d) { return d.id === id; })[0] || { points: 10, label: 'سهل', icon: '🟢' }; }

  function Quiz(opts) {
    var o = opts || {};
    this.mode = o.mode || 'quick';
    this.category = o.category || 'all';
    this.difficulty = o.difficulty || 'all';
    this.room = (o.room || '').toUpperCase();
    this.player = o.player || 'لاعب';
    this.count = o.count || 10;
    this.timeLimit = this.mode === 'speed' ? 60 : 0;   // ثوانٍ
    this.perQuestion = 0;                                // مؤقت لكل سؤال (0 = لا)
    this.seed = buildSeed(this);
    this.questions = [];
    this.i = -1;
    this.answers = [];
    this.correct = 0;
    this.wrong = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.startedAt = 0;
    this.endedAt = 0;
    this.running = false;
    this._qShownAt = 0;
    this._load();
  }

  function buildSeed(q) {
    if (q.mode === 'daily') return 'daily-' + Util.dayKey();
    if (q.mode === 'multi' && q.room) return 'room-' + q.room + '-' + Util.dayKey();
    return 'rand-' + Math.random().toString(36).slice(2);
  }

  Quiz.prototype._load = function () {
    var pool = Bank.select({
      category: this.category,
      difficulty: this.difficulty,
      mode: this.mode,
      seed: this.seed,
      count: this.count
    });
    this.questions = pool;
  };

  Quiz.prototype.size = function () { return this.questions.length; };

  Quiz.prototype.start = function () {
    this.i = -1; this.answers = []; this.correct = 0; this.wrong = 0;
    this.score = 0; this.streak = 0; this.bestStreak = 0;
    this.startedAt = Date.now(); this.endedAt = 0; this.running = true;
    return this;
  };

  Quiz.prototype.hasMore = function () { return this.running && (this.i + 1) < this.questions.length; };

  /* يُرجع نسخة آمنة من السؤال (بلا الإجابة الصحيحة) */
  Quiz.prototype.next = function () {
    if (!this.hasMore()) { this.finish(); return null; }
    this.i++;
    this._qShownAt = Date.now();
    var pub = Bank.public(this.questions[this.i]);
    return pub;
  };

  Quiz.prototype.current = function () {
    return this.questions[this.i] || null;
  };

  /* الإجابة: تحقّق + احتساب النقاط والسلسلة */
  Quiz.prototype.answer = function (index) {
    var q = this.current();
    if (!q || !this.running) return null;
    var isCorrect = Number(index) === Number(q.correct_index);
    var base = diffOf(q.difficulty).points;
    var elapsed = Date.now() - this._qShownAt;
    var bonus = 0;
    if (isCorrect) {
      if (elapsed < 3000) bonus = Math.round(base * 0.5);
      else if (elapsed < 6000) bonus = Math.round(base * 0.25);
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
      this.correct++;
      this.score += base + bonus;
      Store.interest(q.category);
    } else {
      this.streak = 0;
      this.wrong++;
    }
    var rec = {
      id: q.id, chosen: Number(index), correct_index: q.correct_index, isCorrect: isCorrect,
      base: base, bonus: bonus, elapsed: elapsed, question: q.question, explanation: q.explanation,
      source_id: q.source_id, source_name: (window.Sources ? Sources.nameOf(q.source_id) : ''), category: q.category, difficulty: q.difficulty
    };
    this.answers.push(rec);
    if (!this.hasMore()) this.finish();
    return rec;
  };

  /* رد كامل بعد الإجابة (يشمل الشرح) — يُستخدم بعد أن يجيب اللاعب */
  Quiz.prototype.reveal = function (q) {
    return { correct_index: q.correct_index, explanation: q.explanation, source_id: q.source_id, source_name: (window.Sources ? Sources.nameOf(q.source_id) : '') };
  };

  Quiz.prototype.finish = function () {
    if (!this.running) return this.result();
    this.running = false;
    this.endedAt = Date.now();
    return this.result();
  };

  Quiz.prototype.result = function () {
    var total = this.answers.length || this.questions.length || 1;
    return {
      player: Util.clampText(this.player, window.APP.LIMITS.NICK) || 'لاعب',
      mode: this.mode, category: this.category, difficulty: this.difficulty, room: this.room,
      score: this.score, correct: this.correct, wrong: this.wrong, total: this.answers.length,
      accuracy: Util.pct(this.correct, total),
      bestStreak: this.bestStreak,
      duration_ms: Math.max(0, (this.endedAt || Date.now()) - this.startedAt),
      perfect: this.correct === this.answers.length && this.answers.length >= 5,
      answers: this.answers.slice()
    };
  };

  /* نتيجة اللعبة → XP + إحصائيات + قاعدة البيانات */
  Quiz.prototype.commit = function () {
    var r = this.result();
    var res = Store.addXP(r.score, 'مسابقة ' + modeLabel(r.mode));
    var p = Store.get();
    p.quizzes = Number(p.quizzes || 0) + 1;
    if (r.bestStreak > Number(p.bestStreak || 0)) p.bestStreak = r.bestStreak;
    if (r.perfect) p.perfectRuns = Number(p.perfectRuns || 0) + 1;
    Store.save(p);
    Store.touchDay();
    Store.checkBadges();

    var row = {
      player_name: r.player, game: 'quiz', score: r.score, correct: r.correct, total: r.total,
      mode: r.mode, category: r.category, room: r.room, duration_ms: r.duration_ms, created_at: Date.now()
    };
    if (window.Leaderboard) Leaderboard.submit(row);

    if (window.Analytics) Analytics.track('quiz_end', r.mode + '|' + r.category + '|' + r.score);
    return { result: r, xp: res };
  };

  function modeLabel(id) {
    var m = MODES.filter(function (x) { return x.id === id; })[0];
    return m ? m.label : id;
  }

  /* ---------- اختبار سريع (يُستخدم في tests) ---------- */
  Quiz.selfTest = function () {
    var problems = [];

    /* 1) لا يُكشف correct_index في next() */
    var q = new Quiz({ mode: 'quick', count: 5 }).start();
    var pub = q.next();
    if (!pub) problems.push('next() أعاد null بدون سبب');
    else if (pub.correct_index !== undefined) problems.push('تسريب correct_index في السؤال العام');

    /* 2) احتساب النقاط والسلسلة */
    var z = new Quiz({ mode: 'quick', count: 3 }).start();
    var a = z.next();             // سؤال 1
    var cur = z.current();
    var rec = z.answer(cur.correct_index);
    if (!rec || !rec.isCorrect) problems.push('الإجابة الصحيحة لم تُحسب صحيحة');
    if (z.score < 10) problems.push('النقاط لم تُحتسب');
    if (z.streak !== 1) problems.push('السلسلة لم تزد');
    z.next();
    z.answer((z.current().correct_index + 1) % 4);   // إجابة خاطئة
    if (z.streak !== 0) problems.push('السلسلة لم تُصفَّر بعد الخطأ');

    /* 3) بذرة تحدي اليوم ثابتة */
    var d1 = new Quiz({ mode: 'daily', count: 5 });
    var d2 = new Quiz({ mode: 'daily', count: 5 });
    if (d1.seed !== d2.seed) problems.push('بذرة تحدي اليوم غير ثابتة');
    var s1 = d1.questions.map(function (x) { return x.id; }).join(',');
    var s2 = d2.questions.map(function (x) { return x.id; }).join(',');
    if (s1 !== s2) problems.push('تحدي اليوم لا يعطي نفس الأسئلة');

    /* 4) غرفة بنفس الكود = نفس الأسئلة */
    var r1 = new Quiz({ mode: 'multi', room: 'ABC12', count: 5 });
    var r2 = new Quiz({ mode: 'multi', room: 'ABC12', count: 5 });
    if (r1.seed !== r2.seed) problems.push('بذرة الغرفة غير ثابتة');

    /* 5) وضع الألحان يفلتر التصنيفات */
    var h = new Quiz({ mode: 'hymn', count: 20 });
    var bad = h.questions.filter(function (q) { return q.category !== 'hymns' && q.category !== 'liturgy'; });
    if (bad.length) problems.push('وضع الألحان أخرج أسئلة من تصنيفات أخرى');

    /* 6) لا تكرار للأسئلة */
    var u = new Quiz({ mode: 'quick', count: 50 });
    var ids = u.questions.map(function (x) { return x.id; });
    if (ids.length !== new Set(ids).size) problems.push('تكرار في الأسئلة');

    return problems;
  };

  window.Quiz = Quiz;
})();
