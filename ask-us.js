// «از ما بپرسید»: question box on /faq/ + small "have a question?" links elsewhere.
// Answers: the browser asks our ParsPack server (RAG knowledge base + xAI, with sources) directly; the signed result is then
// saved on the panel (ask-save.php). If that server can't be reached, it falls back to the panel's own answer (no sources).
// Optional e-mail: sent ONLY to the panel (never to the answer server); the panel e-mails the answer once.
// Below the box: «پرسش‌های پرتکرار» (collapsible, from the page) and the public list of asked questions (masked copies only,
// from the panel's ask-list.php), newest first, with load-more.
(function () {
  var API = 'https://panel.foroughshomar.ir/api/ask.php', SAVE = 'https://panel.foroughshomar.ir/api/ask-save.php', LIST = 'https://panel.foroughshomar.ir/api/ask-list.php',
    RAG = ['https://45-11-186-152.sslip.io', 'https://45.11.186.152'], MAX = 600;
  // two addresses of the same server: the name works inside Iran; the bare IP (no SNI) also passes the filtering for VPN/foreign visitors
  if (/[?&]askapi=local/.test(location.search)) { API = 'http://127.0.0.1:8099/api/ask.php'; SAVE = 'http://127.0.0.1:8099/api/ask-save.php'; LIST = 'http://127.0.0.1:8099/api/ask-list.php'; }
  if (/[?&]askrag=off/.test(location.search)) RAG = [];
  if (/[?&]askrag=ip/.test(location.search)) RAG = [RAG[1]];
  var d = document.documentElement, lang = d.getAttribute('data-lang') || 'fa', fa = lang === 'fa';
  var T = fa ? {
    t: 'از ما بپرسید', p: 'سؤال مالیاتی، بیمه‌ای یا حسابداری‌تان را بنویسید تا دستیار فروغ‌شمار سیمرغ یک پاسخ عمومی و کوتاه به شما بدهد.',
    lead: 'پاسخ این بخش را <strong>هوش مصنوعیِ اختصاصی و بومی‌شده‌ی فروغ‌شمار سیمرغ</strong> می‌دهد؛ دستیاری که برای مالیات، بیمه و حسابداری ایران آماده شده و پاسخ‌هایش را بر پایه‌ی قانون‌ها، آیین‌نامه‌ها و بخشنامه‌های رسمی می‌نویسد و منبع هر پاسخ را هم کنارش نشان می‌دهد.',
    pts: ['پاسخ‌ها دقیق و مستند به منابع رسمی‌اند، اما جای <strong>مشاوره‌ی تخصصی</strong> برای پرونده‌ی شما را نمی‌گیرند. <a href="/contact/" class="fs-ask-cta">رزرو مشاوره</a>',
      'سؤال‌ها و پاسخ‌ها برای استفاده‌ی دیگران پایین همین صفحه نمایش داده می‌شوند؛ پیش از نمایش، <strong>نام‌ها، نام شرکت‌ها، شماره‌ها، نشانی و هر اطلاعات شخصی یا محرمانه پوشانده می‌شود.</strong> نشانی ایمیل شما هرگز نمایش داده نمی‌شود.'],
    em: 'ایمیل (اختیاری)', emh: 'اگر نشانی ایمیل‌تان را بنویسید، پاسخ برایتان ایمیل هم می‌شود. این نشانی فقط برای همین کار است و جایی نمایش داده نمی‌شود.',
    emBad: 'نشانی ایمیل درست نیست؛ آن را اصلاح کنید یا خالی بگذارید.', emQ: 'پاسخ به {e} هم ایمیل می‌شود (معمولاً تا چند دقیقه؛ اگر نرسید پوشه‌ی هرزنامه را هم ببینید).',
    emF: 'پاسخ ایمیل نشد؛ ولی همین‌جا در دسترس است.',
    lt: 'پرسش‌های شما و پاسخ سیمرغ', lp: 'تازه‌ترین پرسش‌هایی که در همین صفحه پرسیده شده‌اند. پیش از نمایش، نام‌ها و هر اطلاعات شخصی پوشانده شده است. این پاسخ‌ها اطلاعات عمومی‌اند و جای مشاوره‌ی تخصصی برای پرونده‌ی شما را نمی‌گیرند.',
    lq: 'پرسش', la: 'پاسخ سیمرغ', lmore: 'پرسش‌های بیشتر', lfull: 'نمایش کامل پاسخ', lless: 'بستن', mine: 'پرسش شما — پس از پوشاندن اطلاعات شخصی، برای همه هم نمایش داده می‌شود.', book: 'رزرو مشاوره',
    ph: 'مثلاً: مهلت ارسال اظهارنامه‌ی مالیات بر اجاره تا کی است؟', b: 'پرسیدن', w: 'در حال آماده کردن پاسخ… ممکن است تا یک دقیقه طول بکشد.',
    short: 'لطفاً سؤالتان را کامل‌تر بنویسید.', err: 'الان امکان پاسخ‌گویی نیست. لطفاً کمی بعد دوباره امتحان کنید.',
    na: 'این بخش به‌زودی فعال می‌شود. تا آن زمان می‌توانید مشاوره رزرو کنید.', link: 'سؤال دارید؟ از ما بپرسید', again: 'سؤال دیگری دارید؟ دوباره بپرسید.'
  } : {
    t: 'Ask Us', p: 'Write your tax, insurance or accounting question and the Forough Shomar Simorgh assistant will give you a short, general answer.',
    lead: 'Answers here come from <strong>Forough Shomar Simorgh\'s own AI assistant, tailored to Iran</strong>: built for Iranian tax, insurance and accounting, it writes its answers from official laws, regulations and circulars and shows the source next to each answer.',
    pts: ['Answers are accurate and source-based, but they do not replace <strong>expert advice</strong> for your own case. <a href="/contact/" class="fs-ask-cta">Book a consultation</a>',
      'Questions and answers are shown further down this page to help others; before that, <strong>names, company names, numbers, addresses and any personal or confidential details are hidden.</strong> Your e-mail address is never shown.'],
    em: 'E-mail (optional)', emh: 'If you enter your e-mail address, the answer will also be e-mailed to you. It is used only for that and never shown.',
    emBad: 'This e-mail address is not valid; fix it or leave it empty.', emQ: 'The answer will also be e-mailed to {e} (usually within a few minutes; check your spam folder if it does not arrive).',
    emF: 'The answer could not be e-mailed, but it is available right here.',
    lt: 'Your questions and Simorgh\'s answers', lp: 'The latest questions asked on this page. Names and any personal details are hidden before they are shown. These answers are general information and do not replace expert advice for your case.',
    lq: 'Question', la: 'Simorgh\'s answer', lmore: 'More questions', lfull: 'Show full answer', lless: 'Show less', mine: 'Your question — it will also be shown to everyone once personal details are hidden.', book: 'Book a consultation',
    ph: 'e.g. When is the rental income tax return due?', b: 'Ask', w: 'Preparing your answer… this can take up to a minute.',
    short: 'Please write your question in a bit more detail.', err: 'We cannot answer right now. Please try again a little later.',
    na: 'This service will be available soon. Meanwhile you can book a consultation.', link: 'Have a question? Ask Us', again: 'Another question? Ask again.'
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
      + '.fs-ask-em[hidden]{display:none!important}.fs-ask-em{display:block;margin-top:12px;font-size:.9rem}.fs-ask-em input{display:block;width:100%;box-sizing:border-box;margin-top:6px;min-height:42px;border:1px solid rgba(212,175,55,.5);border-radius:10px;padding:0 12px;font:inherit;background:rgba(255,255,255,.96);color:#0b1f3a;text-align:left}.fs-ask-em input:focus{outline:2px solid #d4af37;outline-offset:1px}.fs-ask-emh{display:block;margin-top:4px;font-size:12px;opacity:.7;line-height:1.8}.fs-ask-emn{margin-top:10px;font-size:.88rem;opacity:.85}.fs-ask-emn.err{color:#c0392b;opacity:1}'
      + '#fs-faq-wrap{margin-top:32px}#fs-faq{border:1px solid rgba(212,175,55,.4);border-radius:14px;background:transparent}#fs-faq>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;font-size:1.15rem;font-weight:600;color:#c9a227;border-radius:14px}#fs-faq>summary::-webkit-details-marker{display:none}#fs-faq>summary:hover{background:rgba(212,175,55,.08)}'
      + '#fs-faq>summary:after{content:"";flex:none;width:9px;height:9px;border-right:2px solid #d4af37;border-bottom:2px solid #d4af37;transform:rotate(45deg);transition:transform .2s;margin-top:-4px}#fs-faq[open]>summary:after{transform:rotate(-135deg);margin-top:4px}#fs-faq .fs-faq-body{padding:4px 14px 16px}'
      + '.fs-al{max-width:48rem;margin:40px auto 56px;padding:0 16px}.fs-al h2{margin:0 0 6px;font-size:1.35rem;color:#c9a227}.fs-al-p{margin:0 0 16px;line-height:2;font-size:.9rem;opacity:.8}.fs-al-p a{color:#c9a227;text-decoration:underline}'
      + '.fs-al-it{border:1px solid rgba(212,175,55,.3);border-radius:14px;background:var(--color-navy-soft,#12294a);padding:16px 18px;margin:0 0 14px}.fs-al-it.mine{border-color:#d4af37;box-shadow:0 0 0 1px rgba(212,175,55,.35)}'
      + '.fs-al-tag{display:inline-block;font-size:12px;font-weight:600;color:#0b1f3a;background:#d4af37;border-radius:6px;padding:0 8px;line-height:1.9}.fs-al-t{font-size:12px;opacity:.6;margin-inline-start:8px}.fs-al-mine{display:block;margin-top:6px;font-size:12px;color:#c9a227}'
      + '.fs-al-q p{margin:8px 0 0;line-height:2;font-weight:500;white-space:pre-wrap}.fs-al-a{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(212,175,55,.35)}.fs-al-a .fs-al-tag{background:transparent;color:#c9a227;border:1px solid rgba(212,175,55,.5)}'
      + '.fs-al-body{margin-top:8px;line-height:2.05;font-size:.95rem;position:relative}.fs-al-body p{margin:0 0 8px}.fs-al-body ul{margin:0 0 8px;padding-inline-start:20px;list-style:disc}.fs-al-body hr{border:0;border-top:1px dashed rgba(212,175,55,.5);margin:10px 0}.fs-al-body a{color:#c9a227;text-decoration:underline;word-break:break-word}'
      + '.fs-al-body.clamp{max-height:15em;overflow:hidden}.fs-al-body.clamp:after{content:"";position:absolute;left:0;right:0;bottom:0;height:4em;background:linear-gradient(to bottom,transparent,var(--color-navy-soft,#12294a))}'
      + '.fs-al button{min-height:38px;padding:0 18px;border:1px solid rgba(212,175,55,.6);border-radius:8px;background:transparent;color:#c9a227;font:inherit;font-size:.88rem;cursor:pointer}.fs-al button:hover{background:rgba(212,175,55,.12)}.fs-al-exp{margin-top:6px}.fs-al-more{display:block;margin:8px auto 0}.fs-al-more[disabled]{opacity:.6;cursor:wait}'
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
      + '<textarea name="q" maxlength="' + MAX + '" placeholder="' + esc(T.ph) + '" aria-label="' + esc(T.t) + '"></textarea>'
      + '<label class="fs-ask-em" hidden>' + T.em + '<input type="email" name="email" dir="ltr" inputmode="email" autocomplete="email" maxlength="190" placeholder="name@example.com"><span class="fs-ask-emh">' + T.emh + '</span></label><div class="fs-ask-row"><span class="fs-ask-cnt">0 / ' + MAX + '</span><button type="submit">' + T.b + '</button></div></form>'
      + '<div class="fs-ask-st" role="status" aria-live="polite"></div><div class="fs-ask-ans" hidden></div></div>';
    place(w); W = w;
    var f = w.querySelector('form'), ta = f.q, btn = f.querySelector('button'), st = w.querySelector('.fs-ask-st'), ans = w.querySelector('.fs-ask-ans'), cnt = w.querySelector('.fs-ask-cnt');
    ta.addEventListener('input', function () { cnt.textContent = ta.value.length + ' / ' + MAX; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = ta.value.trim();
      if (q.length < 8) { st.className = 'fs-ask-st err'; st.textContent = T.short; return; }
      var em = f.email.closest('label').hidden ? '' : f.email.value.trim();
      if (em && (em.length > 190 || !/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]{2,}$/.test(em))) { st.className = 'fs-ask-st err'; st.textContent = T.emBad; f.email.focus(); return; }
      btn.disabled = true; ans.hidden = true; st.className = 'fs-ask-st'; st.innerHTML = '<span class="fs-sp"></span>' + T.w;
      var body = { question: q, lang: lang, website: f.website.value };   // to the answer server: never the e-mail
      function emNote(ok) {
        if (!em) return; var n = ans.querySelector('.fs-ask-emn'); if (!n) { n = document.createElement('p'); ans.appendChild(n); }
        n.className = 'fs-ask-emn' + (ok ? '' : ' err'); n.textContent = ok ? T.emQ.replace('{e}', '\u2066' + em + '\u2069') : T.emF;
      }
      function show(j, mine) {
        if (j.ok && j.answer) {
          st.textContent = ''; ans.innerHTML = fmt(j.answer) + '<p style="margin-top:10px;font-size:.85rem;opacity:.7">' + T.again + '</p>'; ans.hidden = false; ta.value = ''; cnt.textContent = '0 / ' + MAX;
          if (mine && !j.offtopic) listMine(q, j.answer, mine);
        }
        else { st.className = 'fs-ask-st err'; st.innerHTML = (j.status === 503 || j.status === 404 || !j.error) ? esc(T.na) + ' <a href="/contact/" class="fs-ask-cta" style="text-decoration:underline">' + (fa ? 'رزرو مشاوره' : 'Book a consultation') + '</a>' : esc(j.error || T.err); }
      }
      function fail() { st.className = 'fs-ask-st err'; st.innerHTML = esc(T.na) + ' <a href="/contact/" style="text-decoration:underline">' + (fa ? 'رزرو مشاوره' : 'Book a consultation') + '</a>'; }
      function post(url, data, ms) {
        var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
        var mem = false; try { mem = localStorage.getItem('fs-member') === '1'; } catch (e) {}
        // logged-in members: send the session cookie to the panel only (links the question to «حساب من»); never to the answer server
        var cred = mem && (url === API || url === SAVE) ? 'include' : 'omit';
        return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctl ? ctl.signal : undefined, keepalive: ms < 20000, credentials: cred })
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
      function viaPanel() {
        var b2 = {}; for (var k in body) b2[k] = body[k]; if (em) b2.email = em;
        return post(API, b2, 100000).then(function (j) { show(j, j.pid ? { id: +j.pid } : null); if (j.ok && j.answer) emNote(true); }, fail);
      }
      function recId(sv) { try { return JSON.parse(atob(sv.rec.replace(/-/g, '+').replace(/_/g, '/'))).id || ''; } catch (e) { return ''; } }
      probe()
        .then(function (base) { return post(base + '/ask', body, 100000); })
        .then(function (j) {
          if (j.ok && j.answer) {
            show(j, j.save ? { rid: recId(j.save) } : null);
            if (j.save) {
              var sv = { rec: j.save.rec, sig: j.save.sig }; if (em) sv.email = em;
              post(SAVE, sv, 15000).then(function (r) { emNote(!!(r.ok && r.email)); }, function () { emNote(false); });
            } else emNote(false);
            return;
          }
          if (j.status === 422 || j.status === 400) { show(j); return; }   // the question itself was rejected: same answer from the panel
          return viaPanel();
        }, viaPanel)
        .catch(fail)
        .then(function () { btn.disabled = false; });
    });
    if (location.hash === '#ask') setTimeout(function () { w.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }
  // ---- public list of asked questions (masked copies only, from the panel) ----
  var L = null, LI = null, MORE = null, last = 0, busy = false, seen = {};
  function placeList() {
    var main = document.querySelector('main'); if (!main || !L) return;
    var after = document.getElementById('fs-faq-wrap') || W; if (!after || !document.contains(after)) { main.appendChild(L); return; }
    if (after.nextSibling !== L) after.parentNode.insertBefore(L, after.nextSibling);
  }
  function strip(a) { var i = a.lastIndexOf('\n---\n'); return i > 0 && /\/contact\//.test(a.slice(i)) ? a.slice(0, i) : a; }   // the per-answer disclaimer is said once at the top
  function item(x, mine) {
    var el = document.createElement('article'); el.className = 'fs-al-it' + (mine ? ' mine' : '');
    if (x.id) el.setAttribute('data-id', x.id); if (x.rid) el.setAttribute('data-rid', x.rid);
    var t = fa ? (x.t || '') : (x.ts ? new Date(x.ts).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '');
    el.innerHTML = '<div class="fs-al-q"><span class="fs-al-tag">' + T.lq + '</span>' + (t ? '<span class="fs-al-t">' + esc(t) + '</span>' : '') + (mine ? '<span class="fs-al-mine">' + T.mine + '</span>' : '')
      + '<p>' + esc(x.q) + '</p></div><div class="fs-al-a"><span class="fs-al-tag">' + T.la + '</span><div class="fs-al-body">' + fmt(strip(x.a)) + '</div></div>';
    var b = el.querySelector('.fs-al-body');
    if (x.a.length > 700) {
      b.className += ' clamp'; var e = document.createElement('button'); e.type = 'button'; e.className = 'fs-al-exp'; e.textContent = T.lfull;
      e.onclick = function () { var c = /clamp/.test(b.className); b.className = c ? 'fs-al-body' : 'fs-al-body clamp'; e.textContent = c ? T.lless : T.lfull; };
      b.parentNode.appendChild(e);
    }
    return el;
  }
  function getList(before, fresh) {
    var u = LIST + '?lang=' + (fa ? 'fa' : 'other') + '&limit=10' + (before ? '&before=' + before : '') + (fresh ? '&_=' + Date.now() : '');
    return fetch(u).then(function (r) { return r.json(); }).then(function (j) { if (!j || !j.ok) throw 0; return j; });
  }
  function render(j, append) {
    var frag = document.createDocumentFragment();
    j.items.forEach(function (x) {
      if (seen[x.id]) return; seen[x.id] = 1;
      var mine = LI.querySelectorAll('.fs-al-it.mine');
      for (var i = 0; i < mine.length; i++) if ((x.rid && mine[i].getAttribute('data-rid') === x.rid) || (+mine[i].getAttribute('data-id') === x.id)) mine[i].remove();
      frag.appendChild(item(x));
    });
    if (append) LI.appendChild(frag);
    else { var firstPub = LI.querySelector('.fs-al-it:not(.mine)'); LI.insertBefore(frag, firstPub); }
    return j;
  }
  function ids() { var a = LI.querySelectorAll('.fs-al-it:not(.mine)'), m = 0; for (var i = 0; i < a.length; i++) { var v = +a[i].getAttribute('data-id'); if (v && (!m || v < m)) m = v; } return m; }
  function loadMore() {
    if (busy) return; busy = true; MORE.disabled = true;
    getList(ids()).then(function (j) { render(j, true); MORE.hidden = !j.more; }, function () {}).then(function () { busy = false; MORE.disabled = false; vis(); });
  }
  function refresh() {   // newest first: new rows go on top; rows deleted in the panel disappear
    getList(0, true).then(function (j) {
      var keep = {}; j.items.forEach(function (x) { keep[x.id] = 1; });
      var top = j.items.length ? j.items[j.items.length - 1].id : 0, a = LI.querySelectorAll('.fs-al-it:not(.mine)');
      for (var i = 0; i < a.length; i++) { var v = +a[i].getAttribute('data-id'); if (v >= top && !keep[v]) { a[i].remove(); delete seen[v]; } }
      render(j, false); vis();
    }, function () {});
  }
  function vis() { if (L) L.hidden = !LI.children.length; }
  function listMine(q, a, ref) {
    if (!L) return;
    var el = item({ q: q, a: a, id: ref.id || 0, rid: ref.rid || '', t: '', ts: '' }, true); LI.insertBefore(el, LI.firstChild); vis();
    setTimeout(refresh, 40000); setTimeout(refresh, 90000); setTimeout(refresh, 180000);
  }
  function list() {
    if (!/^\/faq\/?$/.test(location.pathname) || !W) return;
    if (L) { if (!document.contains(L) || (document.getElementById('fs-faq-wrap') && L.previousSibling !== document.getElementById('fs-faq-wrap'))) placeList(); return; }
    L = document.createElement('section'); L.id = 'ask-list'; L.className = 'fs-al'; L.hidden = true; L.setAttribute('data-no-i18n', '');
    L.setAttribute('dir', fa || lang === 'ar' ? 'rtl' : 'ltr');
    L.innerHTML = '<h2>' + T.lt + '</h2><p class="fs-al-p">' + T.lp + ' <a href="/contact/">' + T.book + '</a></p><div class="fs-al-items"></div><button type="button" class="fs-al-more" hidden>' + T.lmore + '</button>';
    LI = L.querySelector('.fs-al-items'); MORE = L.querySelector('.fs-al-more'); MORE.onclick = loadMore;
    placeList();
    if (!window.fetch) return;
    busy = true;
    getList(0).then(function (j) {
      render(j, true); MORE.hidden = !j.more;
      var e = W.querySelector('.fs-ask-em'); if (e) e.hidden = false;   // the panel supports the e-mail option (update16)
    }, function () {}).then(function () { busy = false; vis(); });
  }
  function go() { links(); box(); list(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  setTimeout(go, 1500);
  if (window.MutationObserver) {
    var pend = false;
    new MutationObserver(function () { if (pend) return; pend = true; setTimeout(function () { pend = false; go(); }, 50); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }
})();
