/* ============================================================
   data/coptic-lang.js — اللغة القبطية
   • 32 حرفًا (24 يونانيًا + 7 ديموطيقي + الرقم ⲋ)
   • الأرقام القبطية (حساب الجُمّل)
   • مصطلحات ليتورجية مع المعنى وموضع الاستخدام
   ⚠️ النطق تقريبي مكتوب بحروف عربية. النطق النهائي
      يُدقَّق مع مرتل قبطي متقن → needs_review على النطق.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- الأبجدية القبطية ---------- */
  var LETTERS = [
    { i: 1, ch: 'Ⲁ', lower: 'ⲁ', name: 'ألفا', translit: 'a', sound: 'أ — كالفتحة', origin: 'يوناني', ex: 'ⲁⲗⲟⲩ (صبي)' },
    { i: 2, ch: 'Ⲃ', lower: 'ⲃ', name: 'فيتا (بيتا)', translit: 'b / v', sound: 'ب / ڤ', origin: 'يوناني', ex: 'ⲃⲏⲑⲗⲉⲉⲙ (بيت لحم)' },
    { i: 3, ch: 'Ⲅ', lower: 'ⲅ', name: 'غاما', translit: 'g', sound: 'ج مصرية / غ', origin: 'يوناني', ex: 'ⲅⲣⲁⲙⲙⲁ (كتابة)' },
    { i: 4, ch: 'Ⲇ', lower: 'ⲇ', name: 'دالدا', translit: 'd', sound: 'د', origin: 'يوناني', ex: 'ⲇⲁⲩⲓⲇ (داود)' },
    { i: 5, ch: 'Ⲉ', lower: 'ⲉ', name: 'إي (إبسيلون)', translit: 'e', sound: 'إ قصيرة', origin: 'يوناني', ex: 'ⲉⲃⲟⲗ (خارج)' },
    { i: 6, ch: 'Ⲍ', lower: 'ⲍ', name: 'زيتا', translit: 'z', sound: 'ز', origin: 'يوناني', ex: 'ⲍⲱⲏ (حياة)' },
    { i: 7, ch: 'Ⲏ', lower: 'ⲏ', name: 'إيتا', translit: 'ē', sound: 'إ طويلة / ي', origin: 'يوناني', ex: 'ⲏⲗⲓ (شمس)' },
    { i: 8, ch: 'Ⲑ', lower: 'ⲑ', name: 'ثيتا', translit: 'th', sound: 'ث', origin: 'يوناني', ex: 'ⲑⲉⲟⲥ (الله)' },
    { i: 9, ch: 'Ⲓ', lower: 'ⲓ', name: 'يوتا', translit: 'i', sound: 'ي', origin: 'يوناني', ex: 'ⲓⲱⲥⲏⲫ (يوسف)' },
    { i: 10, ch: 'Ⲕ', lower: 'ⲕ', name: 'كابا', translit: 'k', sound: 'ك', origin: 'يوناني', ex: 'ⲕⲩⲣⲓⲉ (يا رب)' },
    { i: 11, ch: 'Ⲗ', lower: 'ⲗ', name: 'لافلا', translit: 'l', sound: 'ل', origin: 'يوناني', ex: 'ⲗⲁⲟⲥ (شعب)' },
    { i: 12, ch: 'Ⲙ', lower: 'ⲙ', name: 'مي', translit: 'm', sound: 'م', origin: 'يوناني', ex: 'ⲙⲁⲣⲓⲁ (مريم)' },
    { i: 13, ch: 'Ⲛ', lower: 'ⲛ', name: 'ني', translit: 'n', sound: 'ن', origin: 'يوناني', ex: 'ⲛⲟⲩϯ (الله)' },
    { i: 14, ch: 'Ⲝ', lower: 'ⲝ', name: 'كسي', translit: 'ks', sound: 'كس', origin: 'يوناني', ex: 'ⲝⲩⲗⲟⲛ (خشب)' },
    { i: 15, ch: 'Ⲟ', lower: 'ⲟ', name: 'أو (أوميكرون)', translit: 'o', sound: 'و / أُ', origin: 'يوناني', ex: 'ⲟⲩⲟⲓⲛ (نور)' },
    { i: 16, ch: 'Ⲡ', lower: 'ⲡ', name: 'پي', translit: 'p', sound: 'ب (پ)', origin: 'يوناني', ex: 'ⲡⲛⲉⲩⲙⲁ (روح)' },
    { i: 17, ch: 'Ⲣ', lower: 'ⲣ', name: 'رو', translit: 'r', sound: 'ر', origin: 'يوناني', ex: 'ⲣⲱⲙⲓ (إنسان)' },
    { i: 18, ch: 'Ⲥ', lower: 'ⲥ', name: 'سيما', translit: 's', sound: 'س', origin: 'يوناني', ex: 'ⲥⲱⲧⲏⲣ (مخلّص)' },
    { i: 19, ch: 'Ⲧ', lower: 'ⲧ', name: 'تاف', translit: 't', sound: 'ت', origin: 'يوناني', ex: 'ⲧⲁⲗⲟ (هنا)' },
    { i: 20, ch: 'Ⲩ', lower: 'ⲩ', name: 'هي (إبسيلون)', translit: 'u / v', sound: 'و / ڤ', origin: 'يوناني', ex: 'ⲩⲓⲟⲥ (ابن)' },
    { i: 21, ch: 'Ⲫ', lower: 'ⲫ', name: 'في', translit: 'ph', sound: 'ف', origin: 'يوناني', ex: 'ⲫⲓⲱⲧ (الآب)' },
    { i: 22, ch: 'Ⲭ', lower: 'ⲭ', name: 'خي (كاي)', translit: 'kh', sound: 'خ', origin: 'يوناني', ex: 'ⲭⲣⲓⲥⲧⲟⲥ (المسيح)' },
    { i: 23, ch: 'Ⲯ', lower: 'ⲯ', name: 'إپسي', translit: 'ps', sound: 'پس', origin: 'يوناني', ex: 'ⲯⲁⲗⲙⲟⲥ (مزمور)' },
    { i: 24, ch: 'Ⲱ', lower: 'ⲱ', name: 'أوميغا', translit: 'ō', sound: 'و طويلة', origin: 'يوناني', ex: 'ⲱⲛϩ (حياة)' },
    { i: 25, ch: 'Ϣ', lower: 'ϣ', name: 'شاي', translit: 'sh', sound: 'ش', origin: 'ديموطيقي', ex: 'ϣⲗⲏⲗ (صلِّ)' },
    { i: 26, ch: 'Ϥ', lower: 'ϥ', name: 'فاي', translit: 'f', sound: 'ف', origin: 'ديموطيقي', ex: 'ϥⲓⲱⲧ (أبوه)' },
    { i: 27, ch: 'Ϧ', lower: 'ϧ', name: 'خاي', translit: 'ḫ', sound: 'خ (من الحلق)', origin: 'ديموطيقي', ex: 'ϧⲉⲛ (في)' },
    { i: 28, ch: 'Ϩ', lower: 'ϩ', name: 'هوري', translit: 'h', sound: 'ه', origin: 'ديموطيقي', ex: 'ϩⲱⲥ (تسبيح)' },
    { i: 29, ch: 'Ϫ', lower: 'ϫ', name: 'جانجا', translit: 'j', sound: 'ج', origin: 'ديموطيقي', ex: 'ϫⲟⲉⲓⲥ (رب)' },
    { i: 30, ch: 'Ϭ', lower: 'ϭ', name: 'تشيما', translit: 'ch', sound: 'تش', origin: 'ديموطيقي', ex: 'ϭⲓⲛⲙⲓⲥⲓ (الميلاد)' },
    { i: 31, ch: 'Ϯ', lower: 'ϯ', name: 'تي', translit: 'ti', sound: 'تي', origin: 'ديموطيقي', ex: 'ϯⲉⲕⲕⲗⲏⲥⲓⲁ (الكنيسة)' },
    { i: 32, ch: 'Ⲋ', lower: 'ⲋ', name: 'سو (الرقم ٦)', translit: '—', sound: 'حرف عددي', origin: 'ديموطيقي', ex: 'يُستخدم كرقم ٦ في الأرقام القبطية' }
  ];

  /* ---------- الأرقام القبطية (حساب الجُمّل) ---------- */
  var NUMERALS = [
    { v: 1, ch: 'Ⲁ' }, { v: 2, ch: 'Ⲃ' }, { v: 3, ch: 'Ⲅ' }, { v: 4, ch: 'Ⲇ' }, { v: 5, ch: 'Ⲉ' },
    { v: 6, ch: 'Ⲋ' }, { v: 7, ch: 'Ⲍ' }, { v: 8, ch: 'Ⲏ' }, { v: 9, ch: 'Ⲑ' }, { v: 10, ch: 'Ⲓ' },
    { v: 20, ch: 'Ⲕ' }, { v: 30, ch: 'Ⲗ' }, { v: 40, ch: 'Ⲙ' }, { v: 50, ch: 'Ⲛ' }, { v: 60, ch: 'Ⲝ' },
    { v: 70, ch: 'Ⲟ' }, { v: 80, ch: 'Ⲡ' }, { v: 90, ch: 'Ϥ' }, { v: 100, ch: 'Ⲣ' }, { v: 200, ch: 'Ⲥ' },
    { v: 300, ch: 'Ⲧ' }, { v: 400, ch: 'Ⲩ' }, { v: 500, ch: 'Ⲫ' }, { v: 600, ch: 'Ⲭ' }, { v: 700, ch: 'Ⲯ' },
    { v: 800, ch: 'Ⲱ' }, { v: 900, ch: 'Ϣ' }
  ];

  /* ---------- المصطلحات الليتورجية ---------- */
  var WORDS = [
    { coptic: 'Ⲫⲛⲟⲩϯ / Ⲡⲓⲛⲟⲩϯ', translit: 'Phi-nouti / Pi-nouti', ar: 'الله', where: 'كل الصلوات', key: true },
    { coptic: 'Ⲡⲓϭⲟⲉⲓⲥ', translit: 'Pi-jois', ar: 'الرب / السيد', where: 'القداس والتسبحة', key: true },
    { coptic: 'Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ', translit: 'Pi-khristos', ar: 'المسيح (الممسوح)', where: 'القداس', key: true },
    { coptic: 'Ⲓⲏⲥⲟⲩⲥ', translit: 'Iisous', ar: 'يسوع', where: 'القداس والإنجيل', key: true },
    { coptic: 'Ⲡⲓⲡⲛⲉⲩⲙⲁ ⲉⲧⲟⲩⲁⲃ', translit: 'Pi-epnevma etouab', ar: 'الروح القدس', where: 'لحن القداس', key: true },
    { coptic: 'Ⲡⲁⲧⲉⲣ ⲏⲙⲱⲛ', translit: 'Pater imon', ar: 'أبانا الذي في السموات', where: 'قبل التسليمات', key: true },
    { coptic: 'Ⲕⲩⲣⲓⲉ ⲉⲗⲉⲏⲥⲟⲛ', translit: 'Kyrie eleison', ar: 'يا رب ارحم', where: 'كل الطلبات', key: true },
    { coptic: 'Ⲁⲅⲓⲟⲥ', translit: 'Agios', ar: 'قدوس', where: 'لحن القداس', key: true },
    { coptic: 'Ⲁⲙⲏⲛ', translit: 'Amen', ar: 'آمين (استجب)', where: 'كل الصلوات', key: true },
    { coptic: 'Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ', translit: 'Alleluia', ar: 'سبّحوا للرب', where: 'التسبحة والقداس', key: true },
    { coptic: 'Ⲙⲁⲣⲓⲁ', translit: 'Maria', ar: 'مريم', where: 'الثيؤطوكية والمدائح', key: false },
    { coptic: 'Ϯⲑⲉⲟⲧⲟⲕⲟⲥ', translit: 'Ti-theotokos', ar: 'والدة الإله', where: 'التسبحة', key: false },
    { coptic: 'Ⲡⲓⲁⲅⲅⲉⲗⲟⲥ', translit: 'Pi-angelos', ar: 'الملاك', where: 'الطلبات والمدائح', key: false },
    { coptic: 'Ϯⲉⲕⲕⲗⲏⲥⲓⲁ', translit: 'Ti-ekklisia', ar: 'الكنيسة', where: 'الطلبات', key: false },
    { coptic: 'Ⲡⲓⲗⲁⲟⲥ', translit: 'Pi-laos', ar: 'الشعب', where: 'ردود الجماعة', key: false },
    { coptic: 'Ⲡⲓⲟⲩⲏⲏⲃ', translit: 'Pi-ouib', ar: 'الكاهن', where: 'القداس', key: false },
    { coptic: 'Ⲡⲓⲇⲓⲁⲕⲱⲛ', translit: 'Pi-diakon', ar: 'الشماس (الخادم)', where: 'القداس والرشومات', key: false },
    { coptic: 'Ⲡⲓⲯⲁⲗⲙⲟⲥ', translit: 'Pi-psalmos', ar: 'المزمور', where: 'القداس', key: false },
    { coptic: 'Ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ', translit: 'Pi-evangelion', ar: 'الإنجيل', where: 'القداس', key: false },
    { coptic: 'Ϣⲗⲏⲗ', translit: 'Shlil', ar: 'صلاة / صلِّ', where: 'الأجبية', key: false },
    { coptic: 'Ⲡⲓⲱⲛϩ', translit: 'Pi-onh', ar: 'الحياة', where: 'الطروحات', key: false },
    { coptic: 'Ⲡⲓⲙⲟⲩ', translit: 'Pi-mou', ar: 'الموت', where: 'الطروحات', key: false },
    { coptic: 'Ⲡⲓⲟⲩⲟⲓⲛ', translit: 'Pi-ouoin', ar: 'النور', where: 'الطروحات', key: false },
    { coptic: 'Ⲡⲁⲡⲁ', translit: 'Papa', ar: 'البابا (الأب)', where: 'الكنيسة', key: false },
    { coptic: 'Ⲁⲛⲁⲥⲧⲁⲥⲓⲥ', translit: 'Anastasis', ar: 'القيامة', where: 'ألحان القيامة', key: false },
    { coptic: 'Ⲭⲉⲣⲉ ⲛⲉ Ⲙⲁⲣⲓⲁ', translit: 'Khere ne Maria', ar: 'السلام لكِ يا مريم', where: 'المدائح المريميَّة', key: false },
    { coptic: 'Ⲡⲓⲥⲧⲉⲩⲱ', translit: 'Pi-stewo', ar: 'أنا أؤمن (قانون الإيمان)', where: 'القداس', key: false },
    { coptic: 'Ⲡⲓϩⲱⲥ', translit: 'Pi-hos', ar: 'التسبيح / الهوس', where: 'التسبحة', key: false }
  ];

  /* ---------- عبارات تدريب قصيرة (للّعبة) ---------- */
  var PHRASES = [
    { coptic: 'Ⲡⲉⲛⲟⲩϯ ⲛⲁⲓ ⲛⲁⲛ', ar: 'يا إلهنا ارحمنا' },
    { coptic: 'Ⲁⲅⲓⲟⲥ ⲟ Ⲑⲉⲟⲥ', ar: 'قدوس الله' },
    { coptic: 'Ⲭⲣⲓⲥⲧⲟⲥ ⲁϥⲧⲱⲛϥ', ar: 'المسيح قام' },
    { coptic: 'Ⲕⲩⲣⲓⲉ ⲉⲗⲉⲏⲥⲟⲛ', ar: 'يا رب ارحم' },
    { coptic: 'Ⲡⲁⲧⲉⲣ ⲏⲙⲱⲛ', ar: 'أبانا الذي في السموات' },
    { coptic: 'Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ', ar: 'سبّحوا للرب' },
    { coptic: 'Ⲡⲓⲡⲛⲉⲩⲙⲁ ⲉⲧⲟⲩⲁⲃ', ar: 'الروح القدس' },
    { coptic: 'Ϯⲑⲉⲟⲧⲟⲕⲟⲥ Ⲙⲁⲣⲓⲁ', ar: 'والدة الإله مريم' },
    { coptic: 'Ⲡⲓϭⲟⲉⲓⲥ ⲡⲉⲛⲛⲟⲩϯ', ar: 'الرب إلهنا' },
    { coptic: 'Ⲡⲓⲱⲛϩ ⲛ̀ⲧⲉ ⲡⲓⲱⲛϩ', ar: 'الحياة الحياة؟ (تحتاج تدقيقًا)' }
  ];

  window.Coptic = {
    letters: function () { return LETTERS.slice(); },
    letterByIndex: function (i) { return LETTERS[i] || null; },
    numerals: function () { return NUMERALS.slice(); },
    words: function () { return WORDS.slice(); },
    keyWords: function () { return WORDS.filter(function (w) { return w.key; }); },
    phrases: function () { return PHRASES.slice(); },
    guessPool: function () {
      /* كلمات مناسبة للعبة فكّ الكلمة (قصيرة ومنفصلة الحروف) */
      return ['Ⲙⲁⲣⲓⲁ', 'Ⲁⲅⲓⲟⲥ', 'Ⲁⲙⲏⲛ', 'Ϣⲗⲏⲗ', 'Ⲡⲁⲡⲁ', 'Ⲡⲓⲱⲛϩ', 'Ⲡⲓⲙⲟⲩ', 'Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ', 'Ⲓⲏⲥⲟⲩⲥ', 'Ⲕⲩⲣⲓⲉ'];
    },
    count: LETTERS.length,
    wordCount: WORDS.length,
    /* لعبة: حوّل حرفًا قبطيًا إلى معلوماته */
    info: function (ch) {
      var found = null;
      LETTERS.forEach(function (L) {
        if (L.ch === ch || L.lower === ch) found = L;
      });
      return found;
    }
  };
})();
