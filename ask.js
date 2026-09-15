/* ============================================================
   views/ask.js — «اسأل خادم» (مساعد محلي بدون أي مفتاح API)
   يجيب من قاعدة معرفة داخلية + يعرض المصادر دائمًا أو يقول: لا أعرف.
   ============================================================ */
(function () {
  'use strict';

  var history = [];   /* { role:'user'|'bot', text, sources, hits } */

  function render(main, route) {
    var q = (route.params && route.params.q) ? Util.clampText(route.params.q, window.APP.LIMITS.QUESTION) : '';

    var html = '';

    html += UI.card(
      '<h2>🤖 اسأل «' + Util.esc(window.APP.BOT.NAME) + '»</h2>' +
      '<p class="small muted">مساعد محلي يعمل بالكامل داخل متصفحك — <b>بدون مفتاح API</b>، وبدون إنترنت، وبدون أي حساب. يجيب فقط مما في قاعدة المعرفة الداخلية، ويعرض مصادره دائمًا. ولو ما وجدش المعلومة، يقول بصراحة إنه ما يعرفهاش.</p>' +
      '<div class="hymn-meta">' +
      UI.badge('✅ بدون مفتاح', 'good') +
      UI.badge('📴 يعمل دون إنترنت', 'good') +
      UI.badge('🔒 لا يرسل بياناتك', 'good') +
      UI.badge('🔗 ' + Util.arNum(Bot.stats().total) + ' عنصرًا في القاعدة', 'acc') +
      '</div>', 'gold');

    /* شات */
    html += '<section class="card"><div class="chat-log" id="chatLog" aria-live="polite"></div>' +
      '<div class="chat-input-row">' +
      '<div style="flex:1">' + UI.input('botInput', q, { placeholder: 'اكتب سؤالك… مثال: ايه معنى كيرياليسون؟', maxlength: window.APP.LIMITS.QUESTION }) + '</div>' +
      '<button type="button" class="btn" id="botSend">إرسال</button>' +
      '</div>' +
      '<p class="small muted" style="margin-top:6px">Enter = إرسال • Shift+Enter = سطر جديد</p>' +
      '</section>';

    /* اقتراحات */
    html += UI.card('<h3>💡 أسئلة مقترحة</h3><div class="quick-asks">' +
      Bot.suggestions().map(function (s) {
        return '<button type="button" class="chip" data-ask="' + Util.esc(s) + '">' + Util.esc(s) + '</button>';
      }).join('') + '</div>');

    /* إحصاءات القاعدة */
    var st = Bot.stats();
    html += UI.card('<h3>📊 ما يعرفه خادم</h3><div class="stat-grid">' +
      Object.keys(st.byKind).map(function (k) { return UI.stat(Util.arNum(st.byKind[k]), k); }).join('') +
      '</div>');

    /* سياسة الأمانة */
    html += UI.card('<h3>🛡 سياسة الأمانة (مهم)</h3><ul class="plain-list">' +
      '<li>لا يخترع معلومة ولا يُنشئ مصدرًا: لو العنصر غير موجود في القاعدة، يعتذر.</li>' +
      '<li>لا يتصل بأي خدمة خارجية — لذلك بياناتك وأسئلتك تبقى في جهازك.</li>' +
      '<li>أي عنصر مُعلَّم 📝 NEEDS_ADMIN_INPUT يظهر بوسم تحذيري.</li>' +
      '<li>لا يُعطي فتوى أو إرشادًا روحيًا شخصيًا — للتوجيه الروحي ارجع لأب اعترافك.</li>' +
      '</ul><div class="btn-row">' +
      '<a class="btn ghost sm" href="#/search">🔎 البحث الذكي</a>' +
      '<a class="btn ghost sm" href="#/sources">🔗 سجل المصادر</a>' +
      '<button type="button" class="btn ghost sm" id="botClear">🗑 مسح المحادثة</button>' +
      '</div>', 'warn-card');

    main.innerHTML = html;

    /* الأحداث */
    var input = document.getElementById('botInput');
    var log = document.getElementById('chatLog');
    var send = document.getElementById('botSend');

    function pushMsg(m) {
      history.push(m);
      if (history.length > window.APP.BOT.MAX_HISTORY) history.shift();
      paint(log);
    }

    function ask(text) {
      var t = Util.clampText(String(text || ''), window.APP.LIMITS.QUESTION);
      if (!t) { Util.toast('اكتب سؤالك أولًا 🙏', 'warn'); return; }
      pushMsg({ role: 'user', text: t });
      Store.bump('asks');
      Store.checkBadges();
      if (window.Analytics) Analytics.track('ask', t.slice(0, 60));

      var res = Bot.answer(t);
      setTimeout(function () {
        pushMsg({ role: 'bot', text: res.text, sources: res.sources, hits: res.hits, ok: res.ok, related: res.related });
        if (input) { input.value = ''; input.focus(); }
      }, 220);
    }

    if (send) send.addEventListener('click', function () { ask(input ? input.value : ''); });
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); }
      });
      if (q) setTimeout(function () { ask(q); }, 300);
    }
    main.querySelectorAll('[data-ask]').forEach(function (b) {
      b.addEventListener('click', function () { ask(b.getAttribute('data-ask')); });
    });
    var clr = document.getElementById('botClear');
    if (clr) clr.addEventListener('click', function () { history = []; paint(log); Util.toast('تم مسح المحادثة', ''); });

    paint(log);
  }

  function paint(log) {
    if (!log) return;
    var welcome = {
      role: 'bot', ok: true,
      text: 'أهلًا بيك 🙏 أنا «' + window.APP.BOT.NAME + '» — مساعد تعليمي قبطي.\n\nاسألني عن:\n• الألحان ومعانيها 🎵\n• الطقوس والقداس والأعياد 📖\n• اللغة القبطية والمصطلحات 🔤\n• الشخصيات والتاريخ الكنسي 👑\n• الآيات والمناسبات 📅\n\nولو مش لاقي المعلومة في قاعدة معرفتي، هقولك بصراحة إني مش عارف.',
      sources: []
    };
    var all = history.length ? history : [welcome];

    log.innerHTML = all.map(function (m) {
      if (m.role === 'user') {
        return '<div class="msg user">' + UI.rich(m.text) + '</div>';
      }
      var srcs = (m.sources || []).map(function (s) {
        var name = Util.esc(s.name);
        return s.url
          ? '<a class="badge acc" href="' + Util.esc(Util.safeUrl(s.url)) + '" target="_blank" rel="noopener noreferrer">🔗 ' + name + '</a>'
          : '<span class="badge ' + (s.access_note && /NEEDS_ADMIN_INPUT/.test(s.access_note) ? 'warn' : 'acc') + '">🔗 ' + name + '</span>';
      }).join(' ');

      var hits = (m.hits || []).length ? '<div class="sources"><b>عناصر القاعدة المستخدمة:</b><br>' +
        m.hits.map(function (h) {
          return (h.link ? '<a href="' + Util.esc(Util.safeUrl(h.link)) + '">' + Util.esc(h.kind + ': ' + h.title) + '</a>' : Util.esc(h.kind + ': ' + h.title)) +
            (h.review ? ' <span class="badge warn">📝</span>' : '');
        }).join('<br>') + '</div>' : '';

      var related = (m.related || []).length ? '<div class="sources">جرّب كمان: ' + m.related.map(function (r) { return '<button type="button" class="badge" data-ask="' + Util.esc(r) + '">' + Util.esc(r) + '</button>'; }).join(' ') + '</div>' : '';

      var foot = (srcs || hits || related)
        ? '<div class="sources">' + (srcs ? '<b>المصادر:</b> ' + srcs + '<br>' : '') + hits + related + '</div>'
        : (m.ok ? '<div class="sources small muted">لا مصدر مطابق — الإجابة من الإرشاد العام للمشروع.</div>' : '');

      return '<div class="msg bot">' + UI.rich(m.text) + foot + '</div>';
    }).join('');

    /* تفعيل الأزرار داخل الرسائل */
    log.querySelectorAll('[data-ask]').forEach(function (b) {
      b.addEventListener('click', function () {
        var input = document.getElementById('botInput');
        var text = b.getAttribute('data-ask');
        if (input) input.value = text;
        var send = document.getElementById('botSend');
        if (send) send.click();
      });
    });
    log.scrollTop = log.scrollHeight;
  }

  Router.define('bot', { render: render });
})();
