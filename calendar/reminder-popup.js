// Calendar reminders popup: asks for email (+ optional name), posts to the panel. Double opt-in happens on the panel.
(function () {
  var API = 'https://panel.foroughshomar.ir/api/subscribe.php', KEY = 'fs-cal-popup';
  var d = document.documentElement, lang = d.getAttribute('data-lang') || 'fa';
  try { var st = JSON.parse(localStorage.getItem(KEY) || 'null'); if (st && (st.done || Date.now() - st.t < 14 * 864e5)) return; } catch (e) {}
  var T = {
    fa: { t: 'مهلت‌ها را به ایمیل‌تان می‌فرستیم', p: 'چند روز پیش از هر موعد مالیاتی، بیمه‌ای و مالی (ارزش افزوده، لیست بیمه و حقوق، معاملات فصلی، اظهارنامه‌ها) یک یادآوری کوتاه برایتان ایمیل می‌شود. رایگان است و هر وقت بخواهید لغو می‌کنید.', n: 'نام (اختیاری)', e: 'ایمیل', b: 'عضویت در یادآوری', x: 'بستن', ok: 'تقریباً تمام شد! یک ایمیل تأیید برایتان فرستادیم؛ روی لینک آن بزنید تا یادآوری‌ها فعال شود.', bad: 'ایمیل درست به نظر نمی‌رسد. نمونه: name@gmail.com', err: 'الان امکان ثبت نیست. لطفاً کمی بعد دوباره امتحان کنید یا به info@foroughshomar.ir ایمیل بزنید.', w: 'در حال ثبت…', priv: 'ایمیل شما فقط برای همین یادآوری‌ها استفاده می‌شود.' },
    en: { t: 'Get the deadlines by email', p: 'A few days before each tax, insurance and financial deadline (VAT, insurance & payroll lists, quarterly transactions, annual returns) we send you a short reminder. Free, and you can unsubscribe any time.', n: 'Name (optional)', e: 'Email', b: 'Send me reminders', x: 'Close', ok: 'Almost done! We sent you a confirmation email — click its link to activate the reminders.', bad: "That email doesn't look right. Example: name@gmail.com", err: "We can't sign you up right now. Please try again later or email info@foroughshomar.ir.", w: 'Sending…', priv: 'Your email is used only for these reminders.' },
    ar: { t: 'نرسل لك المواعيد بالبريد الإلكتروني', p: 'قبل أيام من كل موعد ضريبي وتأميني ومالي نرسل لك تذكيراً قصيراً. مجاني ويمكنك إلغاء الاشتراك متى شئت.', n: 'الاسم (اختياري)', e: 'البريد الإلكتروني', b: 'اشترك في التذكيرات', x: 'إغلاق', ok: 'أوشكنا! أرسلنا لك رسالة تأكيد؛ اضغط على رابطها لتفعيل التذكيرات.', bad: 'البريد الإلكتروني غير صحيح. مثال: name@gmail.com', err: 'لا يمكن التسجيل الآن. حاول لاحقاً أو راسلنا على info@foroughshomar.ir.', w: 'جارٍ الإرسال…', priv: 'نستخدم بريدك لهذه التذكيرات فقط.' }
  };
  var L = T[lang] || T.en, rtl = lang === 'fa' || lang === 'ar';
  var css = '#fs-cal-pop{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;padding:16px;background:rgba(5,14,28,.45);opacity:0;transition:opacity .25s}' +
    '#fs-cal-pop.on{opacity:1}#fs-cal-pop .bx{position:relative;width:100%;max-width:440px;border-radius:18px;padding:26px 22px 20px;background:#0f2747;color:#f4ead5;border:1px solid rgba(212,175,55,.55);box-shadow:0 18px 50px rgba(0,0,0,.35);transform:translateY(18px);transition:transform .25s}' +
    '#fs-cal-pop.on .bx{transform:none}[data-theme=light] #fs-cal-pop .bx{background:#fffdf8;color:#0b1f3a;border-color:#d4af37}' +
    '#fs-cal-pop h2{margin:0 0 8px;font-size:1.15rem;color:#d4af37;line-height:1.9}#fs-cal-pop p{margin:0 0 12px;font-size:.9rem;line-height:1.9;opacity:.9}' +
    '#fs-cal-pop input{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:11px 12px;border-radius:10px;border:1px solid rgba(212,175,55,.45);background:rgba(255,255,255,.06);color:inherit;font:inherit;font-size:.95rem}' +
    '[data-theme=light] #fs-cal-pop input{background:#fff}#fs-cal-pop input[type=email]{direction:ltr;text-align:' + (rtl ? 'right' : 'left') + '}' +
    '#fs-cal-pop .go{width:100%;padding:12px;border:0;border-radius:10px;background:#d4af37;color:#0b1f3a;font:inherit;font-weight:600;cursor:pointer}#fs-cal-pop .go:disabled{opacity:.6}' +
    '#fs-cal-pop .x{position:absolute;top:10px;' + (rtl ? 'left' : 'right') + ':12px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:22px;cursor:pointer;opacity:.7}' +
    '#fs-cal-pop .msg{min-height:1em;margin:10px 0 0;font-size:.85rem}#fs-cal-pop .msg.err{color:#e0796b}#fs-cal-pop .msg.ok{color:#5bb98c}#fs-cal-pop .sm{font-size:.75rem;opacity:.65;margin:10px 0 0}' +
    '#fs-cal-pop .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}@media(min-width:768px){#fs-cal-pop{align-items:center}}';
  var shown = false;
  function remember(done) { try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), done: !!done })); } catch (e) {} }
  function show() {
    if (shown) return; shown = true; window.removeEventListener('scroll', onScroll);
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    var w = document.createElement('div'); w.id = 'fs-cal-pop'; w.setAttribute('data-no-i18n', ''); w.dir = rtl ? 'rtl' : 'ltr'; w.lang = lang === 'elv' ? 'en' : lang;
    w.innerHTML = '<div class="bx" role="dialog" aria-modal="true" aria-labelledby="fs-cal-t"><button type="button" class="x" aria-label="' + L.x + '">×</button><h2 id="fs-cal-t">' + L.t + '</h2><p>' + L.p + '</p>' +
      '<form novalidate><input name="name" autocomplete="name" placeholder="' + L.n + '" maxlength="120"/><input name="email" type="email" autocomplete="email" required placeholder="' + L.e + '" maxlength="191"/>' +
      '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"/><button class="go" type="submit">' + L.b + '</button><p class="msg" role="status"></p></form><p class="sm">' + L.priv + '</p></div>';
    document.body.appendChild(w); requestAnimationFrame(function () { w.classList.add('on'); });
    var f = w.querySelector('form'), m = w.querySelector('.msg'), g = w.querySelector('.go');
    function close() { remember(false); w.classList.remove('on'); setTimeout(function () { w.remove(); }, 250); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', esc); w.querySelector('.x').onclick = close; w.onclick = function (e) { if (e.target === w) close(); };
    f.onsubmit = function (e) {
      e.preventDefault(); var em = f.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em)) { m.className = 'msg err'; m.textContent = L.bad; f.email.focus(); return; }
      g.disabled = true; m.className = 'msg'; m.textContent = L.w;
      var ctl = window.AbortController ? new AbortController() : null; var to = setTimeout(function () { ctl && ctl.abort(); }, 12000);
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, name: f.name.value.trim(), website: f.website.value, lang: lang }), signal: ctl && ctl.signal })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (j) { clearTimeout(to); if (j && j.ok) { m.className = 'msg ok'; m.textContent = L.ok; f.querySelectorAll('input,button').forEach(function (x) { x.disabled = true; }); remember(true); }
          else { g.disabled = false; m.className = 'msg err'; m.textContent = (j && j.field === 'email') ? L.bad : L.err; } })
        .catch(function () { clearTimeout(to); g.disabled = false; m.className = 'msg err'; m.textContent = L.err; });
    };
    setTimeout(function () { f.email.focus({ preventScroll: true }); }, 300);
  }
  function onScroll() { if (window.scrollY > (document.body.scrollHeight - innerHeight) * 0.35) show(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  setTimeout(show, /[?&]popup=now\b/.test(location.search) ? 300 : 8000);
})();
