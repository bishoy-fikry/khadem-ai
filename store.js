/* ============================================================
   core/store.js — التخزين المحلي (الملف الشخصي، XP، الشعارات، الملاحظات)
   لا يخزّن أي مفتاح أو بيانات شخصية.
   ============================================================ */
(function () {
  'use strict';

  var LS = (window.APP && window.APP.LS) || {};
  var S = {};

  var DEFAULT_PROFILE = {
    xp: 0,
    quizzes: 0,
    perfectRuns: 0,
    bestStreak: 0,
    copticTrained: 0,
    copticWords: 0,
    hymnSessions: 0,
    dayStreak: 0,
    lastDay: '',
    memoryWins: 0,
    wordWins: 0,
    verseWins: 0,
    asks: 0,
    shares: 0,
    pages: {},
    badges: [],
    interests: {},
    doneDaily: {},
    doneVerses: {},
    recent: []
  };

  /* ---------- قراءة/كتابة آمنة ---------- */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v === null || v === undefined ? fallback : v;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  S.read = read;
  S.write = write;

  /* ---------- إزالة أي مفاتيح قديمة حسّاسة (تنظيف أمني) ---------- */
  S.purgeLegacySecrets = function () {
    var removed = [];
    try {
      var key = LS.OLD_KEY || 'gemini_key';
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        removed.push(key);
      }
      // أي مفتاح يشبه مفاتيح Google/API في التخزين المحلي
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (/key|token|secret|api/i.test(k) && k !== (LS.NOTES || '')) {
          var val = localStorage.getItem(k) || '';
          if (/^AIza|^sk-|^ghp_|^[A-Za-z0-9_-]{32,}$/.test(val.trim())) {
            localStorage.removeItem(k);
            removed.push(k);
          }
        }
      }
      if (removed.length) {
        var prev = read(LS.REMOVED, []);
        write(LS.REMOVED, prev.concat(removed).slice(-20));
      }
    } catch (e) { }
    return removed;
  };

  /* ---------- الملف الشخصي ---------- */
  S.get = function () {
    var p = read(LS.PROFILE, null);
    if (!p || typeof p !== 'object') p = {};
    var out = {};
    Object.keys(DEFAULT_PROFILE).forEach(function (k) {
      out[k] = (p[k] === undefined || p[k] === null) ? JSON.parse(JSON.stringify(DEFAULT_PROFILE[k])) : p[k];
    });
    return out;
  };
  S.save = function (p) { write(LS.PROFILE, p); return p; };

  /* تعديل جزئي */
  S.update = function (patch) {
    var p = S.get();
    Object.keys(patch || {}).forEach(function (k) { p[k] = patch[k]; });
    S.save(p);
    return p;
  };

  /* زيادة إحصائية */
  S.bump = function (key, by) {
    var p = S.get();
    p[key] = Number(p[key] || 0) + (by === undefined ? 1 : Number(by));
    S.save(p);
    if (key === 'bestStreak' || key === 'dayStreak' || key === 'quizzes') { }
    return p[key];
  };

  /* تسجيل زيارة صفحة (بلا أي بيانات شخصية) */
  S.visit = function (path) {
    var p = S.get();
    p.pages = p.pages || {};
    p.pages[path] = Number(p.pages[path] || 0) + 1;
    S.save(p);
  };

  /* ---------- XP والمستويات ---------- */
  S.level = function (xp) {
    var levels = (window.APP && window.APP.LEVELS) || [{ min: 0, name: 'مبتدئ', icon: '🌱' }];
    var lv = levels[0], next = null;
    for (var i = 0; i < levels.length; i++) {
      if ((xp || 0) >= levels[i].min) lv = levels[i];
      if ((xp || 0) < levels[i].min && !next) next = levels[i];
    }
    var floor = lv.min, ceil = next ? next.min : lv.min;
    return {
      index: levels.indexOf(lv),
      name: lv.name,
      icon: lv.icon,
      next: next ? next.name : null,
      nextMin: next ? next.min : null,
      progress: next ? Math.round(((xp - floor) / (ceil - floor)) * 100) : 100,
      remaining: next ? Math.max(0, next.min - xp) : 0
    };
  };

  S.addXP = function (amount, reason) {
    var p = S.get();
    var gain = Math.max(0, Math.min(500, Number(amount || 0)));
    var before = S.level(p.xp).index;
    p.xp = Number(p.xp || 0) + gain;
    if (reason) {
      p.recent = (p.recent || []).concat([{ r: String(reason).slice(0, 60), x: gain, t: Date.now() }]).slice(-20);
    }
    S.save(p);
    var after = S.level(p.xp);
    S.checkBadges();
    return { gain: gain, xp: p.xp, level: after, leveledUp: after.index > before };
  };

  /* ---------- الشعارات ---------- */
  S.badges = function () {
    var p = S.get();
    var defs = (window.APP && window.APP.BADGES) || [];
    var earned = [];
    defs.forEach(function (b) {
      try { if (b.test(p)) earned.push(b.id); } catch (e) { }
    });
    return earned;
  };
  S.checkBadges = function () {
    var p = S.get();
    var earned = S.badges();
    var had = p.badges || [];
    var fresh = earned.filter(function (id) { return had.indexOf(id) === -1; });
    if (fresh.length) {
      p.badges = earned;
      S.save(p);
      if (window.Util && Util.toast) {
        var defs = (window.APP && window.APP.BADGES) || [];
        fresh.forEach(function (id) {
          var d = defs.filter(function (x) { return x.id === id; })[0];
          if (d) Util.toast('شعار جديد: ' + d.icon + ' ' + d.label, 'good', 4200);
        });
      }
    } else if ((p.badges || []).length !== earned.length) {
      p.badges = earned; S.save(p);
    }
    return earned;
  };

  /* ---------- السلسلة اليومية ---------- */
  S.touchDay = function () {
    var p = S.get();
    var today = Util.dayKey();
    if (p.lastDay === today) return p.dayStreak;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yKey = Util.dayKey(y);
    p.dayStreak = (p.lastDay === yKey) ? Number(p.dayStreak || 0) + 1 : 1;
    p.lastDay = today;
    S.save(p);
    S.checkBadges();
    return p.dayStreak;
  };

  /* ---------- الاهتمامات (للتوصيات) ---------- */
  S.interest = function (cat) {
    if (!cat) return;
    var p = S.get();
    p.interests = p.interests || {};
    p.interests[cat] = Number(p.interests[cat] || 0) + 1;
    S.save(p);
  };

  /* ---------- اسم اللاعب (مستعار — تنقية إلزامية) ---------- */
  S.playerName = function () {
    var n = read(LS.PLAYER, '');
    return typeof n === 'string' ? n : '';
  };
  S.setPlayerName = function (name) {
    var clean = Util.clampText(String(name || ''), (window.APP.LIMITS.NICK)) || 'لاعب';
    write(LS.PLAYER, clean);
    return clean;
  };

  /* ---------- معرّف جلسة عشوائي (بلا هوية) ---------- */
  S.sessionId = function () {
    var id = read(LS.SESSION, '');
    if (!id || typeof id !== 'string') {
      id = 's' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      write(LS.SESSION, id);
    }
    return id;
  };

  /* ---------- المسودات المحلية (لوحة الإدارة) ---------- */
  S.drafts = function () {
    var d = read(LS.DRAFTS, { questions: [], sources: [], content: [] });
    return { questions: d.questions || [], sources: d.sources || [], content: d.content || [] };
  };
  S.addDraft = function (kind, item) {
    var d = S.drafts();
    if (!d[kind]) d[kind] = [];
    item.__draftId = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    d[kind].push(item);
    write(LS.DRAFTS, d);
    return item;
  };
  S.removeDraft = function (kind, id) {
    var d = S.drafts();
    d[kind] = (d[kind] || []).filter(function (x) { return x.__draftId !== id && x.id !== id; });
    write(LS.DRAFTS, d);
    return d;
  };
  S.clearDrafts = function () { write(LS.DRAFTS, { questions: [], sources: [], content: [] }); };

  /* ---------- نتائج احتياطية (لو تعذّر الاتصال بقاعدة البيانات) ---------- */
  S.localScores = function () { return read(LS.LOCAL_SCORES, []); };
  S.addLocalScore = function (row) {
    var all = S.localScores();
    all.push(row);
    write(LS.LOCAL_SCORES, all.slice(-60));
    return all;
  };

  /* ---------- الملاحظات الشخصية ---------- */
  S.notes = function () { return read(LS.NOTES, []); };
  S.addNote = function (text) {
    var t = Util.clampText(String(text || ''), window.APP.LIMITS.NOTE);
    if (!t) return null;
    var all = S.notes();
    all.unshift({ id: 'n' + Date.now().toString(36), text: t, t: Date.now() });
    write(LS.NOTES, all.slice(0, 100));
    return t;
  };
  S.removeNote = function (id) {
    write(LS.NOTES, S.notes().filter(function (n) { return n.id !== id; }));
  };

  /* ---------- عدّاد التسبحة ---------- */
  S.tasbeha = function () { return read(LS.TASBEHA, { total: 0, sessions: [] }); };
  S.addTasbeha = function (count) {
    var t = S.tasbeha();
    t.total = Number(t.total || 0) + Number(count || 0);
    t.sessions = (t.sessions || []).concat([{ t: Date.now(), c: Number(count || 0) }]).slice(-30);
    write(LS.TASBEHA, t);
    return t;
  };

  /* ---------- التفضيلات ---------- */
  S.prefs = function () { return read(LS.PREFS, { theme: '', hymnView: 'cards', bigText: false }); };
  S.setPref = function (k, v) { var p = S.prefs(); p[k] = v; write(LS.PREFS, p); return p; };

  /* ---------- تصفير كل شيء (بموافقة المستخدم) ---------- */
  S.resetAll = function () {
    [LS.PROFILE, LS.PLAYER, LS.ANALYTICS, LS.DRAFTS, LS.LOCAL_SCORES, LS.NOTES, LS.TASBEHA, LS.PREFS]
      .forEach(function (k) { try { if (k) localStorage.removeItem(k); } catch (e) { } });
  };

  window.Store = S;
})();
