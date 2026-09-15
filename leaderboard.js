/* ============================================================
   views/leaderboard.js — المتصدرون
   ============================================================ */
(function () {
  'use strict';

  var state = { period: 'all', room: '', game: 'quiz', rows: null, loading: false, online: false };

  function render(main, route) {
    if (route.params && route.params.period) state.period = route.params.period;
    if (route.params && route.params.room) state.room = String(route.params.room).toUpperCase().slice(0, window.APP.LIMITS.ROOM);
    if (route.params && route.params.game) state.game = route.params.game;

    var html = '';

    html += UI.card('<h2>🏆 لوحة المتصدرين</h2>' +
      '<p class="small muted">تنافس شريف بلا مال ولا مقامرة. اسأل عن اسمك المستعار من صفحة ملفي.</p>' +
      '<div class="hymn-meta">' + UI.badge(state.online ? '✅ متصل بقاعدة البيانات' : '📴 يعمل محليًا (القاعدة غير متاحة)', state.online ? 'good' : 'warn') + '</div>');

    /* الفترات */
    html += '<div class="card tight"><h3 class="small">الفترة</h3>' +
      UI.chips(Leaderboard.periods(), state.period, 'data-period') + '</div>';

    /* اللعبة */
    html += '<div class="card tight"><h3 class="small">اللعبة</h3>' +
      UI.chips([
        { id: 'quiz', label: 'المسابقة', icon: '❓' },
        { id: 'memory', label: 'الذاكرة', icon: '🧠' },
        { id: 'word', label: 'فكّ الكلمة', icon: '🔡' },
        { id: 'hymn', label: 'وصّل اللحن', icon: '🎵' },
        { id: 'verse', label: 'أكمل الآية', icon: '✝' }
      ], state.game, 'data-game') + '</div>';

    /* غرفة */
    html += '<div class="card tight"><h3 class="small">فلترة بكود غرفة (اختياري)</h3>' +
      '<div class="chat-input-row"><div style="flex:1">' + UI.input('lbRoom', state.room, { placeholder: 'مثال: ABC12', maxlength: window.APP.LIMITS.ROOM }) + '</div>' +
      '<button type="button" class="btn sm" id="lbApply">تطبيق</button></div>' +
      (state.room ? '<p class="small muted">تعرض نتائج الغرفة: <b>' + Util.esc(state.room) + '</b> <button type="button" class="link-btn" id="lbClearRoom">إلغاء</button></p>' : '') + '</div>';

    var body = '<div class="card"><p class="loader">' + (state.loading ? 'جارٍ التحميل' : 'اضغط «تحديث» لعرض النتائج') + '</p></div>';

    if (state.rows) {
      if (!state.rows.length) {
        body = UI.card(UI.empty('لا نتائج في هذه الفترة بعد. كن أول المتصدرين!', '🏁') +
          '<div class="btn-row"><a class="btn gold sm" href="#/quiz/lobby">❓ العب مسابقة</a><a class="btn ghost sm" href="#/games">🎮 كل الألعاب</a></div>');
      } else {
        var me = Store.playerName();
        var myRank = Leaderboard.myRank(state.rows, me);
        var medals = ['🥇', '🥈', '🥉'];

        body = UI.card('<h3>ترتيب اللاعبين</h3>' + UI.itemList(state.rows.slice(0, 30).map(function (r, i) {
          var isMe = r.player_name === me;
          return {
            title: (medals[i] || Util.arNum(i + 1) + '.') + ' ' + r.player_name + (isMe ? ' (أنت)' : ''),
            sub: '',
            meta: UI.badge(Util.arNum(r.score) + ' نقطة', isMe ? 'gold' : '') +
              ' ' + UI.badge(Util.arNum(r.correct) + '/' + Util.arNum(r.total), 'acc') +
              ' ' + UI.badge(gameLabel(r.game)) +
              (r.room ? ' ' + UI.badge('👥 ' + Util.esc(r.room), 'warn') : '') +
              ' <span class="muted">' + Util.esc(Util.ago(r.created_at)) + '</span>' +
              (r.__local ? ' ' + UI.badge('محلي', 'warn') : '')
          };
        })));

        if (myRank.rank) {
          body += UI.card('<h3>موقعك</h3><p>ترتيبك: <b>' + Util.esc(Util.arNum(myRank.rank)) + '</b> من ' + Util.esc(Util.arNum(myRank.of)) + ' لاعبين.' +
            (myRank.entry ? ' أفضل نتيجة: ' + Util.esc(Util.arNum(myRank.entry.score)) + ' نقطة.' : '') + '</p>', 'gold');
        }
      }
    }

    html += UI.card('<div class="btn-row"><button type="button" class="btn" id="lbRefresh">🔄 تحديث</button>' +
      '<a class="btn ghost" href="#/quiz/lobby">❓ العب الآن</a>' +
      '<button type="button" class="btn ghost" id="lbShare">📤 شاركت نتيجتي الأخيرة</button></div>' + body);

    /* ملاحظة تقنية */
    html += UI.card('<h3>ℹ️ كيف تعمل اللوحة؟</h3><ul class="plain-list">' +
      '<li>النتائج تُرسل لجدول قاعدة البيانات عند توفّره (بعد النشر).</li>' +
      '<li>لو تعذّر الاتصال، تُحفظ نتائجك محليًا وتبقى ظاهرة لك مع شارة «محلي».</li>' +
      '<li>لا يمكن التحقق السيرفر-سايد الكامل من النتائج في موقع ثابت — لذلك لا نعتمدها كمسابقة رسمية.</li>' +
      '<li>اسمك مستعار بالكامل، ويمكنك تغييره أو حذف بياناتك في أي وقت من صفحة ملفي.</li>' +
      '</ul>', 'tight');

    main.innerHTML = html;

    /* الأحداث */
    main.querySelectorAll('[data-period]').forEach(function (b) {
      b.addEventListener('click', function () { state.period = b.getAttribute('data-period'); load(); });
    });
    main.querySelectorAll('[data-game]').forEach(function (b) {
      b.addEventListener('click', function () { state.game = b.getAttribute('data-game'); load(); });
    });
    var ap = document.getElementById('lbApply');
    if (ap) ap.addEventListener('click', function () {
      state.room = String(document.getElementById('lbRoom').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, window.APP.LIMITS.ROOM);
      load();
    });
    var cr = document.getElementById('lbClearRoom');
    if (cr) cr.addEventListener('click', function () { state.room = ''; load(); });
    var rf = document.getElementById('lbRefresh');
    if (rf) rf.addEventListener('click', load);
    var sh = document.getElementById('lbShare');
    if (sh) sh.addEventListener('click', function () {
      var p = Store.get();
      Util.toast('نتيجتك الأخيرة: ' + Util.arNum(p.xp) + ' XP • ' + Util.arNum(p.quizzes) + ' مسابقة. شارك التحدي مع أصحابك! 📤', 'good', 4600);
      Store.bump('shares'); Store.checkBadges();
    });

    if (!state.rows) load();

    function load() {
      state.loading = true;
      Router.render(true);
      Leaderboard.fetch({ period: state.period, room: state.room, game: state.game, limit: 100 }).then(function (res) {
        state.rows = res.rows;
        state.online = res.online;
        state.loading = false;
        Router.render(true);
      }).catch(function () {
        state.rows = [];
        state.online = false;
        state.loading = false;
        Router.render(true);
      });
    }
  }

  function gameLabel(g) {
    var map = { quiz: 'مسابقة', memory: 'ذاكرة', word: 'فكّ كلمة', hymn: 'وصّل اللحن', verse: 'أكمل الآية', daily: 'تحدي اليوم' };
    return map[g] || g;
  }

  Router.define('leaderboard', { render: render });
})();
