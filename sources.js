/* ============================================================
   data/sources.js — سجل المصادر المركزي (المصدر الوحيد للروابط)
   ⚠️ قاعدة المشروع: هذه المصادر يُستنَد إليها للتحقّق من المعلومة
   ولا نعرض محتواها أو ننشره. لذلك searchable:false للجميع
   (أي: لا نسحب ولا نعيد نشر محتواها — نذكرها كمصدر مرجعي فقط).
   ============================================================ */
(function () {
  'use strict';

  var SRC = [
    /* ---------- مصادر تعليمية موثوقة (مرجع) ---------- */
    {
      id: 'st_takla', name: 'St-Takla.org — الأنبا تكلا هيمانوت', type: 'site',
      url: 'https://st-takla.org', category: 'general', trust_level: 'high',
      description: 'موسوعة قبطية أرثوذكسية شاملة: الكتاب المقدس، الطقوس، الألحان، السنكسار، التاريخ.',
      searchable: false, enabled: true, verified: true,
      access_note: 'موقع عام متاح. نستخدمه للتحقّق من المعلومات ونذكر الرابط، ولا ننسخ محتواه.'
    },
    {
      id: 'st_mina', name: 'موقع دير الشهيد العظيم مارمينا', type: 'site',
      url: 'https://stmina.info', category: 'general', trust_level: 'high',
      description: 'مقالات روحية وطقسية وألحان من الدير.',
      searchable: false, enabled: true, verified: true,
      access_note: 'موقع عام. مرجع للتحقّق فقط.'
    },
    {
      id: 'coptic_reader', name: 'قراءة قبطية — أدوات اللغة القبطية', type: 'site',
      url: 'https://www.copticchurch.net', category: 'language', trust_level: 'medium',
      description: 'مرجع عام للأبجدية القبطية والنطق.',
      searchable: false, enabled: true, verified: false,
      access_note: 'مرجع عام للتحقق من الحروف والنطق. النطق النهائي يُدقَّق مع مرتل.'
    },
    {
      id: 'coptic_lang_ref', name: 'باحثات النطق القبطي (مرجع أكاديمي)', type: 'other',
      url: '', category: 'language', trust_level: 'medium',
      description: 'مراجع النطق القبطي الفصيح (الآدامي/الواطس/الحزايني).',
      searchable: false, enabled: true, verified: false,
      access_note: '📝 NEEDS_ADMIN_INPUT — يُضاف الرابط المعتمد من المرتل المسؤول.'
    },

    /* ---------- قنوات تليجرام (مرجع استرشادي — لا سحب آلي) ---------- */
    { id: 'tg_chquotes', name: 'CHQuotes (تليجرام)', type: 'telegram', url: 'https://t.me/CHQuotes', category: 'spiritual', trust_level: 'medium', description: 'اقتباسات كنسية قصيرة.', searchable: false, enabled: true, verified: false, access_note: 'قناة تليجرام. الاقتباسات تُنسب للمصدر ولا تُنسخ الجمل الطويلة.' },
    { id: 'tg_ctv_egypt', name: 'ctv_egypt (تليجرام)', type: 'telegram', url: 'https://t.me/ctv_egypt', category: 'spiritual', trust_level: 'medium', description: 'بث ومناسبات كنسية.', searchable: false, enabled: true, verified: false, access_note: 'قناة تليجرام — مرجع استرشادي.' },
    { id: 'tg_hbverses', name: 'HBVerses (تليجرام)', type: 'telegram', url: 'https://t.me/HBVerses', category: 'bible', trust_level: 'high', description: 'آيات الكتاب المقدس.', searchable: false, enabled: true, verified: false, access_note: 'آيات الكتاب المقدس من الترجمة العربية.' },
    { id: 'tg_egypt_news', name: 'Egypt_News (تليجرام)', type: 'telegram', url: 'https://t.me/Egypt_News', category: 'history', trust_level: 'low', description: 'أخبار عامة.', searchable: false, enabled: false, verified: false, access_note: 'لا يُعتمد عليه في أي معلومة كنسية.' },
    { id: 'tg_christianlib', name: 'christianlib (تليجرام)', type: 'telegram', url: 'https://t.me/christianlib', category: 'general', trust_level: 'medium', description: 'فهارس كتب مسيحية.', searchable: false, enabled: true, verified: false, access_note: 'فهرسة وروابط فقط — لا نُعيد نشر كتبًا كاملة.' },
    { id: 'tg_metanoia', name: 'metanoiaforcounselling (تليجرام)', type: 'telegram', url: 'https://t.me/metanoiaforcounselling', category: 'spiritual', trust_level: 'medium', description: 'إرشاد روحي.', searchable: false, enabled: true, verified: false, access_note: 'مرجع استرشادي.' },
    { id: 'tg_english', name: 'itsallinenglish (تليجرام)', type: 'telegram', url: 'https://t.me/itsallinenglish', category: 'language', trust_level: 'low', description: 'محتوى إنجليزي للتدريب.', searchable: false, enabled: true, verified: false, access_note: 'مرجع استرشادي.' },
    { id: 'tg_senksar', name: 'SenksarBokra (تليجرام)', type: 'telegram', url: 'https://t.me/SenksarBokra', category: 'history', trust_level: 'medium', description: 'قراءة سنكسار اليوم.', searchable: false, enabled: true, verified: false, access_note: 'مرجع للسنكسار — نصوص السنكسار تحتاج ترخيصًا قبل النشر، لذلك لا نُدخلها.' },
    { id: 'tg_cantorgad', name: 'CantorGad (تليجرام)', type: 'telegram', url: 'https://t.me/CantorGad', category: 'hymns', trust_level: 'medium', description: 'تسجيلات ألحان قبطية.', searchable: false, enabled: true, verified: false, access_note: 'مرجع سماعي للألحان. لا نرفع تسجيلات بدون إذن.' },
    { id: 'tg_avaraphael', name: 'avaraphailsermons (تليجرام)', type: 'telegram', url: 'https://t.me/avaraphailsermons', category: 'spiritual', trust_level: 'medium', description: 'عظات.', searchable: false, enabled: true, verified: false, access_note: 'فهرسة وروابط — لا نصوص عظات كاملة.' },
    { id: 'tg_chbookz', name: 'CHBookz (تليجرام)', type: 'telegram', url: 'https://t.me/CHBookz', category: 'general', trust_level: 'medium', description: 'كتب.', searchable: false, enabled: false, verified: false, access_note: 'قد يحتوي مواد محمية بحقوق نشر — لا نعتمد عليه.' },
    { id: 'tg_chliturgies', name: 'CHLiturgies (تليجرام)', type: 'telegram', url: 'https://t.me/CHLiturgies', category: 'liturgy', trust_level: 'medium', description: 'نصوص طقسية.', searchable: false, enabled: true, verified: false, access_note: 'مرجع للطقوس — يُحقَّق منه مع كتاب طقسي مطبوع.' },
    { id: 'tg_copticlang', name: 'CopticLang (تليجرام)', type: 'telegram', url: 'https://t.me/CopticLang', category: 'language', trust_level: 'medium', description: 'اللغة القبطية.', searchable: false, enabled: true, verified: false, access_note: 'مرجع لغوي.' },
    { id: 'tg_elkaroz', name: 'Elkaroz (تليجرام)', type: 'telegram', url: 'https://t.me/Elkaroz', category: 'doctrine', trust_level: 'medium', description: 'كرازة وعقيدة.', searchable: false, enabled: true, verified: false, access_note: 'مرجع للتحقق العقيدي.' },
    { id: 'tg_coptic2bot', name: 'Coptic2_bot (تليجرام)', type: 'chatbot', url: 'https://t.me/Coptic2_bot', category: 'general', trust_level: 'low', description: 'بوت تليجرام قبطي.', searchable: false, enabled: true, verified: false, access_note: 'مرجع استرشادي فقط.' },

    /* ---------- مدارس الشمامسة ---------- */
    {
      id: 'deacon_school', name: 'مدرسة الشمامسة (مرجع)', type: 'site', url: '', category: 'deacons',
      trust_level: 'medium', description: 'منهج تدريب الشمامسة وحفظ الألحان.',
      searchable: false, enabled: true, verified: false,
      access_note: '📝 NEEDS_ADMIN_INPUT — لم يُرفق الرابط الرسمي. يُضاف من لوحة الإدارة.'
    },
    {
      id: 'school_stephanos', name: 'مدرسة الشهيد إستفانوس (مرجع)', type: 'site', url: '', category: 'deacons',
      trust_level: 'medium', description: 'مدرسة شمامسة.',
      searchable: false, enabled: true, verified: false,
      access_note: '📝 NEEDS_ADMIN_INPUT — لم يُرفق الرابط الرسمي.'
    },
    {
      id: 'chatbase_ref', name: 'Chatbase (مرجع)', type: 'chatbot', url: '', category: 'general',
      trust_level: 'low', description: 'منصة بوت محادثة.', searchable: false, enabled: false, verified: false,
      access_note: '📝 NEEDS_ADMIN_INPUT — يحتاج حسابًا ومفتاحًا. غير مستخدم في هذا المشروع (المساعد محلي ومجاني).'
    },
    {
      id: 'whatsapp_ref', name: 'مجموعة الواتساب (مرجع)', type: 'whatsapp', url: '', category: 'general',
      trust_level: 'low', description: 'رابط محتوى.', searchable: false, enabled: false, verified: false,
      access_note: '📝 NEEDS_ADMIN_INPUT — الرابط لم يُرفق.'
    },

    /* ---------- مصادر داخلية ---------- */
    {
      id: 'internal_curriculum', name: 'المنهج القبطي الداخلي للمشروع', type: 'book', url: '', category: 'general',
      trust_level: 'high', description: 'منهج عشري مقترح للخدام (داخل المشروع).',
      searchable: false, enabled: true, verified: true,
      access_note: 'محتوى داخلي من إعداد المشروع.'
    },
    {
      id: 'internal_hymns', name: 'مكتبة ألحان المشروع', type: 'book', url: '', category: 'hymns',
      trust_level: 'high', description: 'نصوص ألحان الطلبة القصيرة + بيانات الاسم والمناسبة والنغمة.',
      searchable: false, enabled: true, verified: true,
      access_note: 'مقتطفات قصيرة من الألحان الليتورجية (طلبة)، والنص الطويل يُستكمل من الكتاب الطقسي.'
    },
    {
      id: 'internal_bible', name: 'الكتاب المقدس (ترجمة عربية متداولة)', type: 'book', url: '', category: 'bible',
      trust_level: 'high', description: 'آيات مختارة للتدريب والألعاب.',
      searchable: false, enabled: true, verified: true,
      access_note: 'آيات قصيرة للاستشهاد والتدريب، مع ذكر الشاهد (السفر والإصحاح).'
    },
    {
      id: 'internal_project', name: 'قاعدة المعرفة الداخلية (المشروع)', type: 'other', url: '', category: 'general',
      trust_level: 'high', description: 'كل عنصر محتوى داخلي روابط مصدره موثّقة.',
      searchable: false, enabled: true, verified: true,
      access_note: 'محتوى من إعداد المشروع نفسه.'
    }
  ];

  /* ---------- فهرسة سريعة ---------- */
  var BY_ID = {};
  SRC.forEach(function (s) { BY_ID[s.id] = s; });

  window.Sources = {
    all: function () { return SRC.slice(); },
    enabled: function () { return SRC.filter(function (s) { return s.enabled; }); },
    byId: function (id) { return BY_ID[id] || null; },
    byCategory: function (cat) { return SRC.filter(function (s) { return s.category === cat; }); },
    byType: function (t) { return SRC.filter(function (s) { return s.type === t; }); },
    needsInput: function () { return SRC.filter(function (s) { return /NEEDS_ADMIN_INPUT/.test(s.access_note || ''); }); },
    nameOf: function (id) { var s = BY_ID[id]; return s ? s.name : ''; },
    urlOf: function (id) { var s = BY_ID[id]; return s ? s.url : ''; },
    count: SRC.length
  };
})();
