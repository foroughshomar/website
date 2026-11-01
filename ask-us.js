// «از ما بپرسید» moved to app.foroughshomar.ir (1405-08-10): no question box and no public Q&A list on the main site any more.
// /faq/ keeps the page's static «پرسش‌های پرتکرار» and gets a banner to the app; the home page gets a promo banner;
// small "have a question?" links ([data-fs-ask-link]) now point to the app.
(function () {
  var APP = 'https://app.foroughshomar.ir/';
  var d = document.documentElement, lang = d.getAttribute('data-lang') || 'fa', rtl = lang === 'fa' || lang === 'ar';
  var T = lang === 'fa' ? {
      k: 'تازه · پرسش و پاسخ فروغ‌شمار', t: 'سؤالت را بپرس، پاسخ سیمرغ را بگیر',
      p: 'پرسش و پاسخ مالیات، حسابداری، بیمه و حقوق و دستمزد حالا خانه‌ی تازه‌ای دارد. سؤالت را آنجا بپرس، پرسش‌های دیگران را ببین و با «پر سیمرغ» پاسخ دقیق و مستند سیمرغ را بگیر.',
      b: 'ورود به پرسش و پاسخ', link: 'سؤالی دارید؟ در پرسش و پاسخ فروغ‌شمار بپرسید'
    } : {
      k: 'New · ForoughShomar Q&A', t: 'Ask your question, get Simorgh\u2019s answer',
      p: 'Tax, accounting, insurance and payroll questions now have their own home. Ask there, browse other questions, and use a Simorgh feather for a sourced answer.',
      b: 'Open the Q&A', link: 'Have a question? Ask in the ForoughShomar Q&A'
    };
  function css() {
    if (document.getElementById('fs-ask-css')) return;
    var s = document.createElement('style'); s.id = 'fs-ask-css';
    s.textContent = '.fs-app-ban{max-width:56rem;margin:36px auto;padding:0 16px;font-family:inherit}'
      + '.fs-app-ban>a{display:flex;align-items:center;gap:22px;flex-wrap:wrap;padding:26px 28px;border-radius:20px;text-decoration:none;color:#f3ead8;'
      + 'background:radial-gradient(circle at 12% 0%,rgba(212,175,55,.22),transparent 55%),linear-gradient(135deg,#132845,#0b1f3a 60%,#071526);border:1px solid rgba(212,175,55,.55);box-shadow:0 10px 36px rgba(7,21,38,.35);transition:transform .2s,box-shadow .2s}'
      + '.fs-app-ban>a:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(212,175,55,.22)}'
      + '.fs-app-ban .ic{flex:none;width:64px;height:64px;border-radius:16px;display:grid;place-items:center;font-size:32px;background:rgba(212,175,55,.14);border:1px solid rgba(212,175,55,.45)}'
      + '.fs-app-ban .tx{flex:1 1 260px;min-width:0}.fs-app-ban .k{font-size:.8rem;color:#d4af37;letter-spacing:0}.fs-app-ban h2{margin:4px 0 6px;font-size:1.35rem;color:#fff;line-height:1.7}'
      + '.fs-app-ban p{margin:0;line-height:2;font-size:.93rem;color:#d9ccb0}.fs-app-ban .go{flex:none;padding:11px 24px;border-radius:999px;background:#d4af37;color:#0b1f3a;font-weight:600}'
      + '.fs-ask-link{display:inline-flex;align-items:center;gap:6px;margin-top:18px;padding:8px 16px;border:1px solid rgba(212,175,55,.55);border-radius:999px;font-size:.9rem;color:#c9a227!important;text-decoration:none}.fs-ask-link:hover{background:rgba(212,175,55,.12)}';
    document.head.appendChild(s);
  }
  function banner(id) {
    var w = document.createElement('section'); w.id = id; w.className = 'fs-app-ban'; w.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    w.innerHTML = '<a href="' + APP + '"><span class="ic" aria-hidden="true">🪶</span><span class="tx"><span class="k">' + T.k + '</span><h2>' + T.t + '</h2><p>' + T.p + '</p></span><span class="go">' + T.b + '</span></a>';
    return w;
  }
  function put(id) {
    if (document.getElementById(id)) return;
    var main = document.querySelector('main'); if (!main) return;
    css();
    var hero = main.querySelector('section'), b = banner(id);
    if (hero && hero.parentNode === main) main.insertBefore(b, hero.nextSibling); else main.insertBefore(b, main.firstChild);
  }
  function links() {
    var ls = document.querySelectorAll('[data-fs-ask-link]');
    if (ls.length) css();
    for (var i = 0; i < ls.length; i++) { if (ls[i].className === 'fs-ask-link') continue; ls[i].textContent = '💬 ' + T.link; ls[i].href = APP; ls[i].className = 'fs-ask-link'; }
  }
  function go() {
    links();
    var p = location.pathname;
    if (/^\/faq\/?$/.test(p)) put('ask');
    else if (/^\/(?:(?:en|ar|elv)\/?)?$/.test(p) || p === '/index.html') put('fs-app-promo');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  setTimeout(go, 1500);
  if (window.MutationObserver) {
    var pend = false;
    new MutationObserver(function () { if (pend) return; pend = true; setTimeout(function () { pend = false; go(); }, 80); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }
})();
