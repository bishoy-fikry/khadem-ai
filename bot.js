/* ============================================================
   core/bot.js — المساعد الذكي المحلي «خادم»
   ✅ يعمل بدون أي مفتاح API وبدون إنترنت وبدون تكلفة.
   ✅ لا يخترع معلومة: يجيب فقط مما في قاعدة المعرفة الداخلية.
   ✅ يعرض دائمًا المصادر التي استند إليها، أو يقول بصراحة: لا أعرف.
   ============================================================ */
(function () {
  'use strict';

  var B = {};
  var CFG = (window.APP && window.APP.BOT) || { NAME: 'خادم', MIN_SCORE: 2, TOP_RESULTS: 4 };

  /* ---------- بناء فهرس قاعدة المعرفة من كل الوحدات ---------- */
  function buildIndex() {
    var idx = [];

    /* الألحان */
    try {
      Hymns.all().forEach(function (h) {
        idx.push({
          kind: 'لحن', id: h.id, title: h.name, coptic: h.coptic || '',
          text: [h.name, h.coptic, h.translit, h.meaning, h.note].join(' — '),
          answer: h.meaning + (h.note ? '\n\nملاحظة: ' + h.note : ''),
          extra: 'المناسبة: ' + (h.occasion || []).map(occName).join('، ') + ' • النغمة: ' + tuneName(h.tune) + (h.level ? ' • المستوى: ' + h.level : ''),
          learn: h.learn || [],
          source: h.source_id, review: !!h.needs_review, link: '#/hymns/' + h.id
        });
      });
    } catch (e) { }

    /* المصطلحات القبطية */
    try {
      Coptic.words().forEach(function (w, i) {
        idx.push({
          kind: 'قبطي', id: 'cw' + i, title: w.coptic + ' (' + w.translit + ')', coptic: w.coptic,
          text: [w.coptic, w.translit, w.ar, w.where].join(' — '),
          answer: 'المعنى: ' + w.ar + '\n\nموضع الاستخدام: ' + (w.where || 'غير محدد'),
          extra: '', learn: [], source: 'internal_hymns', review: !w.key, link: '#/coptic'
        });
      });
      Coptic.letters().forEach(function (L) {
        idx.push({
          kind: 'حرف قبطي', id: 'cl' + L.i, title: L.ch + ' — ' + L.name, coptic: L.ch + ' ' + L.lower,
          text: [L.ch, L.lower, L.name, L.translit, L.sound].join(' — '),
          answer: 'الحرف: ' + L.ch + ' (' + L.lower + ')\nالمسمى: ' + L.name + '\nالنطق: ' + L.sound + '\nالأصل: ' + L.origin + (L.ex ? '\nمثال: ' + L.ex : ''),
          extra: '', learn: [], source: 'coptic_lang_ref', review: false, link: '#/coptic'
        });
      });
    } catch (e) { }

    /* محتوى المكتبة */
    try {
      Content.all().forEach(function (c) {
        idx.push({
          kind: typeLabel(c.type), id: c.id, title: c.title, coptic: '',
          text: [c.title, c.summary, c.body, (c.tags || []).join(' ')].join(' — '),
          answer: (c.summary ? c.summary + '\n\n' : '') + (c.body || ''),
          extra: (c.license_note ? 'ملاحظة الترخيص: ' + c.license_note + ' ' : '') + ((c.tags || []).length ? 'الوسوم: ' + c.tags.join('، ') : ''),
          learn: [], source: c.source_id, review: !!c.needs_admin_input, link: '#/library?type=' + c.type
        });
      });
    } catch (e) { }

    /* الطقوس والسنكسار */
    try {
      Liturgy.months().forEach(function (m) {
        idx.push({
          kind: 'شهر قبطي', id: 'cm' + m.i, title: 'شهر ' + m.name, coptic: '',
          text: [m.name, m.note || '', m.season || ''].join(' — '),
          answer: 'شهر ' + m.name + (m.days ? ' (' + m.days + ' يومًا)' : '') + (m.note ? '\n\n' + m.note : '') + (m.season ? '\n\n' + m.season : ''),
          extra: '', learn: [], source: 'st_takla', review: false, link: '#/liturgy'
        });
      });
      Liturgy.fixedFeasts().forEach(function (f, i) {
        idx.push({
          kind: 'عيد', id: 'cf' + i, title: f.name, coptic: '',
          text: [f.name, f.note].join(' — '),
          answer: f.name + (f.note ? '\n\n' + f.note : ''),
          extra: 'التاريخ القبطي: ' + f.day + ' ' + (Liturgy.months()[f.month - 1] || {}).name,
          learn: [], source: 'st_takla', review: false, link: '#/liturgy'
        });
      });
      Liturgy.movable().forEach(function (mv, i) {
        idx.push({
          kind: 'مناسبة متنقلة', id: 'mv' + i, title: mv.name, coptic: '',
          text: [mv.name, mv.note].join(' — '),
          answer: mv.name + '\n\n' + mv.note + '\n\nالتواريخ المتنقلة تُحسب سنويًا من حساب القيامة (تُراجع من التقويم الكنسي).',
          extra: '', learn: [], source: 'st_takla', review: true, link: '#/liturgy'
        });
      });
    } catch (e) { }

    /* مصادر */
    try {
      Sources.all().forEach(function (s) {
        idx.push({
          kind: 'مصدر', id: 'src' + s.id, title: s.name, coptic: '',
          text: [s.name, s.description, s.category].join(' — '),
          answer: s.name + '\n\n' + (s.description || '') + '\n\nنوع المصدر: ' + s.type + ' • درجة الاعتماد: ' + trustLabel(s.trust_level) + (s.url ? '\nالرابط: ' + s.url : '') + (s.access_note ? '\n\n' + s.access_note : ''),
          extra: '', learn: [], source: s.id, review: /NEEDS_ADMIN_INPUT/.test(s.access_note || ''), link: '#/sources'
        });
      });
    } catch (e) { }

    /* آيات الكتاب المقدس */
    try {
      Content.verses().forEach(function (v) {
        idx.push({
          kind: 'آية', id: v.id, title: v.title, coptic: '',
          text: [v.title, v.body, v.summary].join(' — '),
          answer: v.body + '\n\n' + (v.summary || ''),
          extra: 'للتدريب: ' + '#/games/verse', learn: [], source: v.source_id, review: false, link: '#/library?type=verse'
        });
      });
    } catch (e) { }

    return idx;
  }

  function occName(id) {
    var l = (window.APP.HYMN_OCCASIONS || []).filter(function (o) { return o.id === id; })[0];
    return l ? l.label : id;
  }
  function tuneName(id) {
    var l = (window.APP.HYMN_TUNES || []).filter(function (t) { return t.id === id; })[0];
    return l ? l.label : (id === 'all' ? 'حسب المناسبة' : id);
  }
  function typeLabel(id) {
    var l = (window.APP.CONTENT_TYPES || []).filter(function (t) { return t.id === id; })[0];
    return l ? l.label : id;
  }
  function trustLabel(id) {
    return id === 'high' ? 'عالية 🔒' : id === 'medium' ? 'متوسطة' : 'منخفضة';
  }

  var INDEX = null;
  B.reindex = function () { INDEX = buildIndex(); return INDEX.length; };
  B.index = function () { if (!INDEX) B.reindex(); return INDEX; };

  /* ---------- نية السؤال (كشف بسيط) ---------- */
  var INTENTS = [
    { id: 'greet', re: /^(السلام|سلام|اهلا|أهلا|هاي|hi|hello|صباح|مساء|ازيك|إزيك)/ },
    { id: 'thanks', re: /(شكرا|شكرًا|تسلم|ربنا يبارك)/ },
    { id: 'help', re: /(ساعدني|اعمل ايه|أعمل إيه|ابدأ منين|أبدأ منين|ازاي اتعلم|إزاي أتعلم|منهج|خطة)/ },
    { id: 'whoareyou', re: /(انت مين|مين انت|من انت|اسمك ايه|انت بوت)/ },
    { id: 'about', re: /(الموقع ده|المشروع ده|ايه ده عن|عن ايه)/ },
    { id: 'games', re: /(العاب|ألعاب|مسابقة|لعبة|اكسب|نقاط|شعارات)/ },
    { id: 'hymn_learn', re: /(احفظ|أحفظ|حفظ|اتعلم اللحن|أتعلم اللحن|طريقة الحفظ)/ }
  ];

  function detectIntent(q) {
    var n = Util.normalizeAr(q);
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].re.test(n)) return INTENTS[i].id;
    }
    return null;
  }

  /* ---------- الردود الثابتة ---------- */
  function intentReply(intent) {
    switch (intent) {
      case 'greet': return 'أهلًا بيك! 🙏 أنا «خادم» — مساعد تعليمي قبطي. اسألني عن: لحن، طقس، شهر قبطي، شخصية، آية، مصطلح قبطي، أو مصدر. ولو ما عرفتش، هقولك بصراحة إني ما عرفتش.';
      case 'thanks': return 'ربنا يبارك خدمتك 🙏 ولو عندك أي سؤال تاني في الألحان أو الطقوس، أنا موجود.';
      case 'whoareyou': return 'أنا «خادم» — مساعد تعليمي داخل مشروع «البوت القبطي التعليمي». بعمل حاجة واحدة بتركيز: أحضر لك المعلومة من قاعدة معرفة داخلية أُعِدّت بمراجعة، وأعرض مصادرها. ومعنديش أي اتصال بإنترنت ولا بحساب خارجي، لذلك ما بخمّنش ولا بألّفش إجابة.';
      case 'about': return '«البوت القبطي التعليمي (خادم)» منصة تعليمية للخدام والشباب: مكتبة ألحان بتدريب عملي 🎵، اللغة القبطية 🔤، الألعاب والمسابقات 🎮، الطقوس والسنكسار 📅، المكتبة 📚، ومساعد محلي 🤖. الفكرة: تحويل المعلومة القبطية لتجربة تفاعلية تكسب منها نقاطًا وشعارات.';
      case 'games': return 'عندك ألعاب كتير: مسابقة الأسئلة (5 أوضاع + 10 تصنيفات)، لعبة الذاكرة (حرف ↔ نطق)، فكّ الكلمة القبطية، وصّل اللحن بالمناسبة، وأكمل الآية. من كل لعبة تكسب XP وشعارات. ابدأ من صفحة الألعاب 🎮 #/games';
      case 'help': return 'خطة الوصول السريعة 🚀\n\n1) اللغة: تعلّم الحروف من صفحة القبطي (32 حرفًا) — 5 حروف يوميًا.\n2) الألحان: ابدأ بـ «كيرياليسون» و«أجيوس» و«يا إلهنا ارحمنا» — مستوى 1.\n3) النغمات: افهم الفرق بين الآدامي والواطس والحزايني.\n4) الطقس: اجعله عادة بمراجعة «رتبة القداس» في صفحة الألحان.\n5) تدريب: العب «وصّل اللحن» ومسابقة الأسئلة.\n\nولو محتاج خطة 4 أسابيع للشماس، ادخل صفحة الشمامسة 📜';
      case 'hymn_learn': return 'أفضل طريقة لحفظ لحن 🎵\n\n1) اعرف معنى اللحن ومناسبته بالعربية أولًا.\n2) اسمعه من مرتل متقن (مش من مصدر مجهول).\n3) قسّمه لمقاطع 4–6 كلمات، ومقطع واحد كل يوم.\n4) اعرف نغمته: آدامي/واطس/حزايني.\n5) راجعه بصوت مسموع أسبوعيًا مرة على الأقل.\n6) أي كلمة أو نغمة مش متأكد منها: اسأل المرتل، وما تُعلّمهاش لحد قبل ما تتأكد.';
      default: return null;
    }
  }

  /* ---------- البحث في قاعدة المعرفة ---------- */
  B.retrieve = function (query, limit) {
    var idx = B.index();
    var q = Util.normalizeAr(query);
    if (!q) return [];
    var results = [];
    idx.forEach(function (item) {
      var score = 0;
      score += Util.scoreText(item.title, q) * 2.2;
      score += Util.scoreText(item.text, q);
      score += Util.scoreText(item.kind, q) * 0.8;
      /* مكافأة لوجود الكلمة القبطية كما هي */
      if (item.coptic && Util.normalizeAr(item.coptic).indexOf(q) !== -1) score += 12;
      if (score > 0) results.push({ item: item, score: score });
    });
    results.sort(function (a, b) { return b.score - a.score; });
    var top = results.slice(0, limit || CFG.TOP_RESULTS);
    return top.filter(function (r) { return r.score >= (CFG.MIN_SCORE || 2); });
  };

  /* ---------- تجميع الإجابة النهائية ---------- */
  B.answer = function (query) {
    var q = Util.clampText(String(query || ''), (window.APP.LIMITS.QUESTION));
    if (!q) return { ok: false, text: 'اكتب سؤالك وأنا أجاوبك 🙏', sources: [], suggestions: defaultSuggestions() };

    var intent = detectIntent(q);
    var fixed = intent ? intentReply(intent) : null;
    if (fixed) {
      return { ok: true, text: fixed, sources: [], intent: intent, suggestions: defaultSuggestions() };
    }

    var hits = B.retrieve(q, CFG.TOP_RESULTS);
    if (!hits.length) {
      return {
        ok: false, text: CFG.UNKNOWN, sources: [], suggestions: defaultSuggestions(),
        related: relatedTopics(q)
      };
    }

    /* نبني الإجابة من أفضل نتيجة + إضافات من البقية */
    var main = hits[0].item;
    var parts = [];
    parts.push('**' + main.kind + ': ' + main.title + '**');
    if (main.coptic) parts.push('« ' + main.coptic + ' »');
    parts.push(main.answer);
    if (main.extra) parts.push('ℹ️ ' + main.extra);
    if (main.learn && main.learn.length) {
      parts.push('**خطوات عملية:**\n' + main.learn.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'));
    }
    if (main.review) parts.push('⚠️ هذا العنصر مُعلَّم للمراجعة (NEEDS_ADMIN_INPUT) قبل الاعتماد النهائي في التعليم.');

    /* عناصر مرتبطة */
    var more = hits.slice(1).map(function (h) { return h.item; });
    if (more.length) {
      parts.push('**قد يفيدك أيضًا:**\n' + more.map(function (m) { return '• ' + m.kind + ': ' + m.title + ' — ' + String(m.answer || '').split('\n')[0].slice(0, 110); }).join('\n'));
    }

    var sources = uniqSources(hits.map(function (h) { return h.item.source; }));

    return {
      ok: true,
      text: parts.join('\n\n'),
      sources: sources,
      hits: hits.map(function (h) { return { kind: h.item.kind, title: h.item.title, link: h.item.link, review: h.item.review, score: Math.round(h.score) }; }),
      suggestions: defaultSuggestions(),
      needsReview: hits.some(function (h) { return h.item.review; })
    };
  };

  function uniqSources(ids) {
    var seen = {}, out = [];
    ids.forEach(function (id) {
      if (!id || seen[id]) return;
      seen[id] = 1;
      var s = Sources.byId(id);
      if (s) out.push({ id: s.id, name: s.name, url: s.url, trust: s.trust_level, access_note: s.access_note });
      else out.push({ id: id, name: id, url: '', trust: '', access_note: '' });
    });
    return out;
  }

  /* ---------- أسئلة مقترحة ---------- */
  function defaultSuggestions() {
    return [
      'ايه معنى كيرياليسون؟',
      'يعني ايه نغمة الحزايني؟',
      'وريني رتبة القداس بالترتيب',
      'من هو القديس أثناسيوس؟',
      'ايه الفرق بين كيهك والتسبحة؟',
      'اكتب آية عن المحبة'
    ];
  }
  B.suggestions = defaultSuggestions;

  /* ---------- موضوعات قريبة (وقت عدم وجود نتيجة) ---------- */
  function relatedTopics(q) {
    var idx = B.index();
    var pool = [];
    idx.forEach(function (item) { if (item.kind === 'لحن') pool.push(item.title); });
    var out = Util.shuffle(pool).slice(0, 4);
    return out.length ? out : ['كيرياليسون', 'أجيوس', 'الحزايني', 'الواطس'];
  }

  /* ---------- إحصاءات الفهرس (للعرض) ---------- */
  B.stats = function () {
    var idx = B.index(), byKind = {};
    idx.forEach(function (i) { byKind[i.kind] = (byKind[i.kind] || 0) + 1; });
    return { total: idx.length, byKind: byKind };
  };

  window.Bot = B;
})();
