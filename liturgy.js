/* ============================================================
   data/liturgy.js — طقس اليوم: السنكسار (مدخلات محدودة) + التقويم + القراءات
   ⚠️ لا نُنشئ نصوص سنكسارية غير مؤكدة.
   الخانات الفارغة تظهر بوسم NEEDS_ADMIN_INPUT (تُملأ من لوحة الإدارة).
   ما هو مؤكد: التقويم القبطي وحساباته (تاريخي وحسابي بحت).
   ============================================================ */

(function () {
  'use strict';

  /* ---------- الأشهر القبطية (13 شهرًا) ---------- */
  var COPTIC_MONTHS = [
    { i: 1, name: 'توت', ar: 'توت', days: 30, season: 'بداية السنة القبطية' },
    { i: 2, name: 'بابة', days: 30 },
    { i: 3, name: 'هاتور', days: 30, note: 'شهر والدة الإله (بداية صوم الميلاد)' },
    { i: 4, name: 'كيهك', days: 30, note: 'الشهر المريمي — أبصلمودية كيهك', kiahk: true },
    { i: 5, name: 'طوبة', days: 30, note: 'عيد الغطاس (11 طوبة)' },
    { i: 6, name: 'أمشير', days: 30, note: 'الصوم الكبير يبدأ غالبًا' },
    { i: 7, name: 'برمهات', days: 30, note: 'الصوم الكبير + عيد البشارة (29 برمهات)' },
    { i: 8, name: 'برمودة', days: 30, note: 'القيامة + شم النسيم' },
    { i: 9, name: 'بشنس', days: 30, note: 'صوم الرسل يبدأ أحيانًا + عيد دخول العائلة المقدسة (24 بشنس)' },
    { i: 10, name: 'بؤونة', days: 30, note: 'صوم الرسل' },
    { i: 11, name: 'أبيب', days: 30, note: 'عيد الرسل (12 أبيب) + تسابيح' },
    { i: 12, name: 'مسرى', days: 30, note: 'صوم العذراء (1–15 مسرى) + عيد العذراء (16 مسرى) + النيروز' },
    { i: 13, name: 'النسيء', days: 5, note: 'الأيام الخمسة الصغيرة قبل السنة القبطية الجديدة' }
  ];

  /* ---------- المناسبات الثابتة المؤكدة (تاريخ قبطي) ---------- */
  var FIXED_FEASTS = [
    { month: 1, day: 1, name: 'رأس السنة القبطية (النيروز)', type: 'season', note: 'بداية السنة القبطية الجديدة (سنة الشهداء).' },
    { month: 2, day: 30, name: 'عيد مار مرقس (تذكار)', type: 'feast', note: 'تذكار كاروز الديار المصرية — يُراجَع التقويم السنوي.' },
    { month: 5, day: 11, name: 'عيد الغطاس (الظهور الإلهي)', type: 'feast', note: 'من الأعياد السيدية الكبرى — ألحان واطسية.' },
    { month: 7, day: 29, name: 'عيد البشارة', type: 'feast', note: 'من الأعياد السيدية الكبرى.' },
    { month: 9, day: 24, name: 'دخول العائلة المقدسة إلى مصر', type: 'feast', note: 'تذكار هروب العائلة المقدسة إلى مصر.' },
    { month: 11, day: 12, name: 'عيد الرسل (استشهاد بطرس وبولس)', type: 'feast', note: 'من الأعياد الرسلية.' },
    { month: 12, day: 16, name: 'عيد صعود جسد العذراء مريم', type: 'feast', note: 'بعد صوم العذراء (1–15 مسرى).' },
    { month: 13, day: 5, name: 'نهاية السنة القبطية', type: 'season', note: 'اليوم الأخير (النسيء).' }
  ];

  /* ---------- السنكسار: مدخلات محدودة موثّقة ---------- *
   * ⚠️ لا نص سنكساري كامل بدون مصدر مرخّص.
   * المعروض: تذكار اليوم + نبذة قصيرة + أحكام المصدر.
   * الفارغ يظهر NEEDS_ADMIN_INPUT.
   */
  var SINAXAR = [
    {
      month: 1, day: 1, name: 'النيروز — رأس السنة القبطية',
      summary: 'بداية التقويم القبطي «سنة الشهداء» (يبدأ من 284م). يُحتفل فيها بنهاية سنة قبطية وبداية سنة جديدة، وتُترتَّل تهانيها وشِعرها.',
      source_id: 'st_takla', needs_admin_input: false, acceptable: 'نص قصير موثّق'
    },
    {
      month: 7, day: 29, name: 'عيد البشارة',
      summary: 'بشارة الملاك جبرائيل للعذراء مريم بتجسّد الكلمة — من الأعياد السيدية الكبرى.',
      source_id: 'st_takla', needs_admin_input: false, acceptable: 'نص قصير موثّق'
    },
    {
      month: 12, day: 16, name: 'عيد العذراء مريم (صعود جسدها)',
      summary: 'ختام صوم العذراء بخروجها وصعود جسدها — من أقوى أيام الرسوم المريميَّة.',
      source_id: 'st_takla', needs_admin_input: false, acceptable: 'نص قصير موثّق'
    },
    {
      month: 0, day: 0, name: 'مدخلات السنكسار اليومية الكاملة',
      summary: 'السنكسار يحتوي 365 مدخلًا يوميًا. المشروع لا يملك ترخيصًا لنشر النص الكامل ولذلك لا ننشئ نصوصًا غير مؤكدة ولا نخمّنها.',
      source_id: 'tg_senksar', needs_admin_input: true, acceptable: '⚠️ يحتاج مصدرًا مرخّصًا أو إدخالًا يدويًا من لوحة الإدارة'
    }
  ];

  /* ---------- المناسبات المتنقلة (حسابية) ---------- */
  /* تُحسب نسبةً للقيامة (القاعدة: القيامة = الأحد الأول بعد بدر أول ربيع بعد الفصح اليهودي).
     نعرض هنا تذكيرًا بحاجة الحساب التقويمي الدقيق إلى مرجع كنسي سنوي. */
  var MOVABLE = [
    { key: 'lent', name: 'الصوم الكبير', note: '8 أسابيع قبل عيد القيامة (في التقويم القبطي).' },
    { key: 'palm', name: 'أحد الشعانين', note: 'الأحد السابق لأسبوع الآلام.' },
    { key: 'holyweek', name: 'أسبوع الآلام', note: 'الأسبوع الذي يسبق القيامة.' },
    { key: 'resurrection', name: 'عيد القيامة', note: 'أعظم الأعياد السيدية الكبرى.' },
    { key: 'ascension', name: 'عيد الصعود', note: '40 يومًا بعد القيامة.' },
    { key: 'pentecost', name: 'عيد العنصرة', note: '50 يومًا بعد القيامة (حلول الروح القدس).' }
  ];

  /* ---------- تحويل التاريخ الميلادي إلى قبطي (تقويم حسابي قريب) ---------- *
   * القاعدة: السنة القبطية تبدأ 11 أو 12 سبتمبر (حسب السنة الكبيسة).
   * ملاحظة: الحساب هنا تقريبي للعرض التعليمي، والحساب الدقيق يُراجَع.
   */
  function gregorianToCoptic(date) {
    var d = date ? new Date(date) : new Date();
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    var isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    var startMonth = 9, startDay = isLeap ? 12 : 11;   // بداية السنة القبطية
    var cy = y - 283;
    var start = new Date(y, startMonth - 1, startDay);
    if (d < start) { cy = y - 284; start = new Date(y - 1, startMonth - 1, (isLeap ? 12 : 11)); }
    var diffDays = Math.round((d - start) / 86400000);
    var monthIndex = Math.floor(diffDays / 30);
    var dayOfMonth = (diffDays % 30) + 1;
    if (monthIndex > 12) { monthIndex = 12; dayOfMonth = diffDays - 360 + 1; }
    var month = COPTIC_MONTHS[Math.min(monthIndex, 12)];
    return { year: cy, month: month ? month.name : 'النسيء', monthIndex: monthIndex + 1, day: dayOfMonth, monthInfo: month || null };
  }

  /* ---------- عناصر اليوم ---------- */
  function today() {
    var cop = gregorianToCoptic(new Date());
    var feast = FIXED_FEASTS.filter(function (f) { return f.month === cop.monthIndex && f.day === cop.day; })[0] || null;
    var sin = SINAXAR.filter(function (s) { return s.month === cop.monthIndex && s.day === cop.day; })[0] || null;
    return {
      gregorian: Util.arabicDate(),
      coptic: cop,
      copticLabel: cop.day + ' ' + cop.month + ' ' + cop.year + ' ش',
      monthInfo: cop.monthInfo,
      feast: feast,
      sinaxar: sin,
      isKiahk: cop.monthIndex === 4,
      needsInput: !sin || sin.needs_admin_input
    };
  }

  window.Liturgy = {
    months: function () { return COPTIC_MONTHS.slice(); },
    fixedFeasts: function () { return FIXED_FEASTS.slice(); },
    movable: function () { return MOVABLE.slice(); },
    sinaxar: function () { return SINAXAR.slice(); },
    today: today,
    toCoptic: gregorianToCoptic
  };
})();
