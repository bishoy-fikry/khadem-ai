/* ============================================================
   البوت القبطي التعليمي — الإعدادات المركزية (config.js)
   لا يوجد أي مفتاح API هنا. المساعد يعمل محليًا في المتصفح.
   ============================================================ */
(function () {
  'use strict';

  window.APP = {
    NAME: 'البوت القبطي التعليمي',
    SHORT: 'خادم',
    VERSION: '3.0.0',
    BUILD: '2026-09',
    MOTTO: 'معلومة موثّقة أو لا معلومة… الأمانة قبل الكمّ',

    /* ------- مفاتيح التخزين المحلي (نفس مفاتيح النسخة القديمة قدر الإمكان) ------- */
    LS: {
      OLD_KEY: 'gemini_key',          // يُمسح تلقائيًا (لم نعد نستخدم أي مفتاح)
      PROFILE: 'khadem_profile',
      PLAYER: 'khadem_player_name',
      SESSION: 'khadem_session_id',
      ANALYTICS: 'khadem_analytics',
      DRAFTS: 'khadem_drafts',
      LOCAL_SCORES: 'khadem_local_scores',
      NOTES: 'khadem_notes',
      TASBEHA: 'khadem_tasbeha',
      PREFS: 'khadem_prefs',
      REMOVED: 'khadem_removed_keys'
    },

    /* ------- أزرار التنقل ------- */
    NAV: [
      { path: '#/home', label: '🏠 الرئيسية' },
      { path: '#/hymns', label: '🎵 الألحان' },
      { path: '#/games', label: '🎮 الألعاب' },
      { path: '#/coptic', label: '🔤 القبطي' },
      { path: '#/bot', label: '🤖 اسأل خادم' },
      { path: '#/search', label: '🔎 بحث' },
      { path: '#/library', label: '📚 المكتبة' },
      { path: '#/liturgy', label: '📅 طقس اليوم' },
      { path: '#/leaderboard', label: '🏆 المتصدرون' },
      { path: '#/profile', label: '👤 ملفي' },
      { path: '#/more', label: '⋯ المزيد' },
      { path: '#/admin', label: '⚙ الإدارة' }
    ],

    /* ------- تصنيفات المحتوى ------- */
    CATEGORIES: [
      { id: 'hymns', label: 'الألحان', icon: '🎵' },
      { id: 'liturgy', label: 'الطقوس والقداسات', icon: '📖' },
      { id: 'bible', label: 'الكتاب المقدس', icon: '📜' },
      { id: 'doctrine', label: 'العقيدة', icon: '🛡' },
      { id: 'history', label: 'التاريخ الكنسي', icon: '🏛' },
      { id: 'figures', label: 'الشخصيات', icon: '👑' },
      { id: 'deacons', label: 'الشمامسة', icon: '🕯' },
      { id: 'language', label: 'اللغة القبطية', icon: '🔤' },
      { id: 'spiritual', label: 'الروحيات', icon: '❤' },
      { id: 'general', label: 'عام', icon: '🧠' }
    ],

    /* ------- أنواع محتوى المكتبة ------- */
    CONTENT_TYPES: [
      { id: 'hymn', label: 'لحن', icon: '🎵' },
      { id: 'liturgy', label: 'طقس', icon: '📖' },
      { id: 'verse', label: 'آية', icon: '✝' },
      { id: 'figure', label: 'شخصية', icon: '👑' },
      { id: 'history', label: 'تاريخ', icon: '🏛' },
      { id: 'deacon', label: 'شماسي', icon: '🕯' },
      { id: 'book', label: 'كتاب (فهرس)', icon: '📕' },
      { id: 'sermon', label: 'عظة (فهرس)', icon: '🎧' },
      { id: 'pope_shenouda', label: 'البابا شنوده', icon: '🕊' },
      { id: 'language', label: 'قبطي', icon: '🔤' }
    ],

    /* ------- الصعوبة والنقاط ------- */
    DIFFICULTY: [
      { id: 'easy', label: 'سهل', icon: '🟢', points: 10 },
      { id: 'medium', label: 'متوسط', icon: '🟡', points: 15 },
      { id: 'hard', label: 'صعب', icon: '🔴', points: 25 },
      { id: 'expert', label: 'خبير', icon: '🔥', points: 40 }
    ],

    /* ------- أوضاع المسابقة ------- */
    QUIZ_MODES: [
      { id: 'quick', label: 'سريعة', icon: '⚡', desc: '10 أسئلة عشوائية' },
      { id: 'daily', label: 'تحدي اليوم', icon: '🔥', desc: 'نفس الأسئلة للجميع اليوم' },
      { id: 'speed', label: 'سرعة', icon: '⏱', desc: '60 ثانية فقط' },
      { id: 'multi', label: 'تحدي الأصحاب', icon: '👥', desc: 'غرفة بكود مشترك' },
      { id: 'hymn', label: 'خبير الألحان', icon: '🎵', desc: 'تركيز على الألحان والطقوس' }
    ],

    /* ------- الألعاب ------- */
    GAMES: [
      { id: 'quiz', label: 'مسابقة الأسئلة', icon: '❓', path: '#/quiz/lobby', desc: '5 أوضاع و10 تصنيفات' },
      { id: 'memory', label: 'لعبة الذاكرة', icon: '🧠', path: '#/games/memory', desc: 'طابِق الحرف القبطي مع نطقه' },
      { id: 'word', label: 'فكّ الكلمة', icon: '🔡', path: '#/games/word', desc: 'رتّب الحروف واعرف الكلمة' },
      { id: 'hymn', label: 'وصّل اللحن', icon: '🎵', path: '#/games/hymn', desc: 'لحن ↔ مناسبة ↔ نغمة' },
      { id: 'verse', label: 'أكمل الآية', icon: '✝', path: '#/games/verse', desc: 'أكمل نص الآية' },
      { id: 'daily', label: 'تحدي اليوم', icon: '🔥', path: '#/quiz/lobby?mode=daily', desc: 'تحدٍّ واحد كل يوم' }
    ],

    /* ------- المستويات ------- */
    LEVELS: [
      { min: 0, name: 'مبتدئ', icon: '🌱' },
      { min: 150, name: 'خادم متدرّب', icon: '📗' },
      { min: 400, name: 'قاريء قبطي', icon: '🔤' },
      { min: 800, name: 'خادم نشيط', icon: '⚡' },
      { min: 1500, name: 'مرتل', icon: '🎵' },
      { min: 2600, name: 'معلّم كلمة', icon: '📖' },
      { min: 4200, name: 'شماس', icon: '📜' },
      { min: 6500, name: 'حكيم قبطي', icon: '👑' }
    ],

    /* ------- الشعارات ------- */
    BADGES: [
      { id: 'first_steps', label: 'أول خطوة', icon: '👣', desc: 'أكملت أول مسابقة', test: function (s) { return s.quizzes >= 1; } },
      { id: 'quiz_10', label: 'عاشق المسابقات', icon: '🎮', desc: '10 مسابقات', test: function (s) { return s.quizzes >= 10; } },
      { id: 'quiz_50', label: 'أسطورة المسابقات', icon: '🏅', desc: '50 مسابقة', test: function (s) { return s.quizzes >= 50; } },
      { id: 'perfect', label: 'إجابة كاملة', icon: '💯', desc: '10/10 في مسابقة', test: function (s) { return s.perfectRuns >= 1; } },
      { id: 'streak7', label: 'سبعة متتالية', icon: '🔗', desc: '7 إجابات صحيحة متتالية', test: function (s) { return s.bestStreak >= 7; } },
      { id: 'streak15', label: 'سلسلة نار', icon: '🔥', desc: '15 إجابة صحيحة متتالية', test: function (s) { return s.bestStreak >= 15; } },
      { id: 'coptic_reader', label: 'قاريء قبطي', icon: '🔤', desc: 'تدريب 20 حرفًا قبطيًا', test: function (s) { return s.copticTrained >= 20; } },
      { id: 'coptic_words', label: 'حافظ المصطلحات', icon: '📚', desc: 'تدريب 15 كلمة ليتورجية', test: function (s) { return s.copticWords >= 15; } },
      { id: 'hymn_fan', label: 'مرتل مبتدئ', icon: '🎵', desc: 'أنهيت 5 تدريبات ألحان', test: function (s) { return s.hymnSessions >= 5; } },
      { id: 'hymn_master', label: 'خبير الألحان', icon: '🎼', desc: '25 تدريب ألحان', test: function (s) { return s.hymnSessions >= 25; } },
      { id: 'daily5', label: 'مداوم', icon: '📅', desc: '5 أيام متصلة', test: function (s) { return s.dayStreak >= 5; } },
      { id: 'daily14', label: 'أمانة يومية', icon: '🏵', desc: '14 يومًا متصلة', test: function (s) { return s.dayStreak >= 14; } },
      { id: 'memory_win', label: 'ذاكرة حديدية', icon: '🧠', desc: 'أكملت لعبة الذاكرة', test: function (s) { return s.memoryWins >= 1; } },
      { id: 'word_win', label: 'فكّاك الكلمات', icon: '🔡', desc: 'أكملت 5 كلمات', test: function (s) { return s.wordWins >= 5; } },
      { id: 'verse_win', label: 'حافظ الكلمة', icon: '✝', desc: 'أكملت 5 آيات', test: function (s) { return s.verseWins >= 5; } },
      { id: 'explorer', label: 'مستكشف', icon: '🧭', desc: 'زرت 8 صفحات مختلفة', test: function (s) { return Object.keys(s.pages || {}).length >= 8; } },
      { id: 'asker', label: 'سائل الحكمة', icon: '🤖', desc: '20 سؤالًا للمساعد', test: function (s) { return s.asks >= 20; } },
      { id: 'sharer', label: 'داعية للخير', icon: '📤', desc: 'شاركت نتيجتك مرة', test: function (s) { return s.shares >= 1; } }
    ],

    /* ------- حدود الأمان (تحقق مدخلات) ------- */
    LIMITS: {
      NICK: 20,
      ROOM: 8,
      SEARCH: 80,
      QUESTION: 200,
      MESSAGE: 400,
      NOTE: 2000,
      LEADERBOARD_FETCH: 200
    },

    /* ------- المساعد المحلي (بدون مفتاح/بدون إنترنت) ------- */
    BOT: {
      NAME: 'خادم',
      MAX_HISTORY: 40,
      MIN_SCORE: 2,
      TOP_RESULTS: 4,
      UNKNOWN: 'مش لاقي المعلومة دي في قاعدة المعرفة بتاعتنا، ومعنديش استعداد أخمّن. جرّب صيغة تانية، أو اسأل عن: لحن، طقس، شخصية، آية، شماسي، أو الكلمات القبطية.'
    },

    /* ------- الألحان: المناسبات ------- */
    HYMN_OCCASIONS: [
      { id: 'liturgy', label: 'القداس الإلهي', icon: '📖' },
      { id: 'tasbeha', label: 'التسبحة', icon: '🌙' },
      { id: 'kiahk', label: 'شهر كيهك', icon: '⭐' },
      { id: 'pascha', label: 'أسبوع الآلام والقيامة', icon: '✝' },
      { id: 'lent', label: 'الصوم الكبير', icon: '🕯' },
      { id: 'baptism', label: 'المعمودية', icon: '💧' },
      { id: 'matrimony', label: 'الزفاف', icon: '💍' },
      { id: 'funeral', label: 'الجنازة والنياحة', icon: '🕊' },
      { id: 'daily', label: 'صلوات يومية', icon: '🕰' }
    ],

    /* ------- الألحان: العائلات (النغمات) ------- */
    HYMN_TUNES: [
      { id: 'adam', label: 'اللحن الآدامي (العادي)', desc: 'يُستخدم في الأيام العادية خارج الصيامات' },
      { id: 'watis', label: 'اللحن الواطس (الفرايحي)', desc: 'أيام الأعياد والسبوت والآحاد' },
      { id: 'hazzat', label: 'اللحن الحزايني (الكيهكي)', desc: 'أيام الصيام وأسبوع الآلام وكيهك' }
    ],

    /* ------- أدوار المستخدم (تنظيم محلي في الواجهة فقط) ------- */
    ROLES: {
      viewer: { label: 'زائر', can: [] },
      editor: { label: 'محرّر محتوى (مسودات)', can: ['draft'] },
      admin: { label: 'منظّم (محلي)', can: ['draft', 'send'] }
    },

    SECURITY_NOTE: 'هذه اللوحة أداة تنظيم محلية على جهازك فقط. أي بوابة تحقق مكتوبة بـ JavaScript يمكن قراءتها من كود الصفحة، لذلك لا تضع فيها أي كلمة سر أو مفتاح أو بيانات شخصية. أي تعديل ينشر للجميع يحتاج خدمة خلفية بمصادقة حقيقية.'
  };
})();
