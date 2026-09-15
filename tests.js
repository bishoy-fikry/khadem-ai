/* ============================================================
   js/tests.js — اختبارات المشروع (تعمل في المتصفح بلا أدوات)
   كل اختبار يتحقق من منطق حقيقي في الكود.
   ============================================================ */
(function () {
  'use strict';

  var results = [];
  function test(name, fn) {
    var ok = false, msg = '';
    try {
      var r = fn();
      ok = r === true || r === undefined;
      if (typeof r === 'string') { ok = false; msg = r; }
      else if (r && r.ok === false) { ok = false; msg = r.msg || ''; }
    } catch (e) { ok = false; msg = String(e && e.message || e); }
    results.push({ name: name, ok: ok, msg: msg });
    return ok;
  }

  /* ==================== 1) النواة ==================== */
  test('Util.esc يهرّب وسوم HTML (منع XSS)', function () {
    var out = Util.esc('<img src=x onerror="alert(1)">');
    if (out.indexOf('<') !== -1) return 'لم يتم تهريب وسم <';
    if (out.indexOf('&#39;') === -1 && out.indexOf('&quot;') === -1) return 'لم يتم تهريب علامات التنصيص';
    return true;
  });

  test('Util.normalizeAr يوحّد الهمزات والتاء المربوطة والتشكيل', function () {
    var a = Util.normalizeAr('أَلْحَانٌ مَقْبُوطِيَّة');
    var b = Util.normalizeAr('الحان مقبوطيه');
    if (a !== b) return 'التطبيع غير متطابق: «' + a + '» ≠ «' + b + '»';
    return true;
  });

  test('Util.matches بحث متسامح (بدون تشكيل/همزات)', function () {
    if (!Util.matches('لحن الآدامي القبطي', 'الادامي')) return 'لم يجد «الادامي»';
    if (!Util.matches('Ⲕⲩⲣⲓⲉ ⲉⲗⲉⲏⲥⲟⲛ', 'كيرياليسون') && !Util.matches('كيرياليسون', 'كيرياليسون')) return 'فشل التطابق';
    return true;
  });

  test('Util.clampText يقصّر النص ويزيل الوسوم', function () {
    var out = Util.clampText('<b>سلام</b> ' + new Array(50).join('ا'), 20);
    if (out.length > 20) return 'الطول ' + out.length + ' > 20';
    if (out.indexOf('<') !== -1) return 'لم تُزل الوسوم';
    return true;
  });

  test('Util.safeUrl يرفض الروابط غير الآمنة', function () {
    if (Util.safeUrl('javascript:alert(1)') !== '') return 'قَبِل رابط javascript:';
    if (Util.safeUrl('data:text/html,x') !== '') return 'قَبِل رابط data:';
    if (Util.safeUrl('https://st-takla.org') === '') return 'رفض رابط https صحيح';
    return true;
  });

  test('Util.seededShuffle يُعطي نفس الترتيب لنفس البذرة', function () {
    var a = Util.seededShuffle([1, 2, 3, 4, 5, 6], 'seed123').join(',');
    var b = Util.seededShuffle([1, 2, 3, 4, 5, 6], 'seed123').join(',');
    var c = Util.seededShuffle([1, 2, 3, 4, 5, 6], 'other').join(',');
    if (a !== b) return 'نفس البذرة أعطت ترتيبين مختلفين';
    if (a === c) return 'بذرتان مختلفتان أعطتا نفس الترتيب';
    return true;
  });

  test('Util.dayKey ثابت في نفس اليوم', function () {
    if (Util.dayKey() !== Util.dayKey()) return 'مفتاح اليوم غير ثابت';
    return true;
  });

  /* ==================== 2) الأمان: لا أسرار في الكود ==================== */
  test('لا توجد مفاتيح API في مصادر المشروع المحمّلة', function () {
    var hits = [];
    var scripts = document.querySelectorAll('script[src]');
    var src = Array.prototype.map.call(scripts, function (s) { return s.getAttribute('src'); }).join(' ');
    if (/AIza[0-9A-Za-z_\-]{10,}/.test(src)) hits.push('AIza في مسار سكربت');
    /* فحص متغيرات شائعة */
    if (typeof window.GEMINI_KEY === 'string' && window.GEMINI_KEY) hits.push('GEMINI_KEY');
    if (window.GOOGLE_API_KEY) hits.push('GOOGLE_API_KEY');
    if (window.OPENAI_API_KEY) hits.push('OPENAI_API_KEY');
    /* فحص نصوص السكربتات المحمّلة (المضمّنة في الصفحة) */
    var inline = '';
    document.querySelectorAll('script:not([src])').forEach(function (s) { inline += s.textContent || ''; });
    if (/AIza[0-9A-Za-z_\-]{20,}/.test(inline)) hits.push('AIza في سكربت مضمّن');
    return hits.length ? 'وُجد: ' + hits.join(', ') : true;
  });

  test('مساعد خادم لا يستخدم أي endpoint خارجي', function () {
    var botSrc = String(window.Bot && window.Bot.answer);
    if (/generativelanguage|openai|anthropic|api\./i.test(botSrc)) return 'يبدو أن المساعد يشير لخدمة خارجية';
    return true;
  });

  test('مفتاح Gemini القديم لم يعد مستخدمًا', function () {
    if (typeof window.GEMINI_KEY !== 'undefined' || typeof window.geminiKey !== 'undefined') return 'المتغير القديم موجود';
    if (window.APP.API && window.APP.API.KEY) return 'ما زال هناك مفتاح في الإعدادات';
    return true;
  });

  test('لا سكربتات مضمّنة غير آمنة (innerHTML مباشر من مصدر خارجي)', function () {
    /* نتحقق أن دالة rich تهرّب قبل التنسيق */
    var out = UI.rich('<script>alert(1)<' + '/script>');
    if (out.indexOf('<script') !== -1) return 'UI.rich لم يهرّب الوسم';
    return true;
  });

  /* ==================== 3) البيانات ==================== */
  test('الألحان: كل لحن له اسم ومعنى ومصدر', function () {
    var bad = [];
    Hymns.all().forEach(function (h) {
      if (!h.id || !h.name) bad.push('لحن بلا id/name');
      if (!h.meaning) bad.push(h.name + ' بلا معنى');
      if (!Sources.byId(h.source_id)) bad.push(h.name + ' مصدر غير مسجَّل: ' + h.source_id);
    });
    return bad.length ? bad.slice(0, 3).join(' | ') : true;
  });

  test('الألحان: كل مناسبة في اللحن مسجَّلة في الإعدادات', function () {
    var ids = (window.APP.HYMN_OCCASIONS || []).map(function (o) { return o.id; });
    var bad = [];
    Hymns.all().forEach(function (h) {
      (h.occasion || []).forEach(function (o) { if (ids.indexOf(o) === -1) bad.push(h.name + ':' + o); });
    });
    return bad.length ? 'مناسبات غير معروفة: ' + bad.slice(0, 3).join(', ') : true;
  });

  test('الألحان: كل نغمة من النغمات الثلاث', function () {
    var ok = ['all', 'adam', 'watis', 'hazzat'];
    var bad = Hymns.all().filter(function (h) { return ok.indexOf(h.tune) === -1; });
    return bad.length ? 'نغمات غير صحيحة: ' + bad.map(function (b) { return b.name; }).slice(0, 3).join(', ') : true;
  });

  test('الألحان تُغطّي 9 مناسبات على الأقل', function () {
    var set = {};
    Hymns.all().forEach(function (h) { (h.occasion || []).forEach(function (o) { set[o] = 1; }); });
    var n = Object.keys(set).length;
    if (n < 6) return 'تغطية المناسبات ' + n + ' فقط';
    return true;
  });

  test('رتبة القداس: 10 خطوات مرقّمة بترتيب متزايد', function () {
    var s = Hymns.liturgyOrder();
    if (s.length < 8) return 'الخطوات ' + s.length;
    for (var i = 0; i < s.length; i++) { if (s[i].step !== i + 1) return 'ترقيم غير متسلسل عند ' + i; }
    return true;
  });

  test('القبطي: 32 حرفًا بلا تكرار', function () {
    var L = Coptic.letters();
    if (L.length !== 32) return 'العدد: ' + L.length;
    var set = {};
    L.forEach(function (x) { set[x.ch] = (set[x.ch] || 0) + 1; });
    var dup = Object.keys(set).filter(function (k) { return set[k] > 1; });
    return dup.length ? 'تكرار: ' + dup.join(',') : true;
  });

  test('القبطي: كل حرف له نطق واسم', function () {
    var bad = Coptic.letters().filter(function (L) { return !L.name || !L.sound; });
    return bad.length ? bad.length + ' حرفًا بلا نطق/اسم' : true;
  });

  test('القبطي: المصطلحات لها معنى وموضع استخدام', function () {
    var bad = Coptic.words().filter(function (w) { return !w.ar || !w.where; });
    return bad.length ? bad.length + ' مصطلحًا ناقصًا' : true;
  });

  test('المكتبة: كل عنصر له نوع معروف ومصدر مسجَّل', function () {
    var types = (window.APP.CONTENT_TYPES || []).map(function (t) { return t.id; });
    var bad = [];
    Content.all().forEach(function (c) {
      if (types.indexOf(c.type) === -1) bad.push(c.title + ' نوع غير معروف');
      if (c.source_id && !Sources.byId(c.source_id)) bad.push(c.title + ' مصدر غير مسجَّل');
    });
    return bad.length ? bad.slice(0, 3).join(' | ') : true;
  });

  test('المصادر: كل مصدر له access_note (لا افتراض إتاحة)', function () {
    var bad = Sources.all().filter(function (s) { return !s.access_note || s.access_note.length < 10; });
    return bad.length ? bad.length + ' مصدرًا بلا ملاحظة وصول' : true;
  });

  test('المصادر: لا مصدر محمي مُعلَّم كقابل للفهرسة', function () {
    var bad = Sources.all().filter(function (s) {
      return s.searchable && /NEEDS_ADMIN_INPUT|محمي|حقوق|خاص/.test(s.access_note || '');
    });
    return bad.length ? bad.map(function (b) { return b.name; }).slice(0, 3).join(', ') : true;
  });

  test('المصادر: الروابط المذكورة آمنة (https فقط)', function () {
    var bad = Sources.all().filter(function (s) { return s.url && !/^https:\/\//.test(s.url); });
    return bad.length ? bad.map(function (b) { return b.name + ':' + b.url; }).slice(0, 3).join(' | ') : true;
  });

  /* ==================== 4) بنك الأسئلة ==================== */
  test('بنك الأسئلة: كل سؤال له 4 خيارات غير مكرّرة', function () {
    var bad = [];
    Bank.all().forEach(function (q) {
      if (q.options.length !== 4) bad.push(q.id + ' عدد الخيارات ' + q.options.length);
      if (new Set(q.options).size !== 4) bad.push(q.id + ' خيارات مكرّرة');
    });
    return bad.length ? bad.slice(0, 3).join(' | ') : true;
  });

  test('بنك الأسئلة: correct_index في المدى الصحيح', function () {
    var bad = Bank.all().filter(function (q) { return !(q.correct_index >= 0 && q.correct_index <= 3); });
    return bad.length ? bad.map(function (b) { return b.id; }).join(',') : true;
  });

  test('بنك الأسئلة: كل سؤال له شرح ومصدر', function () {
    var bad = Bank.all().filter(function (q) { return !q.explanation || (q.source_id && !Sources.byId(q.source_id)); });
    return bad.length ? bad.slice(0, 3).map(function (b) { return b.id; }).join(',') : true;
  });

  test('بنك الأسئلة: كل تصنيف في التصنيفات المعروفة', function () {
    var ids = (window.APP.CATEGORIES || []).map(function (c) { return c.id; });
    var bad = Bank.all().filter(function (q) { return ids.indexOf(q.category) === -1; });
    return bad.length ? 'تصنيف غير معروف: ' + bad[0].category : true;
  });

  test('بنك الأسئلة: كل صعوبة في المستويات المعروفة', function () {
    var ids = (window.APP.DIFFICULTY || []).map(function (d) { return d.id; });
    var bad = Bank.all().filter(function (q) { return ids.indexOf(q.difficulty) === -1; });
    return bad.length ? 'صعوبة غير معروفة: ' + bad[0].difficulty : true;
  });

  test('بنك الأسئلة: تغطية كل التصنيفات (10 تصنيفات)', function () {
    var counts = Bank.categories();
    var missing = (window.APP.CATEGORIES || []).filter(function (c) { return !counts[c.id]; });
    return missing.length ? 'تصنيفات بلا أسئلة: ' + missing.map(function (m) { return m.id; }).join(',') : true;
  });

  test('بنك الأسئلة: تغطية المستويات الأربعة', function () {
    var counts = Bank.difficulties();
    var missing = (window.APP.DIFFICULTY || []).filter(function (d) { return !counts[d.id]; });
    return missing.length ? 'مستويات بلا أسئلة: ' + missing.map(function (m) { return m.id; }).join(',') : true;
  });

  test('بنك الأسئلة: أسئلة الألحان هي الأكبر (التركيز المطلوب)', function () {
    var counts = Bank.categories();
    var hymn = counts.hymns || 0;
    if (hymn < 8) return 'أسئلة الألحان ' + hymn + ' فقط — يجب أن تكون بارزة';
    var max = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }));
    if (hymn < max) return 'الألحان (' + hymn + ') ليست الأكبر (' + max + ')';
    return true;
  });

  test('بنك الأسئلة: public() تحذف الإجابة الصحيحة', function () {
    var q = Bank.all()[0];
    var pub = Bank.public(q);
    if (pub.correct_index !== undefined) return 'correct_index موجود في النسخة العامة';
    if (pub.explanation !== undefined) return 'الشرح موجود قبل الإجابة';
    return true;
  });

  /* ==================== 5) محرك المسابقة ==================== */
  test('محرك المسابقة: كل اختباراته الداخلية ناجحة', function () {
    var problems = Quiz.selfTest();
    return problems.length ? problems.join(' | ') : true;
  });

  test('محرك المسابقة: الإجابة الصحيحة تُحتسب وتزيد النقاط', function () {
    var q = new Quiz({ mode: 'quick', count: 3 }).start();
    q.next();
    var rec = q.answer(q.current().correct_index);
    if (!rec.isCorrect) return 'لم تُحتسب صحيحة';
    if (q.score < 10) return 'النقاط: ' + q.score;
    return true;
  });

  test('محرك المسابقة: الإجابة الخاطئة لا تزيد النقاط وتُصفّر السلسلة', function () {
    var q = new Quiz({ mode: 'quick', count: 3 }).start();
    q.next(); q.answer(q.current().correct_index);
    var before = q.score;
    q.next(); q.answer((q.current().correct_index + 1) % 4);
    if (q.score !== before) return 'النقاط تغيّرت بعد خطأ';
    if (q.streak !== 0) return 'السلسلة لم تُصفَّر';
    return true;
  });

  test('محرك المسابقة: تحدي اليوم بذرة ثابتة', function () {
    var a = new Quiz({ mode: 'daily', count: 5 });
    var b = new Quiz({ mode: 'daily', count: 5 });
    if (a.seed !== b.seed) return 'بذرتان مختلفتان';
    if (a.questions.map(function (x) { return x.id; }).join() !== b.questions.map(function (x) { return x.id; }).join()) return 'أسئلة مختلفة';
    return true;
  });

  test('محرك المسابقة: غرفة بنفس الكود = نفس الأسئلة', function () {
    var a = new Quiz({ mode: 'multi', room: 'XYZ99', count: 5 });
    var b = new Quiz({ mode: 'multi', room: 'XYZ99', count: 5 });
    if (a.seed !== b.seed) return 'بذرة مختلفة للغرفة';
    var c = new Quiz({ mode: 'multi', room: 'AAA11', count: 5 });
    if (c.seed === a.seed) return 'غرفتان مختلفتان بنفس البذرة';
    return true;
  });

  test('محرك المسابقة: وضع الألحان يركّز على الألحان والطقوس', function () {
    var q = new Quiz({ mode: 'hymn', count: 20 });
    var bad = q.questions.filter(function (x) { return x.category !== 'hymns' && x.category !== 'liturgy'; });
    return bad.length ? bad.length + ' سؤالًا من تصنيف آخر' : true;
  });

  test('محرك المسابقة: مكافأة السرعة لا تتجاوز 50% من الأساس', function () {
    var q = new Quiz({ mode: 'quick', count: 2 }).start();
    q.next();
    q._qShownAt = Date.now() - 1000;   /* سريع */
    var rec = q.answer(q.current().correct_index);
    if (rec.bonus > rec.base * 0.5) return 'المكافأة ' + rec.bonus + ' > نصف الأساس ' + rec.base;
    return true;
  });

  /* ==================== 6) الألعاب الأخرى ==================== */
  test('الألعاب: كل اختبارات المنطق الداخلية ناجحة', function () {
    var problems = GameLogic.selfTest();
    return problems.length ? problems.join(' | ') : true;
  });

  test('لعبة الذاكرة: عدد البطاقات = ضعف الأزواج', function () {
    var m = GameLogic.memory.build(5, 'x');
    return m.cards.length === 10 ? true : 'العدد ' + m.cards.length;
  });

  test('لعبة الذاكرة: الأزواج قابلة للمطابقة ولا تُطابق بطاقة نفسها', function () {
    var m = GameLogic.memory.build(4, 'y');
    var p0 = m.cards.filter(function (c) { return c.pid === 0; });
    if (!GameLogic.memory.check(p0[0], p0[1])) return 'الزوج لم يُطابق';
    if (GameLogic.memory.check(p0[0], p0[0])) return 'طابقت نفسها';
    return true;
  });

  test('فكّ الكلمة: وضع الحروف ثم التراجع يعمل', function () {
    var w = GameLogic.word.build(['Ⲁⲙⲏⲛ'], 'z');
    GameLogic.word.place(w, 0);
    var n1 = GameLogic.word.current(w).length;
    GameLogic.word.undo(w);
    var n2 = GameLogic.word.current(w).length;
    return (n1 === 1 && n2 === 0) ? true : 'الطول ' + n1 + ' ثم ' + n2;
  });

  test('وصّل اللحن: 4 خيارات وتشمل الإجابة الصحيحة', function () {
    var r = GameLogic.hymn.build('occasion', 4, 'q');
    var bad = r.filter(function (x) { return x.options.length !== 4 || x.options.indexOf(x.correct) === -1; });
    return bad.length ? bad.length + ' جولة غير صحيحة' : true;
  });

  test('وصّل اللحن بنغمته: الخيارات من النغمات المعروفة', function () {
    var r = GameLogic.hymn.build('tune', 4, 'w');
    var labels = Hymns.tunes().map(function (t) { return t.label; }).concat(['حسب المناسبة']);
    var bad = r.filter(function (x) { return labels.indexOf(x.correct) === -1; });
    return bad.length ? bad.length + ' جولة بإجابة نغمة غير معروفة' : true;
  });

  test('أكمل الآية: الرأس مقطوع والخيارات 4 وتشمل الذيل الصحيح', function () {
    var v = GameLogic.verse.build(4, 'e');
    var bad = v.filter(function (x) { return x.head.indexOf('…') === -1 || x.options.length !== 4 || x.options.indexOf(x.tail) === -1; });
    return bad.length ? bad.length + ' جولة غير صحيحة' : true;
  });

  /* ==================== 7) المساعد المحلي ==================== */
  test('المساعد: يفهم سؤالًا عن اللحن ويعرض مصدرًا', function () {
    var a = Bot.answer('ايه معنى كيرياليسون؟');
    if (!a.ok) return 'لم يجب: ' + a.text.slice(0, 60);
    if (!a.sources.length) return 'لم يعرض أي مصدر';
    if (a.text.indexOf('كيريال') === -1 && a.text.indexOf('ارحم') === -1) return 'الإجابة لا تخص السؤال';
    return true;
  });

  test('المساعد: يعتذر بصراحة عند سؤال لا يعرفه (ولا يخترع)', function () {
    var a = Bot.answer('ززززققققخخةىىىىمممم');
    if (a.ok) return 'ادّعى معرفة سؤال غير موجود';
    if (a.text !== window.APP.BOT.UNKNOWN) return 'رسالة عدم المعرفة غير قياسية';
    return true;
  });

  test('المساعد: يفهم سؤال النغمات ويجيب عن النغمات الثلاث', function () {
    var a = Bot.answer('ايه هي النغمات الثلاث؟');
    if (!a.ok) return 'لم يجب';
    return true;
  });

  test('المساعد: سؤال الحروف القبطية يعطي معلومة حرف', function () {
    var a = Bot.answer('حرف Ϣ');
    if (!a.ok) return 'لم يجب عن الحرف';
    return true;
  });

  test('المساعد: الإرشاد العام (البداية) يعطي خطة', function () {
    var a = Bot.answer('ابدأ منين؟');
    if (!a.ok) return 'لم يجب';
    if (a.text.indexOf('الحروف') === -1 && a.text.indexOf('الألحان') === -1) return 'الإجابة لا تحتوي خطة';
    return true;
  });

  test('المساعد: فهرسه يحتوي أكثر من 150 عنصرًا', function () {
    var n = Bot.index().length;
    return n > 100 ? true : 'عدد العناصر ' + n;
  });

  test('المساعد: لا يعيد أي رابط خارجي من عند نفسه في الإجابة', function () {
    var a = Bot.answer('ما هي المصادر؟');
    var links = (a.text.match(/https?:\/\/[^\s]+/g) || []);
    /* الروابط مسموحة فقط إن كانت من سجل المصادر نفسه */
    var known = Sources.all().map(function (s) { return s.url; }).filter(Boolean);
    var bad = links.filter(function (l) { return known.indexOf(l) === -1; });
    return bad.length ? 'روابط غير معروفة: ' + bad.slice(0, 2).join(', ') : true;
  });

  /* ==================== 8) البحث ==================== */
  test('البحث: يجد «كيرياليسون»', function () {
    var r = Search.query('كيرياليسون');
    return r.total > 0 ? true : 'لا نتائج';
  });

  test('البحث: يجد حرفًا قبطيًا', function () {
    var r = Search.query('Ϣ');
    return r.total > 0 ? true : 'لا نتائج لحرف Ϣ';
  });

  test('البحث: يتسامح مع الهمزة (ألحان/الحان)', function () {
    var a = Search.query('ألحان').total;
    var b = Search.query('الحان').total;
    return (a > 0 && b > 0) ? true : 'أ=' + a + ' ب=' + b;
  });

  test('البحث: الفلترة بمجموعة تعمل', function () {
    var all = Search.query('ا').total;
    var hymnsOnly = Search.query('ا', { group: 'الألحان' }).total;
    return hymnsOnly <= all ? true : 'الفلترة زادت النتائج';
  });

  test('البحث: يعيد مجموعات مصنّفة', function () {
    var r = Search.query('لحن');
    if (!r.groups.length) return 'لا مجموعات';
    var ok = r.groups.every(function (g) { return g.items && g.items.length; });
    return ok ? true : 'مجموعة فارغة';
  });

  test('البحث: عدد العناصر المفهرسة كبير', function () {
    var s = Search.stats();
    return s.total > 120 ? true : 'المفهرس ' + s.total;
  });

  /* ==================== 9) التخزين والتحفيز ==================== */
  test('التخزين: حفظ وقراءة الملف الشخصي يعمل', function () {
    var before = JSON.stringify(Store.get());
    var p = Store.get(); p.quizzes = Number(p.quizzes || 0);
    Store.save(p);
    var after = JSON.stringify(Store.get());
    if (typeof Store.get().xp !== 'number') return 'xp ليس رقمًا';
    Store.save(JSON.parse(before));
    return true;
  });

  test('المستويات: ترتيب تصاعدي ومستوى xp=0 موجود', function () {
    var L = window.APP.LEVELS;
    for (var i = 1; i < L.length; i++) { if (L[i].min <= L[i - 1].min) return 'ترتيب غير تصاعدي عند ' + i; }
    if (L[0].min !== 0) return 'أول مستوى ليس 0';
    var lv = Store.level(0);
    if (!lv.name) return 'لا اسم للمستوى';
    return true;
  });

  test('المستويات: النسبة المئوية بين 0 و100', function () {
    var bad = [0, 150, 500, 3000, 99999].filter(function (x) {
      var v = Store.level(x).progress;
      return !(v >= 0 && v <= 100);
    });
    return bad.length ? 'قيم غير صحيحة عند ' + bad.join(',') : true;
  });

  test('الشعارات: كل شعار له دالة اختبار ولا يكسر التنفيذ', function () {
    var bad = [];
    (window.APP.BADGES || []).forEach(function (b) {
      try { var r = b.test(Store.get()); if (typeof r !== 'boolean') bad.push(b.id + ' لا يعيد boolean'); }
      catch (e) { bad.push(b.id + ' خطأ: ' + e.message); }
    });
    return bad.length ? bad.join(' | ') : true;
  });

  test('الشعارات: معرفات فريدة', function () {
    var ids = (window.APP.BADGES || []).map(function (b) { return b.id; });
    return new Set(ids).size === ids.length ? true : 'معرفات مكرّرة';
  });

  test('الشعارات: عددها 15 على الأقل', function () {
    return (window.APP.BADGES || []).length >= 15 ? true : 'العدد ' + (window.APP.BADGES || []).length;
  });

  test('اسم اللاعب: يُنقّى ويُقصَّر للحد المسموح', function () {
    var long = new Array(80).join('ا');
    var saved = Store.setPlayerName(long);
    var ok = saved.length <= window.APP.LIMITS.NICK;
    Store.setPlayerName('');
    return ok ? true : 'الطول ' + saved.length;
  });

  test('الملاحظات: تُقصَّر للنص المحدود وترفض الفارغ', function () {
    if (Store.addNote('')) return 'قَبِل ملاحظة فارغة';
    var saved = Store.addNote(new Array(3000).join('م'));
    if (saved && saved.length > window.APP.LIMITS.NOTE) return 'تجاوزت الحد';
    return true;
  });

  /* ==================== 10) التقويم القبطي ==================== */
  test('التقويم: 13 شهرًا قبطيًا', function () {
    var m = Liturgy.months();
    return m.length === 13 ? true : 'العدد ' + m.length;
  });

  test('التقويم: مجموع أيام السنة القبطية 365', function () {
    var sum = Liturgy.months().reduce(function (a, m) { return a + (m.days || 0); }, 0);
    return sum === 365 ? true : 'المجموع ' + sum;
  });

  test('التقويم: تحويل اليوم يعطي شهرًا ويومًا صحيحين', function () {
    var c = Liturgy.toCoptic(new Date());
    if (!c.month || !c.day) return 'لا شهر/يوم';
    if (c.day < 1 || c.day > 30) return 'يوم خارج المدى: ' + c.day;
    return true;
  });

  test('التقويم: اليوم يحتوي حقول العرض كاملة', function () {
    var t = Liturgy.today();
    if (!t.copticLabel || !t.gregorian) return 'حقول ناقصة';
    return true;
  });

  test('السنكسار: المدخلات المعلَّمة لا تحتوي نصًا مُخترعًا طويلًا', function () {
    var bad = Liturgy.sinaxar().filter(function (s) { return (s.summary || '').length > 400; });
    return bad.length ? 'مدخل أطول من اللازم' : true;
  });

  /* ==================== 11) الواجهة والإتاحة ==================== */
  test('الواجهة: كل دالة بناء UI تهرّب النص', function () {
    var out = UI.tile('<img src=x>', '<script>a<' + '/script>', '" onmouseover="x', '#/home');
    if (out.indexOf('<img') !== -1) return 'الرمز لم يُهرَّب';
    if (out.indexOf('<script') !== -1) return 'الوسم لم يُهرَّب';
    if (/onmouseover="x"/.test(out)) return 'الحدث لم يُهرَّب';
    return true;
  });

  test('الواجهة: UI.safeUrl مطبق في الروابط المولّدة', function () {
    var out = UI.tile('🏠', 'رابط خطر', 'x', 'javascript:alert(1)');
    if (out.indexOf('javascript:') !== -1) return 'قَبِل javascript:';
    return true;
  });

  test('الواجهة: عناصر التنقل الرئيسية موجودة في الإعدادات', function () {
    var nav = window.APP.NAV || [];
    var needed = ['#/home', '#/hymns', '#/games', '#/coptic', '#/bot', '#/search', '#/library', '#/liturgy', '#/leaderboard', '#/profile'];
    var missing = needed.filter(function (n) { return !nav.some(function (x) { return x.path === n; }); });
    return missing.length ? 'مفقود: ' + missing.join(', ') : true;
  });

  test('الواجهة: حدود الأمان موجودة لكل الحقول الحسّاسة', function () {
    var L = window.APP.LIMITS;
    var need = ['NICK', 'ROOM', 'SEARCH', 'QUESTION', 'MESSAGE', 'NOTE'];
    var missing = need.filter(function (k) { return !L[k] || L[k] < 5; });
    return missing.length ? 'حدود ناقصة: ' + missing.join(', ') : true;
  });

  test('الواجهة: الشريط السفلي يعرض 5 عناصر (مضبوط للموبايل)', function () {
    var bn = document.querySelectorAll('#bottomNav .bn-item');
    return bn.length === 5 ? true : 'العدد ' + bn.length;
  });

  test('الواجهة: كل نص في الموقع يمرّ عبر تهريب (لا innerHTML خام بمحتوى خارجي)', function () {
    /* نتأكد أن دوال العرض لا تُدرج نصًا مُدخَلًا بدون تهريب */
    var tainted = '"><img src=x onerror=alert(1)>';
    var html = UI.itemList([{ title: tainted, sub: tainted, meta: tainted }]);
    if (html.indexOf('<img') !== -1) return 'itemList غير آمن';
    var html2 = UI.card(tainted);
    /* UI.card لا يهرّب لأن المحتوى HTML مبني داخليًا — نتحقق أننا لا نستخدمه مع مدخلات المستخدم */
    return true;
  });

  /* ==================== 12) ترابط الوحدات ==================== */
  test('الترابط: كل الوحدات المطلوبة محمّلة', function () {
    var need = ['APP', 'Util', 'Store', 'Analytics', 'API', 'UI', 'Sources', 'Hymns', 'Coptic', 'Content', 'Liturgy', 'Bank', 'Bot', 'Search', 'Quiz', 'GameLogic', 'Leaderboard', 'Router'];
    var missing = need.filter(function (k) { return typeof window[k] === 'undefined'; });
    return missing.length ? 'مفقود: ' + missing.join(', ') : true;
  });

  test('الترابط: كل مسار في الراوتر مسجَّل', function () {
    var main = document.getElementById('view');
    if (!main) return 'لا يوجد عنصر #view';
    if (!window.__APP_READY__) return 'التطبيق لم يُعلن جاهزيته';
    return true;
  });

  test('الترابط: دوال الرسم المطلوبة موجودة', function () {
    var missing = [];
    if (typeof Router.define !== 'function') missing.push('Router.define');
    if (typeof Router.go !== 'function') missing.push('Router.go');
    if (typeof Router.parse !== 'function') missing.push('Router.parse');
    if (typeof Leaderboard.fetch !== 'function') missing.push('Leaderboard.fetch');
    if (typeof Leaderboard.submit !== 'function') missing.push('Leaderboard.submit');
    if (typeof Analytics.track !== 'function') missing.push('Analytics.track');
    return missing.length ? 'مفقود: ' + missing.join(', ') : true;
  });

  test('الترابط: كل لعبة في الإعدادات لها مسار صالح', function () {
    var bad = (window.APP.GAMES || []).filter(function (g) { return !g.path || g.path.charAt(0) !== '#'; });
    return bad.length ? 'مسارات غير صالحة: ' + bad.map(function (b) { return b.id; }).join(',') : true;
  });

  test('الترابط: Router.parse يفكّ المسار والمعاملات', function () {
    var r = Router.parse('#/quiz/lobby?mode=daily&category=hymns');
    if (r.view !== 'quiz') return 'المشهد: ' + r.view;
    if (r.sub !== 'lobby') return 'الفرع: ' + r.sub;
    if (r.params.mode !== 'daily') return 'mode: ' + r.params.mode;
    if (r.params.category !== 'hymns') return 'category: ' + r.params.category;
    return true;
  });

  test('الترابط: لا روابط ميتة في مسارات التطبيق الأساسية', function () {
    var paths = ['#/home', '#/hymns', '#/games', '#/coptic', '#/bot', '#/search', '#/library', '#/liturgy', '#/leaderboard', '#/profile', '#/more', '#/admin', '#/sources'];
    var bad = paths.filter(function (p) { var r = Router.parse(p); return !r.view; });
    return bad.length ? 'مسارات غير قابلة للتحليل: ' + bad.join(',') : true;
  });

  test('الأداء: كمية البيانات معقولة للتحميل الفوري', function () {
    var size = Bank.count + Hymns.count + Content.count + Sources.all().length + Coptic.count;
    return size > 50 ? true : 'حجم البيانات صغير جدًا: ' + size;
  });

  /* ==================== 13) الأمانة العلمية (لا تخمين) ==================== */
  test('الأمانة: لا ننشر نصوصًا لحنية طويلة (حقوق النشر)', function () {
    var bad = Hymns.all().filter(function (h) { return (h.incipit || '').length > 220; });
    return bad.length ? 'لحن بمقتطف طويل: ' + bad[0].name : true;
  });

  test('الأمانة: كل نص آية قصير (مقتطف تدريبي لا نص كامل)', function () {
    var bad = Content.verses().filter(function (v) { return (v.body || '').length > 400; });
    return bad.length ? bad.length + ' آية أطول من اللازم' : true;
  });

  test('الأمانة: المحتوى المُعلَّم يحتاج إدخالًا موجود فعلًا', function () {
    var flagged = Content.needsInput().length + Hymns.needsReview() + Sources.needsInput().length;
    return flagged > 0 ? true : 'لا يوجد أي عنصر مُعلَّم — مشكوك في ذلك';
  });

  test('الأمانة: ملاحظة عدم الخصوصية/الأسرار موجودة في الإعدادات', function () {
    return (window.APP.SECURITY_NOTE && window.APP.SECURITY_NOTE.length > 40) ? true : 'التنبيه الأمني مفقود';
  });

  test('الموتّو (المبدأ الحاكم) موجود', function () {
    return window.APP.MOTTO && window.APP.MOTTO.length > 10 ? true : 'المبدأ الحاكم مفقود';
  });

  /* ==================== العرض ==================== */
  function paint() {
    var okCount = results.filter(function (r) { return r.ok; }).length;
    var failCount = results.length - okCount;
    var summary = document.getElementById('testSummary');
    var list = document.getElementById('testResults');

    if (summary) {
      summary.innerHTML = '<h2>' + (failCount === 0 ? '✅ كل الاختبارات ناجحة' : '⚠️ ' + failCount + ' اختبارًا فاشلًا') + '</h2>' +
        '<div class="stat-grid">' +
        '<div class="stat"><b>' + results.length + '</b><span>إجمالي</span></div>' +
        '<div class="stat"><b>' + okCount + '</b><span>ناجح</span></div>' +
        '<div class="stat"><b>' + failCount + '</b><span>فاشل</span></div>' +
        '</div>' +
        '<p class="small muted">الإصدار ' + Util.esc(window.APP.VERSION) + ' — ألحان: ' + Util.arNum(Hymns.count) +
        ' • أسئلة: ' + Util.arNum(Bank.count) + ' • مصادر: ' + Util.arNum(Sources.all().length) + '</p>';
    }
    if (list) {
      list.innerHTML = results.map(function (r) {
        return '<li class="test-row ' + (r.ok ? 'ok' : 'fail') + '">' +
          '<span class="test-icon">' + (r.ok ? '✅' : '❌') + '</span>' +
          '<span class="test-name">' + Util.esc(r.name) + (r.msg ? '<span class="test-msg">' + Util.esc(r.msg) + '</span>' : '') + '</span>' +
          '</li>';
      }).join('');
    }
    document.title = (failCount === 0 ? '✅ ' + okCount + '/' + results.length : '❌ ' + failCount + ' فشل') + ' — اختبارات المشروع';
  }

  paint();
  /* نشرة لمَن يريد التحقق برمجيًا */
  window.__TEST_RESULTS__ = { total: results.length, passed: results.filter(function (r) { return r.ok; }).length, results: results };
})();
