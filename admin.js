/* ============================================================
   views/admin.js — لوحة التنظيم (محلية فقط)
   ⚠️ تنبيه صريح داخل الصفحة: هذه اللوحة غير محمية، ولا يوجد فيها
   أي كلمة سر أو مفتاح. أي بوابة تحقق بـ JavaScript قابلة للقراءة.
   ============================================================ */
(function () {
  'use strict';

  var tab = 'overview';
  var health = null;
  var healthLoading = false;

  function render(main) {
    var tabs = [
      { id: 'overview', label: '📊 نظرة عامة' },
      { id: 'questions', label: '❓ بنك الأسئلة' },
      { id: 'sources', label: '🔗 المصادر' },
      { id: 'gaps', label: '📝 الناقص' },
      { id: 'feedback', label: '📮 الاقتراحات' },
      { id: 'stats', label: '📈 الإحصائيات' },
      { id: 'security', label: '🛡 الأمان' }
    ];

    var body =
      tab === 'questions' ? questionsTab() :
        tab === 'sources' ? sourcesTab() :
          tab === 'gaps' ? gapsTab() :
            tab === 'feedback' ? feedbackTab() :
              tab === 'stats' ? statsTab() :
                tab === 'security' ? securityTab() :
                  overviewTab();

    main.innerHTML = UI.tabs(tabs, tab, 'data-atab') +
      UI.card('<div class="explain">⚠️ <b>تنبيه أمني:</b> ' + Util.esc(window.APP.SECURITY_NOTE) + '</div>', 'warn-card') +
      body;

    main.querySelectorAll('[data-atab]').forEach(function (b) {
      b.addEventListener('click', function () { tab = b.getAttribute('data-atab'); Router.render(true); });
    });
    bind(main);
  }

  /* ==================== نظرة عامة ==================== */
  function overviewTab() {
    var p = Store.get();
    var drafts = Store.drafts();
    return UI.card('<h3>📊 نظرة عامة على المحتوى</h3>' +
      '<div class="stat-grid">' +
      UI.stat(Util.arNum(Hymns.count), 'لحنًا') +
      UI.stat(Util.arNum(Coptic.count), 'حرفًا') +
      UI.stat(Util.arNum(Coptic.wordCount), 'مصطلحًا') +
      UI.stat(Util.arNum(Content.count), 'عنصر محتوى') +
      UI.stat(Util.arNum(Bank.count), 'سؤالًا') +
      UI.stat(Util.arNum(Sources.all().length), 'مصدرًا') +
      UI.stat(Util.arNum(Object.keys(drafts).reduce(function (a, k) { return a + drafts[k].length; }, 0)), 'مسودة محلية') +
      UI.stat(Util.arNum(Store.notes().length), 'ملاحظة') +
      '</div>') +
      UI.card('<h3>🔌 حالة قاعدة البيانات</h3>' +
        '<p class="small muted">فحص حي لجداول المشروع (يحتاج نشرًا ليعمل). قبل النشر: كل الجداول «غير متاحة» وهذا طبيعي — الموقع يعمل بالبيانات الداخلية.</p>' +
        '<div id="healthBox">' + (health ? healthHtml() : '<p class="muted">لم يتم الفحص بعد.</p>') + '</div>' +
        '<div class="btn-row"><button type="button" class="btn sm" id="checkHealth">🔄 فحص الجداول الآن</button></div>') +
      UI.card('<h3>🧭 مؤشرات الجودة</h3>' +
        '<div class="stat-grid">' +
        UI.stat(Util.arNum(Hymns.needsReview()), 'لحن يحتاج مراجعة') +
        UI.stat(Util.arNum(Content.needsInput().length), 'محتوى يحتاج إدخالًا') +
        UI.stat(Util.arNum(Sources.needsInput().length), 'مصدر بدون رابط') +
        UI.stat(Util.arNum(countNeedInputQuestions()), 'سؤالًا يحتاج مراجعة') +
        '</div>' +
        '<p class="small muted" style="margin-top:8px">هذه المؤشرات ليست عيوبًا — هي قائمة العمل الحقيقية للمراجعة. الشفافية أفضل من إخفاء الشك.</p>');
  }

  function countNeedInputQuestions() {
    return Bank.all().filter(function (q) { return /NEEDS_ADMIN_INPUT/.test(q.explanation || ''); }).length;
  }

  function healthHtml() {
    if (!health) return '<p class="muted">لم يتم الفحص بعد.</p>';
    return UI.itemList(health.map(function (h) {
      return {
        title: h.table,
        sub: h.online ? '✅ متاح — ' + Util.arNum(h.total) + ' صفًا' + (h.total === 0 ? ' (لا صفوف بعد)' : '') : '📴 غير متاح' + (h.error ? ' — ' + Util.esc(h.error) : ''),
        meta: ''
      };
    }));
  }

  /* ==================== بنك الأسئلة ==================== */
  function questionsTab() {
    var drafts = Store.drafts().questions;
    var cats = (window.APP.CATEGORIES || []).map(function (c) { return { id: c.id, label: c.label }; });
    var diffs = (window.APP.DIFFICULTY || []).map(function (d) { return { id: d.id, label: d.label }; });

    var html = UI.card('<h3>➕ إضافة سؤال (مسودة محلية)</h3>' +
      UI.field('السؤال', UI.input('qNewQuestion', '', { placeholder: 'اكتب السؤال…', maxlength: window.APP.LIMITS.QUESTION })) +
      '<div class="form-grid">' +
      UI.field('خيار 1', UI.input('qOpt1', '', { maxlength: 120 })) +
      UI.field('خيار 2', UI.input('qOpt2', '', { maxlength: 120 })) +
      UI.field('خيار 3', UI.input('qOpt3', '', { maxlength: 120 })) +
      UI.field('خيار 4', UI.input('qOpt4', '', { maxlength: 120 })) +
      '</div>' +
      UI.field('رقم الإجابة الصحيحة', UI.select('qCorrect', [{ id: 0, label: 'خيار 1' }, { id: 1, label: 'خيار 2' }, { id: 2, label: 'خيار 3' }, { id: 3, label: 'خيار 4' }], 0)) +
      '<div class="form-grid">' +
      UI.field('التصنيف', UI.select('qCat', cats, 'hymns')) +
      UI.field('الصعوبة', UI.select('qDiff', diffs, 'medium')) +
      UI.field('المصدر', UI.select('qSource', Sources.all().map(function (s) { return { id: s.id, label: s.name }; }), 'internal_hymns')) +
      '</div>' +
      UI.field('الشرح', UI.textarea('qExplain', '', { placeholder: 'اكتب الشرح. لو المعلومة غير مؤكدة اكتب NEEDS_ADMIN_INPUT', maxlength: 400 })) +
      '<div class="btn-row"><button type="button" class="btn sm" id="saveQDraft">💾 حفظ كمسودة محلية</button>' +
      '<button type="button" class="btn gold sm" id="sendQDb">☁️ إرسال لقاعدة البيانات</button></div>' +
      '<div id="qFeedback" aria-live="polite"></div>');

    html += UI.card('<h3>📋 المسودات المحلية (' + Util.arNum(drafts.length) + ')</h3>' +
      UI.itemList(drafts.map(function (d) {
        return { title: d.question || '(بدون نص)', sub: (d.category || '') + ' • ' + (d.difficulty || ''), meta: '<button type="button" class="link-btn" data-delqdraft="' + Util.esc(d.__draftId) + '">🗑 حذف</button>' };
      })) +
      (drafts.length ? '<div class="btn-row" style="margin-top:8px"><button type="button" class="btn ghost sm" id="clearQdrafts">🗑 امسح كل مسودات الأسئلة</button></div>' : ''));

    /* توزيع البنك */
    var catsCount = Bank.categories();
    var diffCount = Bank.difficulties();
    html += UI.card('<h3>📊 توزيع بنك الأسئلة</h3>' +
      '<p class="small muted">إجمالي: ' + Util.arNum(Bank.count) + ' سؤالًا</p>' +
      '<h4 class="small">بالتصنيف</h4><div class="chips">' +
      Object.keys(catsCount).sort(function (a, b) { return catsCount[b] - catsCount[a]; }).map(function (k) {
        var c = (window.APP.CATEGORIES || []).filter(function (x) { return x.id === k; })[0];
        return '<span class="chip">' + Util.esc((c ? c.icon + ' ' + c.label : k) + ' • ' + Util.arNum(catsCount[k])) + '</span>';
      }).join('') + '</div>' +
      '<h4 class="small">بالصعوبة</h4><div class="chips">' +
      Object.keys(diffCount).map(function (k) {
        var d = (window.APP.DIFFICULTY || []).filter(function (x) { return x.id === k; })[0];
        return '<span class="chip">' + Util.esc((d ? d.icon + ' ' + d.label : k) + ' • ' + Util.arNum(diffCount[k])) + '</span>';
      }).join('') + '</div>');

    return html;
  }

  /* ==================== المصادر ==================== */
  function sourcesTab() {
    var drafts = Store.drafts().sources;
    var html = UI.card('<h3>➕ إضافة مصدر (مسودة محلية)</h3>' +
      '<p class="small muted">أضف مصدرًا فقط لو تعرف رابطًا رسميًا. لا تُضف مصادر مجهولة أو مصادر محتواها محمي بحقوق نشر.</p>' +
      '<div class="form-grid">' +
      UI.field('اسم المصدر', UI.input('sNewName', '', { maxlength: 80 })) +
      UI.field('النوع', UI.select('sNewType', [
        { id: 'site', label: 'موقع' }, { id: 'telegram', label: 'تليجرام' }, { id: 'book', label: 'كتاب' },
        { id: 'chatbot', label: 'بوت' }, { id: 'whatsapp', label: 'واتساب' }, { id: 'other', label: 'أخرى' }
      ], 'site')) +
      UI.field('الرابط', UI.input('sNewUrl', '', { placeholder: 'https://…', maxlength: 200 })) +
      UI.field('التصنيف', UI.select('sNewCat', (window.APP.CATEGORIES || []).map(function (c) { return { id: c.id, label: c.label }; }), 'hymns')) +
      UI.field('درجة الاعتماد', UI.select('sNewTrust', [{ id: 'high', label: 'عالية' }, { id: 'medium', label: 'متوسطة' }, { id: 'low', label: 'منخفضة' }], 'medium')) +
      '</div>' +
      UI.field('ملاحظة الوصول', UI.textarea('sNewAccessNote', '', { placeholder: 'اكتب: هل المصدر عام؟ هل يحتاج انضمامًا؟ وما المسموح باستخدامه؟', maxlength: 300 })) +
      '<div class="btn-row"><button type="button" class="btn sm" id="saveSDraft">💾 حفظ كمسودة</button>' +
      '<button type="button" class="btn gold sm" id="sendSDb">☁️ إرسال للقاعدة</button></div>' +
      '<div id="sFeedback" aria-live="polite"></div>');

    html += UI.card('<h3>📋 مسودات المصادر (' + Util.arNum(drafts.length) + ')</h3>' +
      UI.itemList(drafts.map(function (d) {
        return { title: d.name || '(بدون اسم)', sub: (d.type || '') + ' • ' + (d.url || 'لا رابط'), meta: '<button type="button" class="link-btn" data-delsdraft="' + Util.esc(d.__draftId) + '">🗑 حذف</button>' };
      })));

    /* المصادر التي تحتاج رابطًا */
    html += UI.card('<h3>⚠️ مصادر تحتاج رابطًا / إدخالًا</h3>' +
      UI.itemList(Sources.needsInput().map(function (s) {
        return { title: s.name, sub: s.access_note, meta: '' };
      })) +
      '<p class="small muted">هذه المصادر مذكورة بدون روابط لأن الروابط لم تُرفق. لا نُنشئ روابط من عندنا.</p>', 'warn-card');

    return html;
  }

  /* ==================== الناقص ==================== */
  function gapsTab() {
    var needContent = Content.needsInput();
    var needHymns = Hymns.all().filter(function (h) { return h.needs_review; });
    var needQ = Bank.all().filter(function (q) { return /NEEDS_ADMIN_INPUT/.test(q.explanation || ''); });
    var needSrc = Sources.needsInput();

    return UI.card('<h3>📝 قائمة العمل (ما يحتاج إدخالًا أو مراجعة)</h3>' +
      '<p class="small muted">هذه القائمة هي خطة الشغل الحقيقية. كل عنصر هنا مُعلَّم في الواجهة بوسم NEEDS_ADMIN_INPUT حتى لا يُقدَّم كحقيقة نهائية.</p>') +
      listCard('🎵 ألحان تحتاج تدقيق نغمة/نص مع مرتل (' + needHymns.length + ')', needHymns) +
      listCard('📚 محتوى يحتاج إدخالًا (' + needContent.length + ')', needContent) +
      listCard('❓ أسئلة تحتاج مراجعة كنسية (' + needQ.length + ')', needQ.map(function (q) { return { title: q.question, summary: q.explanation, source_id: q.source_id }; })) +
      listCard('🔗 مصادر بدون رابط (' + needSrc.length + ')', needSrc.map(function (s) { return { title: s.name, summary: s.access_note, source_id: s.id }; })) +
      UI.card('<h3>🎯 الأولويات المقترحة</h3><ol class="plain-list" style="list-style:decimal;padding-inline-start:22px">' +
      '<li>تدقيق نطق ونغمة الألحان مع مرتل قبطي متقن (أهم بند).</li>' +
      '<li>إدخال مدخلات السنكسار من مصدر مرخّص (أو تركه فارغًا بلا نص مُخترع).</li>' +
      '<li>إضافة روابط مدارس الشمامسة والواتساب إن وُجدت رسميًا.</li>' +
      '<li>مراجعة كنسية لأسئلة العقيدة والتاريخ.</li>' +
      '<li>توسيع مستوى «خبير» لأسئلة متقدمة.</li>' +
      '</ol>');
  }

  function listCard(title, items) {
    if (!items || !items.length) return '';
    return UI.card('<h3>' + Util.esc(title) + '</h3><ul class="item-list">' + items.map(function (i) {
      return '<li><div class="item-title">' + Util.esc(i.title || i.name || i.question || '') + '</div>' +
        (i.summary || i.body || i.meaning || i.explanation ? '<div class="item-meta">' + Util.esc((i.summary || i.body || i.meaning || i.explanation || '').slice(0, 180)) + '</div>' : '') +
        (i.source_id ? '<div class="item-meta">' + UI.sourceLink(i.source_id) + '</div>' : '') +
        '</li>';
    }).join('') + '</ul>', 'tight');
  }

  /* ==================== الاقتراحات ==================== */
  function feedbackTab() {
    var drafts = (Store.drafts().feedback) || [];
    return UI.card('<h3>📮 اقتراحات محفوظة محليًا (' + Util.arNum(drafts.length) + ')</h3>' +
      '<p class="small muted">الاقتراحات المرسلة من صفحة «المزيد». تُخزَّن محليًا في هذا المتصفح، وتُرسل لقاعدة البيانات عند توفّرها. لا نتلقّى أي بيانات شخصية — الاسم مستعار واختياري.</p>' +
      UI.itemList(drafts.map(function (d) {
        return {
          title: kindLabel(d.kind) + ' — ' + (d.nickname || 'زائر'),
          sub: d.message, meta: Util.esc(Util.ago(d.created_at))
        };
      }))) +
      UI.card('<h3>➕ تعريف الأنواع</h3><ul class="plain-list">' +
        '<li><b>تصحيح معلومة:</b> عنصر فيه خطأ ويحتاج تدقيقًا.</li>' +
        '<li><b>إضافة لحن:</b> لحن ناقص أو نص لحني يحتاج إضافته (يجب ذكر المصدر).</li>' +
        '<li><b>إضافة محتوى:</b> موضوع تعليمي ناقص.</li>' +
        '<li><b>اقتراح عام:</b> أي فكرة تطوير.</li>' +
        '</ul>');
  }

  function kindLabel(k) {
    return ({ correction: 'تصحيح', request_hymn: 'إضافة لحن', request_content: 'إضافة محتوى', suggestion: 'اقتراح' })[k] || (k || 'اقتراح');
  }

  /* ==================== الإحصائيات ==================== */
  function statsTab() {
    var s = Analytics.summary();
    var roles = Object.keys(window.APP.ROLES || {}).map(function (k) {
      return { k: k, label: window.APP.ROLES[k].label, can: window.APP.ROLES[k].can };
    });

    return UI.card('<h3>📈 إحصائيات محلية</h3>' +
      '<p class="small muted">تُسجَّل محليًا في متصفحك فقط (بلا أي بيانات شخصية، ومعرّف جلسة عشوائي).</p>' +
      '<div class="stat-grid">' +
      UI.stat(Util.arNum(s.total), 'إجمالي الأحداث') +
      UI.stat(Util.arNum(s.errors), 'أخطاء') +
      '</div>' +
      '<h4 class="small">حسب النوع</h4><div class="chips">' +
      Object.keys(s.byType).map(function (k) { return '<span class="chip">' + Util.esc(k + ' • ' + Util.arNum(s.byType[k])) + '</span>'; }).join('') +
      '</div>' +
      '<h4 class="small">آخر 7 أيام</h4><div class="chips">' +
      Object.keys(s.byDay).sort().slice(-7).map(function (k) { return '<span class="chip">' + Util.esc(k + ' • ' + Util.arNum(s.byDay[k])) + '</span>'; }).join('') +
      '</div>' +
      '<div class="btn-row" style="margin-top:8px">' +
      '<button type="button" class="btn ghost sm" id="clearAnalytics">🗑 امسح الإحصائيات</button>' +
      '<button type="button" class="btn ghost sm" id="flushAnalytics">☁️ إرسال آخر 5 أحداث للقاعدة</button>' +
      '</div>') +
      UI.card('<h3>📊 تقدّمي الشخصي</h3><div class="stat-grid">' +
        UI.stat(Util.arNum(Store.get().xp), 'XP') +
        UI.stat(Util.arNum(Store.get().quizzes), 'مسابقة') +
        UI.stat(Util.arNum(Store.badges().length), 'شعار') +
        UI.stat(Util.arNum(Store.notes().length), 'ملاحظة') +
        '</div>') +
      UI.card('<h3>👥 الأدوار (تنظيمية — غير آمنة)</h3><ul class="plain-list">' +
        roles.map(function (r) {
          return '<li><b>' + Util.esc(r.label) + '</b> — الصلاحيات المحلية: ' + Util.esc(r.can.length ? r.can.join(', ') : 'قراءة فقط') + '</li>';
        }).join('') +
        '</ul><p class="small muted">هذه أدوار تنظيمية في الواجهة فقط. ليس لها أي قيمة أمنية — أمن حقيقي يحتاج خادمًا بمصادقة.</p>', 'warn-card');
  }

  /* ==================== الأمان ==================== */
  function securityTab() {
    var removed = Store.read(window.APP.LS.REMOVED, []);
    return UI.card('<h3>🛡 الحالة الأمنية للمشروع</h3>' +
      '<ul class="plain-list">' +
      '<li>✅ <b>لا يوجد أي مفتاح API في الكود</b> — البحث عن <code>AIza</code> أو <code>token</code> لا يعطي أي نتيجة.</li>' +
      '<li>✅ <b>المساعد محلي بالكامل</b> — لا يتصل بأي خدمة خارجية، ولا يحتاج مفتاحًا.</li>' +
      '<li>✅ <b>تهريب كل النصوص الديناميكية</b> — أي إدخال مستخدم يُعرض كنص لا كـ HTML.</li>' +
      '<li>✅ <b>حدود طول لكل الحقول</b> — لا يمكن إدخال نص ضخم يكسر الواجهة.</li>' +
      '<li>✅ <b>تحقق من الروابط</b> — الروابط تُقبل فقط إذا بدأت بـ https/http أو كانت داخلية.</li>' +
      '<li>✅ <b>تنظيف المفاتيح القديمة</b> — أي مفتاح Google قديم في متصفحك يُمسح عند أول تشغيل.</li>' +
      '<li>⚠️ <b>لا مصادقة ولا أدوار آمنة</b> — مستحيلة في موقع ثابت (NEEDS_BACKEND).</li>' +
      '<li>⚠️ <b>لا تحقق سيرفر-سايد</b> لنتائج المسابقات (NEEDS_BACKEND).</li>' +
      '</ul>' +
      (removed.length ? '<h4 class="small">مفاتيح قديمة تم مسحها</h4><div class="chips">' + removed.slice(-8).map(function (k) { return '<span class="chip">🔑 ' + Util.esc(k) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="btn-row"><button type="button" class="btn ghost sm" id="purgeNow">🧹 امسح أي مفاتيح حسّاسة الآن</button>' +
      '<button type="button" class="btn danger sm" id="resetAllMine">⚠️ تصفير بياناتي المحلية</button></div>') +
      UI.card('<h3>📋 قائمة تحقق قبل النشر</h3><ul class="plain-list">' +
        '<li>شغّل <a href="tests.html">صفحة الاختبارات</a> ✓</li>' +
        '<li>لا تضع في هذه اللوحة أي كلمة سر أو مفتاح أو بيانات شخصية ✓</li>' +
        '<li>راجع كل عنصر مكتوب عليه NEEDS_ADMIN_INPUT ✓</li>' +
        '<li>تأكد أن كل لحن له مصدر وأن النص مجرد مقتطف قصير ✓</li>' +
        '<li>تأكد أن الروابط لا تنتهك حقوق نشر أو شروط استخدام ✓</li>' +
        '</ul>', 'gold');
  }

  /* ==================== الأحداث ==================== */
  function bind(main) {
    /* فحص الجداول */
    var ch = document.getElementById('checkHealth');
    if (ch) ch.addEventListener('click', function () {
      var box = document.getElementById('healthBox');
      if (box) box.innerHTML = '<p class="loader">جارٍ الفحص</p>';
      API.health().then(function (rows) {
        health = rows;
        var b = document.getElementById('healthBox');
        if (b) b.innerHTML = healthHtml();
        var anyOnline = rows.some(function (r) { return r.online; });
        Util.toast(anyOnline ? '✅ القاعدة متاحة' : '📴 القاعدة غير متاحة (طبيعي قبل النشر)', anyOnline ? 'good' : 'warn');
      });
    });

    /* حفظ مسودة سؤال */
    var sq = document.getElementById('saveQDraft');
    if (sq) sq.addEventListener('click', function () {
      var draft = collectQuestion();
      if (!draft) return;
      Store.addDraft('questions', draft);
      Util.toast('💾 تم حفظ السؤال كمسودة محلية', 'good');
      Router.render(true);
    });

    /* إرسال سؤال للقاعدة */
    var gq = document.getElementById('sendQDb');
    if (gq) gq.addEventListener('click', function () {
      var draft = collectQuestion();
      if (!draft) return;
      API.post('questions', {
        question: draft.question, options: draft.options, correct_index: draft.correct_index,
        explanation: draft.explanation, category: draft.category, difficulty: draft.difficulty,
        source_name: Sources.nameOf(draft.source_id), tags: draft.tags, enabled: true
      }).then(function (res) {
        var fb = document.getElementById('qFeedback');
        if (fb) fb.innerHTML = '<div class="explain" style="margin-top:10px">' + (res.ok ? '✅ تم الإرسال لقاعدة البيانات — سيظهر السؤال لباقي الزوار.' : '💾 قاعدة البيانات غير متاحة — حُفظت المسودة محليًا فقط.') + '</div>';
        if (!res.ok) Store.addDraft('questions', draft);
        Util.toast(res.ok ? '✅ تم الإرسال' : '💾 حُفظ محليًا', res.ok ? 'good' : 'warn');
        Router.render(true);
      });
    });

    main.querySelectorAll('[data-delqdraft]').forEach(function (b) {
      b.addEventListener('click', function () { Store.removeDraft('questions', b.getAttribute('data-delqdraft')); Router.render(true); });
    });
    var cq = document.getElementById('clearQdrafts');
    if (cq) cq.addEventListener('click', function () {
      if (!confirm('مسح كل مسودات الأسئلة المحلية؟')) return;
      Store.removeDraft('questions', '__none__');
      var d = Store.drafts(); d.questions = []; Store.write(window.APP.LS.DRAFTS, d);
      Router.render(true);
    });

    /* حفظ مسودة مصدر */
    var ss = document.getElementById('saveSDraft');
    if (ss) ss.addEventListener('click', function () {
      var draft = collectSource();
      if (!draft) return;
      Store.addDraft('sources', draft);
      Util.toast('💾 تم حفظ المصدر كمسودة', 'good');
      Router.render(true);
    });
    var gs = document.getElementById('sendSDb');
    if (gs) gs.addEventListener('click', function () {
      var draft = collectSource();
      if (!draft) return;
      API.post('sources', {
        name: draft.name, type: draft.type, url: draft.url, category: draft.category,
        description: draft.description, trust_level: draft.trust_level, searchable: false,
        access_note: draft.access_note, enabled: true
      }).then(function (res) {
        var fb = document.getElementById('sFeedback');
        if (fb) fb.innerHTML = '<div class="explain" style="margin-top:10px">' + (res.ok ? '✅ تم الإرسال.' : '💾 القاعدة غير متاحة — حُفظ محليًا.') + '</div>';
        if (!res.ok) Store.addDraft('sources', draft);
        Util.toast(res.ok ? '✅ تم الإرسال' : '💾 حُفظ محليًا', res.ok ? 'good' : 'warn');
        Router.render(true);
      });
    });
    main.querySelectorAll('[data-delsdraft]').forEach(function (b) {
      b.addEventListener('click', function () { Store.removeDraft('sources', b.getAttribute('data-delsdraft')); Router.render(true); });
    });

    /* الإحصائيات */
    var ca = document.getElementById('clearAnalytics');
    if (ca) ca.addEventListener('click', function () { Analytics.clear(); Util.toast('تم مسح الإحصائيات', 'warn'); Router.render(true); });
    var fa = document.getElementById('flushAnalytics');
    if (fa) fa.addEventListener('click', function () {
      Analytics.flush().then(function (r) { Util.toast(r.sent ? '✅ أُرسل ' + r.sent + ' حدثًا' : '📴 القاعدة غير متاحة', r.sent ? 'good' : 'warn'); });
    });

    /* الأمان */
    var pn = document.getElementById('purgeNow');
    if (pn) pn.addEventListener('click', function () {
      var removed = Store.purgeLegacySecrets();
      Util.toast(removed.length ? '🧹 تم مسح: ' + removed.join(', ') : '✅ لا مفاتيح حسّاسة', 'good', 4200);
      Router.render(true);
    });
    var rm = document.getElementById('resetAllMine');
    if (rm) rm.addEventListener('click', function () {
      if (!confirm('⚠️ تصفير كل بياناتك المحلية (نقاط، شعارات، ملاحظات، مسودات)؟ لا يمكن الرجوع.')) return;
      Store.resetAll();
      Util.toast('تم التصفير', 'warn');
      Router.render(true);
    });
  }

  function collectQuestion() {
    var q = Util.clampText(document.getElementById('qNewQuestion').value, window.APP.LIMITS.QUESTION);
    var opts = [1, 2, 3, 4].map(function (i) {
      return Util.clampText(document.getElementById('qOpt' + i).value, 120);
    });
    var correct = Number(document.getElementById('qCorrect').value);
    var explain = Util.clampText(document.getElementById('qExplain').value, 400);
    if (!q || q.length < 5) { Util.toast('اكتب نص السؤال (5 أحرف على الأقل)', 'warn'); return null; }
    if (opts.some(function (o) { return !o; })) { Util.toast('اكتب الخيارات الأربعة كلها', 'warn'); return null; }
    if (new Set(opts).size !== 4) { Util.toast('الخيارات الأربعة يجب أن تكون مختلفة', 'warn'); return null; }
    if (!explain) { Util.toast('اكتب الشرح — لو المعلومة غير مؤكدة اكتب NEEDS_ADMIN_INPUT', 'warn'); return null; }

    /* تحذير لو معلومة غير مؤكدة */
    if (!/NEEDS_ADMIN_INPUT|مصدر|مرجع/i.test(explain)) {
      Util.toast('تنبيه: أضف مرجعًا في الشرح أو وسم NEEDS_ADMIN_INPUT لو غير متأكد.', 'warn', 4600);
    }

    return {
      question: q, options: opts, correct_index: correct, explanation: explain,
      category: document.getElementById('qCat').value,
      difficulty: document.getElementById('qDiff').value,
      source_id: document.getElementById('qSource').value,
      tags: [], enabled: true, created_local: Date.now()
    };
  }

  function collectSource() {
    var name = Util.clampText(document.getElementById('sNewName').value, 80);
    var url = Util.safeUrl(Util.clampText(document.getElementById('sNewUrl').value, 200));
    var note = Util.clampText(document.getElementById('sNewAccessNote').value, 300);
    if (!name || name.length < 3) { Util.toast('اكتب اسم المصدر', 'warn'); return null; }
    if (!note) { Util.toast('اكتب ملاحظة الوصول (هل المصدر عام؟ ما المسموح باستخدامه؟)', 'warn'); return null; }
    if (document.getElementById('sNewUrl').value && !url) { Util.toast('الرابط يجب أن يبدأ بـ https:// أو http://', 'warn'); return null; }
    return {
      name: name, type: document.getElementById('sNewType').value, url: url,
      category: document.getElementById('sNewCat').value,
      description: note, trust_level: document.getElementById('sNewTrust').value,
      access_note: note, searchable: false, enabled: true, created_local: Date.now()
    };
  }

  Router.define('admin', { render: render });
})();
