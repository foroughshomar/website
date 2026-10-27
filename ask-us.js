// «از ما بپرسید»: question box on /faq/ + small "have a question?" links elsewhere.
// Answers: the browser asks our ParsPack server (RAG knowledge base + xAI, with sources) directly; the signed result is then
// saved on the panel (ask-save.php). If that server can't be reached, it falls back to the panel's own answer (no sources).
(function () {
  var API = 'https://panel.foroughshomar.ir/api/ask.php', SAVE = 'https://panel.foroughshomar.ir/api/ask-save.php',
    RAG = ['https://45-11-186-152.sslip.io', 'https://45.11.186.152'], MAX = 600;
  // two addresses of the same server: the name works inside Iran; the bare IP (no SNI) also passes the filtering for VPN/foreign visitors
  if (/[?&]askapi=local/.test(location.search)) { API = 'http://127.0.0.1:8099/api/ask.php'; SAVE = 'http://127.0.0.1:8099/api/ask-save.php'; }
  if (/[?&]askrag=off/.test(location.search)) RAG = [];
  if (/[?&]askrag=ip/.test(location.search)) RAG = [RAG[1]];
  var d = document.documentElement, lang = d.getAttribute('data-lang') || 'fa', fa = lang === 'fa';
  var T = fa ? {
    t: 'از ما بپرسید', p: 'سؤال مالیاتی، بیمه‌ای یا حسابداری‌تان را بنویسید تا دستیار فروغ‌شمار سیمرغ یک پاسخ عمومی و کوتاه به شما بدهد.',
    lead: 'پاسخ این بخش را <strong>هوش مصنوعیِ اختصاصی و بومی‌شده‌ی فروغ‌شمار سیمرغ</strong> می‌دهد؛ دستیاری که برای مالیات، بیمه و حسابداری ایران آماده شده و پاسخ‌هایش را بر پایه‌ی قانون‌ها، آیین‌نامه‌ها و بخشنامه‌های رسمی می‌نویسد و منبع هر پاسخ را هم کنارش نشان می‌دهد.',
    pts: ['پاسخ‌ها دقیق و مستند به منابع رسمی‌اند، اما جای <strong>مشاوره‌ی تخصصی</strong> برای پرونده‌ی شما را نمی‌گیرند. <a href="/contact/" class="fs-ask-cta">رزرو مشاوره</a>',
      'ممکن است سؤال‌ها و پاسخ‌ها برای استفاده‌ی دیگران در سایت نمایش داده شوند؛ پیش از نمایش، <strong>نام‌ها، نام شرکت‌ها، شماره‌ها، نشانی و هر اطلاعات شخصی یا محرمانه پوشانده می‌شود.</strong>'],
    ph: 'مثلاً: مهلت ارسال اظهارنامه‌ی مالیات بر اجاره تا کی است؟', b: 'پرسیدن', w: 'در حال آماده کردن پاسخ… ممکن است تا یک دقیقه طول بکشد.',
    short: 'لطفاً سؤالتان را کامل‌تر بنویسید.', err: 'الان امکان پاسخ‌گویی نیست. لطفاً کمی بعد دوباره امتحان کنید.',
    na: 'این بخش به‌زودی فعال می‌شود. تا آن زمان می‌توانید مشاوره رزرو کنید.', link: 'سؤال دارید؟ از ما بپرسید', again: 'سؤال دیگری دارید؟ دوباره بپرسید.'
  } : {
    t: 'Ask us', p: 'Write your tax, insurance or accounting question and the Forough Shomar Simorgh assistant will give you a short, general answer.',
    lead: 'Answers here come from <strong>Forough Shomar Simorgh\'s own AI assistant, tailored to Iran</strong>: built for Iranian tax, insurance and accounting, it writes its answers from official laws, regulations and circulars and shows the source next to each answer.',
    pts: ['Answers are accurate and source-based, but they do not replace <strong>expert advice</strong> for your own case. <a href="/contact/" class="fs-ask-cta">Book a consultation</a>',
      'Questions and answers may be shown on the site to help others; before that, <strong>names, company names, numbers, addresses and any personal or confidential details are hidden.</strong>'],
    ph: 'e.g. When is the rental income tax return due?', b: 'Ask', w: 'Preparing your answer… this can take up to a minute.',
    short: 'Please write your question in a bit more detail.', err: 'We cannot answer right now. Please try again a little later.',
    na: 'This service will be available soon. Meanwhile you can book a consultation.', link: 'Have a question? Ask us', again: 'Another question? Ask again.'
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function fmt(s) {
    var out = [], list = null;
    esc(s).split(/\n/).forEach(function (ln) {
      ln = ln.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener nofollow">$1</a>').replace(/\[([^\]]+)\]\((\/[a-z\-\/]*)\)/g, '<a href="$2" class="fs-ask-cta">$1</a>');
      if (/^\s*[-•]\s+/.test(ln)) { if (!list) { list = []; } list.push('<li>' + ln.replace(/^\s*[-•]\s+/, '') + '</li>'); return; }
      if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; }
      if (/^\s*---\s*$/.test(ln)) out.push('<hr>'); else if (ln.trim()) out.push('<p>' + ln + '</p>');
    });
    if (list) out.push('<ul>' + list.join('') + '</ul>');
    return out.join('');
  }
  function css() {
    if (document.getElementById('fs-ask-css')) return;
    var s = document.createElement('style'); s.id = 'fs-ask-css';
    s.textContent = '.fs-ask{max-width:48rem;margin:40px auto 0;padding:0 16px}.fs-ask-box{border:1px solid rgba(212,175,55,.45);border-radius:14px;background:var(--color-navy-soft,#12294a);padding:22px;color:inherit;box-shadow:0 8px 30px rgba(11,31,58,.12)}'
      + '.fs-ask-intro{margin:6px 0 16px;padding:14px 16px;border-radius:10px;background:rgba(212,175,55,.10);border:1px solid rgba(212,175,55,.30);line-height:2;font-size:.95rem}.fs-ask-intro p{margin:0 0 6px}.fs-ask-intro ul{margin:0;padding-inline-start:20px;list-style:none}.fs-ask-intro li{position:relative;margin:4px 0}.fs-ask-intro li:before{content:"✦";position:absolute;inset-inline-start:-18px;color:#d4af37;font-size:.8rem}.fs-ask-intro .fs-ask-cta{display:inline-block;margin-inline-start:6px;padding:0 12px;border-radius:8px;background:#d4af37;color:#0b1f3a!important;text-decoration:none;font-weight:600;font-size:.88rem;line-height:1.9}'
      + '.fs-ask h2{margin:0 0 6px;font-size:1.4rem;color:#c9a227}.fs-ask .fs-ask-p{margin:0 0 14px;line-height:2;font-size:.95rem;opacity:.85}'
      + '.fs-ask textarea{width:100%;box-sizing:border-box;min-height:110px;border:1px solid rgba(212,175,55,.5);border-radius:10px;padding:12px;font:inherit;line-height:1.9;background:rgba(255,255,255,.96);color:#0b1f3a;resize:vertical}'
      + '.fs-ask textarea:focus{outline:2px solid #d4af37;outline-offset:1px}.fs-ask-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;flex-wrap:wrap}'
      + '.fs-ask-cnt{font-size:12px;opacity:.65}.fs-ask button{min-height:44px;padding:0 26px;border:0;border-radius:8px;background:#d4af37;color:#0b1f3a;font:inherit;font-weight:600;cursor:pointer}.fs-ask button[disabled]{opacity:.6;cursor:wait}'
      + '.fs-ask-st{margin-top:14px;font-size:.92rem;line-height:1.9}.fs-ask-st.err{color:#c0392b}.fs-ask-st .fs-sp{display:inline-block;width:14px;height:14px;border:2px solid #d4af37;border-top-color:transparent;border-radius:50%;vertical-align:middle;margin-inline-end:8px;animation:fsspin .8s linear infinite}@keyframes fsspin{to{transform:rotate(360deg)}}'
      + '.fs-ask-ans{margin-top:16px;padding:16px 18px;border-radius:10px;background:rgba(212,175,55,.08);border-inline-start:3px solid #d4af37;line-height:2.1;font-size:.97rem}.fs-ask-ans p{margin:0 0 8px}.fs-ask-ans ul{margin:0 0 8px;padding-inline-start:20px;list-style:disc}.fs-ask-ans hr{border:0;border-top:1px dashed rgba(212,175,55,.5);margin:12px 0}'
      + '.fs-ask-ans a{color:#c9a227;text-decoration:underline;word-break:break-word}.fs-ask-ans .fs-ask-cta{display:inline-block;margin-top:4px;padding:4px 14px;border-radius:8px;background:#d4af37;color:#0b1f3a!important;text-decoration:none;font-weight:600}'
      + '.fs-ask-link{display:inline-flex;align-items:center;gap:6px;margin-top:18px;padding:8px 16px;border:1px solid rgba(212,175,55,.55);border-radius:999px;font-size:.9rem;color:#c9a227!important;text-decoration:none}.fs-ask-link:hover{background:rgba(212,175,55,.12)}';
    document.head.appendChild(s);
  }
  function links() {
    var ls = document.querySelectorAll('[data-fs-ask-link]');
    if (ls.length) css();
    for (var i = 0; i < ls.length; i++) { if (ls[i].className === 'fs-ask-link') continue; ls[i].textContent = '💬 ' + T.link; ls[i].href = '/faq/#ask'; ls[i].className = 'fs-ask-link'; }
  }
  var W = null;   // the question box; kept so it survives React re-rendering the page (re-inserted with its state)
  function place(w) {
    var main = document.querySelector('main'); if (!main) return false;
    var hero = main.querySelector('section'); if (hero && hero.nextSibling) main.insertBefore(w, hero.nextSibling); else main.insertBefore(w, main.firstChild);
    return true;
  }
  function box() {
    if (!/^\/faq\/?$/.test(location.pathname)) return;
    if (W) { if (!document.contains(W)) { var old = document.getElementById('ask'); if (old && old !== W) old.remove(); place(W); } return; }
    if (document.getElementById('ask')) return;
    var main = document.querySelector('main'); if (!main) return;
    css();
    var w = document.createElement('section'); w.id = 'ask'; w.className = 'fs-ask'; w.setAttribute('dir', fa || lang === 'ar' ? 'rtl' : 'ltr');
    w.innerHTML = '<div class="fs-ask-box"><h2>' + T.t + '</h2><div class="fs-ask-intro"><p>' + T.lead + '</p><ul>' + T.pts.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div><p class="fs-ask-p">' + T.p + '</p><form novalidate><input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%)" aria-hidden="true">'
      + '<textarea name="q" maxlength="' + MAX + '" placeholder="' + esc(T.ph) + '" aria-label="' + esc(T.t) + '"></textarea><div class="fs-ask-row"><span class="fs-ask-cnt">0 / ' + MAX + '</span><button type="submit">' + T.b + '</button></div></form>'
      + '<div class="fs-ask-st" role="status" aria-live="polite"></div><div class="fs-ask-ans" hidden></div></div>';
    place(w); W = w;
    var f = w.querySelector('form'), ta = f.q, btn = f.querySelector('button'), st = w.querySelector('.fs-ask-st'), ans = w.querySelector('.fs-ask-ans'), cnt = w.querySelector('.fs-ask-cnt');
    ta.addEventListener('input', function () { cnt.textContent = ta.value.length + ' / ' + MAX; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = ta.value.trim();
      if (q.length < 8) { st.className = 'fs-ask-st err'; st.textContent = T.short; return; }
      btn.disabled = true; ans.hidden = true; st.className = 'fs-ask-st'; st.innerHTML = '<span class="fs-sp"></span>' + T.w;
      var body = { question: q, lang: lang, website: f.website.value };
      function show(j) {
        if (j.ok && j.answer) { st.textContent = ''; ans.innerHTML = fmt(j.answer) + '<p style="margin-top:10px;font-size:.85rem;opacity:.7">' + T.again + '</p>'; ans.hidden = false; ta.value = ''; cnt.textContent = '0 / ' + MAX; }
        else { st.className = 'fs-ask-st err'; st.innerHTML = (j.status === 503 || j.status === 404 || !j.error) ? esc(T.na) + ' <a href="/contact/" class="fs-ask-cta" style="text-decoration:underline">' + (fa ? 'رزرو مشاوره' : 'Book a consultation') + '</a>' : esc(j.error || T.err); }
      }
      function fail() { st.className = 'fs-ask-st err'; st.innerHTML = esc(T.na) + ' <a href="/contact/" style="text-decoration:underline">' + (fa ? 'رزرو مشاوره' : 'Book a consultation') + '</a>'; }
      function post(url, data, ms) {
        var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
        return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctl ? ctl.signal : undefined, keepalive: ms < 20000 })
          .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { j.status = r.status; return j; }); })
          .then(function (j) { clearTimeout(tm); return j; }, function (e) { clearTimeout(tm); throw e; });
      }
      function probe() {   // quick reachability check (both addresses at once; first to answer wins) so nobody waits
        if (!RAG.length || !window.fetch) return Promise.reject(0);
        return new Promise(function (ok, no) {
          var left = RAG.length, done = false, ctls = [];
          var tm = setTimeout(function () { ctls.forEach(function (c) { if (c) c.abort(); }); }, 5000);
          RAG.forEach(function (base) {
            var ctl = window.AbortController ? new AbortController() : null; ctls.push(ctl);
            fetch(base + '/health', { signal: ctl ? ctl.signal : undefined }).then(function (r) { if (!r.ok) throw 0; if (!done) { done = true; clearTimeout(tm); ok(base); } })
              .catch(function () { if (--left === 0 && !done) { clearTimeout(tm); no(0); } });
          });
        });
      }
      function viaPanel() { return post(API, body, 100000).then(show, fail); }
      probe()
        .then(function (base) { return post(base + '/ask', body, 100000); })
        .then(function (j) {
          if (j.ok && j.answer) { show(j); if (j.save) post(SAVE, j.save, 15000).catch(function () {}); return; }
          if (j.status === 422 || j.status === 400) { show(j); return; }   // the question itself was rejected: same answer from the panel
          return viaPanel();
        }, viaPanel)
        .catch(fail)
        .then(function () { btn.disabled = false; });
    });
    if (location.hash === '#ask') setTimeout(function () { w.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }
  function go() { links(); box(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  setTimeout(go, 1500);
  if (window.MutationObserver) {
    var pend = false;
    new MutationObserver(function () { if (pend) return; pend = true; setTimeout(function () { pend = false; go(); }, 50); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }
})();
