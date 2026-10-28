/* فروغ‌شمار — ورود و ثبت‌نام (ایمیل + رمز عبور). پنجره‌ی بازشونده روی همه‌ی صفحه‌ها؛ همین فرم در صفحه‌ی /login/ هم هست.
   کد ۵ رقمی ایمیلی فقط یک بار برای تأیید ایمیل هنگام ثبت‌نام، و برای «فراموشی رمز» به کار می‌رود. */
(function () {
  'use strict';
  if (window.FSLogin) return;
  var API = 'https://panel.foroughshomar.ir/api/';
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && (/[?&]acctapi=local/.test(location.search) || sessionStorage.getItem('fs-acctapi'))) { sessionStorage.setItem('fs-acctapi', '1'); API = location.origin + '/api/'; } } catch (e) {}
  var DOWN = 'ارتباط با سامانه برقرار نشد. اینترنتتان را یک نگاه بیندازید و دوباره امتحان کنید.';
  var UNAV = 'ورود همین حالا در دسترس نیست؛ کمی بعد دوباره سر بزنید. تا آن موقع «از ما بپرسید» در خدمت شماست.';
  var MAILRE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fa(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
  function latin(s) { return String(s || '').replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); }
  function mmss(s) { var m = Math.floor(s / 60), x = s % 60; return fa(m) + ':' + (x < 10 ? '۰' : '') + fa(x); }
  function call(data) {
    var o = { method: data ? 'POST' : 'GET', credentials: 'include', headers: {} };
    if (data) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(data); }
    return fetch(API + 'auth.php' + (data ? '' : '?action=status'), o).then(function (r) {
      return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {} if (!j || typeof j !== 'object') throw new Error('bad'); j._status = r.status; return j; });
    });
  }
  var CSS = '.fsm-back{position:fixed;inset:0;z-index:9999;background:rgba(4,12,24,.62);display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(2px)}'
    + '.fsm{position:relative;width:100%;max-width:450px;max-height:calc(100vh - 2rem);overflow:auto;background:var(--color-navy-soft,#132845);color:var(--color-cream,#f3ead8);border:1px solid rgba(212,175,55,.45);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);padding:1.4rem 1.3rem 1.2rem;font-family:inherit;line-height:1.9;direction:rtl;text-align:right}'
    + '.fsm.inline{max-width:none;max-height:none;box-shadow:none;margin:0 auto}'
    + '.fsm h2{margin:0 0 .2rem;font-size:1.15rem;color:#d4af37;font-weight:600}.fsm p{margin:.3rem 0}.fsm .mut{color:var(--color-muted,#c4b89a);font-size:.88rem}'
    + '.fsm-x{position:absolute;top:.55rem;left:.55rem;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:1.6rem;cursor:pointer;line-height:1}.fsm-x:hover,.fsm-x:focus-visible{background:rgba(212,175,55,.15)}'
    + '.fsm-tabs{display:flex;gap:.3rem;margin:.4rem 0 1rem;border-bottom:1px solid var(--color-line,#2c3f58)}.fsm-tabs button{flex:1;min-height:44px;border:0;background:transparent;color:inherit;font:inherit;font-size:1rem;cursor:pointer;border-bottom:3px solid transparent;opacity:.75}.fsm-tabs button[aria-selected=true]{border-color:#d4af37;opacity:1;font-weight:600;color:#d4af37}'
    + '.fsm label{display:block;font-size:.92rem;margin:.65rem 0 .2rem}.fsm input[type=email],.fsm input[type=text],.fsm input[type=password]{width:100%;box-sizing:border-box;min-height:46px;padding:.5rem .75rem;border-radius:10px;border:1px solid var(--color-line,#2c3f58);background:var(--color-navy,#0b1f3a);color:inherit;font:inherit}.fsm input:focus-visible{outline:2px solid #d4af37;outline-offset:1px}.fsm input[aria-invalid=true]{border-color:#d0705c}'
    + '.fsm .pw{position:relative}.fsm .pw input{padding-left:4.6rem}.fsm .pw button{position:absolute;left:.3rem;top:50%;transform:translateY(-50%);min-height:38px;padding:0 .6rem;border:0;border-radius:8px;background:transparent;color:#d4af37;font:inherit;font-size:.85rem;cursor:pointer}'
    + '.fsm .meter{height:6px;border-radius:4px;background:var(--color-line,#2c3f58);margin-top:.4rem;overflow:hidden}.fsm .meter i{display:block;height:100%;width:0;transition:width .2s,background .2s}'
    + '.fsm input.otp{letter-spacing:.5em;text-align:center;font-size:1.4rem;direction:ltr}.fsm .row2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}.fsm .chk{display:flex;gap:.5rem;align-items:flex-start;font-size:.9rem}.fsm .chk input{margin-top:.45rem;width:18px;height:18px;flex:none}'
    + '.fsm a{color:#d4af37}.fsm-btn{display:block;width:100%;min-height:48px;margin-top:1rem;border:0;border-radius:10px;background:#d4af37;color:#0b1f3a;font:inherit;font-weight:600;cursor:pointer}.fsm-btn:disabled{opacity:.6;cursor:wait}'
    + '.fsm-link{border:0;background:none;color:#d4af37;font:inherit;cursor:pointer;padding:.2rem 0;text-decoration:underline;text-underline-offset:4px}.fsm-link:disabled{opacity:.55;cursor:default;text-decoration:none}'
    + '.fsm-err{margin-top:.7rem;padding:.55rem .75rem;border-radius:10px;background:rgba(200,80,60,.14);border:1px solid rgba(200,80,60,.45);font-size:.92rem}.fsm-ok{margin:.4rem 0;padding:.6rem .8rem;border-radius:10px;background:rgba(80,160,120,.15);border:1px solid rgba(80,160,120,.45);font-size:.92rem}'
    + '.fsm-sw{margin-top:1rem;text-align:center;font-size:.95rem}.fsm [hidden]{display:none!important}'
    + '@media (max-width:600px){.fsm-back{padding:0}.fsm:not(.inline){max-width:none;width:100%;height:100%;max-height:none;border-radius:0;border:0;padding-top:3.4rem}}'
    + '.fs-toast{position:fixed;bottom:1.2rem;left:50%;transform:translateX(-50%);z-index:9999;background:#d4af37;color:#0b1f3a;padding:.7rem 1.2rem;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);font-weight:600;max-width:92vw;text-align:center}';
  var PWF = function (id, name, label, ac, hint) {
    return '<label for="' + id + '">' + label + '</label><div class="pw"><input id="' + id + '" name="' + name + '" type="password" autocomplete="' + ac + '" dir="ltr" maxlength="200"' + (hint ? ' aria-describedby="' + id + '-h"' : '') + '><button type="button" class="fsm-eye" aria-controls="' + id + '" aria-pressed="false">نمایش</button></div>'
      + (hint ? '<div class="meter" aria-hidden="true"><i></i></div><p class="mut" id="' + id + '-h" aria-live="polite">دست‌کم ۸ نویسه؛ ترکیب حروف، عدد و نشانه رمز را محکم‌تر می‌کند.</p>' : '');
  };
  var HTML = '<button type="button" class="fsm-x" aria-label="بستن">×</button>'
    + '<h2 id="fsm-h">به فروغ‌شمار سیمرغ خوش آمدید</h2>'
    + '<div class="fsm-tabs" role="tablist" aria-label="ورود یا ثبت‌نام"><button type="button" role="tab" id="fsm-t-login" aria-controls="fsm-panel" aria-selected="true">ورود</button><button type="button" role="tab" id="fsm-t-signup" aria-controls="fsm-panel" aria-selected="false" tabindex="-1">ثبت‌نام</button></div>'
    + '<div id="fsm-panel" role="tabpanel" aria-labelledby="fsm-t-login">'
    + '<div id="fsm-unav" class="fsm-err" role="alert" hidden></div>'
    // login
    + '<form id="fsm-login" novalidate><p class="mut">خوشحالیم که دوباره می‌بینیمتان. با ایمیل و رمز خود وارد شوید.</p>'
    + '<label for="fsm-le">ایمیل</label><input id="fsm-le" name="email" type="email" inputmode="email" autocomplete="email" dir="ltr" maxlength="120" placeholder="name@gmail.com" required>'
    + PWF('fsm-lp', 'password', 'رمز عبور', 'current-password', false)
    + '<p style="margin-top:.4rem"><button type="button" class="fsm-link" data-go="forgot">رمز را فراموش کرده‌ام</button></p>'
    + '<button type="submit" class="fsm-btn">ورود</button>'
    + '<p class="fsm-sw">عضو نیستید؟ <button type="button" class="fsm-link" data-go="signup">از اینجا ثبت‌نام کنید ←</button></p></form>'
    // signup
    + '<form id="fsm-signup" novalidate hidden><p class="mut">چند ثانیه بیشتر طول نمی‌کشد. <span class="fsm-gift">سه پر سیمرغ</span> هم به رسم خوش‌آمد هدیه‌ی شماست.</p>'
    + '<div class="row2"><div><label for="fsm-first">نام</label><input id="fsm-first" name="first_name" type="text" autocomplete="given-name" maxlength="60"></div><div><label for="fsm-last">نام خانوادگی</label><input id="fsm-last" name="last_name" type="text" autocomplete="family-name" maxlength="60"></div></div>'
    + '<label for="fsm-se">ایمیل</label><input id="fsm-se" name="email" type="email" inputmode="email" autocomplete="email" dir="ltr" maxlength="120" placeholder="name@gmail.com" required aria-describedby="fsm-se-h"><p class="mut" id="fsm-se-h">یک کد کوتاه برای تأیید ایمیل به همین نشانی می‌فرستیم. ایمیلتان پیش ما می‌ماند و جایی نمایش داده نمی‌شود.</p>'
    + PWF('fsm-sp', 'password', 'رمز عبور', 'new-password', true)
    + '<label class="chk"><input type="checkbox" name="accept_terms"><span><a href="/terms/" target="_blank">قوانین</a> و <a href="/privacy/" target="_blank">حریم خصوصی</a> فروغ‌شمار سیمرغ را خواندم و می‌پذیرم.</span></label>'
    + '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%)">'
    + '<button type="submit" class="fsm-btn">ارسال کد تأیید ایمیل</button>'
    + '<p class="fsm-sw">حساب دارید؟ <button type="button" class="fsm-link" data-go="login">از اینجا وارد شوید ←</button></p></form>'
    // code (sign-up verify)
    + '<form id="fsm-code" novalidate hidden><p>یک کد ۵ رقمی به <b dir="ltr" class="fsm-to"></b> فرستادیم؛ آن را اینجا بنویسید تا حسابتان آماده شود. <button type="button" class="fsm-link" data-go="signup">ایمیل را عوض کنم</button></p>'
    + '<label for="fsm-c">کد تأیید</label><input id="fsm-c" name="code" class="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="5" aria-describedby="fsm-c-h">'
    + '<p class="mut" id="fsm-c-h">کد تا <span class="fsm-exp">۱۰:۰۰</span> دیگر معتبر است. اگر پیدایش نکردید، پوشه‌ی هرزنامه (Spam) را هم ببینید.</p>'
    + '<button type="submit" class="fsm-btn">تأیید و ساخت حساب</button>'
    + '<p style="text-align:center;margin-top:.6rem"><button type="button" class="fsm-link fsm-resend" disabled>دوباره بفرستید<span class="fsm-rt"></span></button></p></form>'
    // forgot 1
    + '<form id="fsm-forgot" novalidate hidden><h3 style="margin:.2rem 0;font-size:1rem">رمز را فراموش کرده‌اید؟ پیش می‌آید!</h3><p class="mut">ایمیل حسابتان را بنویسید تا یک کد کوتاه برای ساختن رمز تازه بفرستیم.</p>'
    + '<label for="fsm-fe">ایمیل</label><input id="fsm-fe" name="email" type="email" inputmode="email" autocomplete="email" dir="ltr" maxlength="120" placeholder="name@gmail.com" required>'
    + '<button type="submit" class="fsm-btn">ارسال کد بازیابی</button>'
    + '<p class="fsm-sw"><button type="button" class="fsm-link" data-go="login">بازگشت به ورود</button></p></form>'
    // forgot 2
    + '<form id="fsm-reset" novalidate hidden><div class="fsm-ok" role="status">اگر این ایمیل در فروغ‌شمار حساب داشته باشد، یک کد ۵ رقمی به <b dir="ltr" class="fsm-to"></b> فرستادیم. کد تا <span class="fsm-exp">۳۰:۰۰</span> معتبر است؛ پوشه‌ی هرزنامه را هم ببینید.</div>'
    + '<label for="fsm-rc">کد بازیابی</label><input id="fsm-rc" name="code" class="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="5">'
    + PWF('fsm-rp', 'password', 'رمز تازه', 'new-password', true)
    + '<p class="mut">با ذخیره‌ی رمز تازه، برای امنیت بیشتر، ورودهای دیگر حسابتان بسته می‌شود.</p>'
    + '<button type="submit" class="fsm-btn">ذخیره‌ی رمز تازه و ورود</button>'
    + '<p style="text-align:center;margin-top:.6rem"><button type="button" class="fsm-link fsm-resend" disabled>دوباره بفرستید<span class="fsm-rt"></span></button> · <button type="button" class="fsm-link" data-go="login">بازگشت به ورود</button></p></form>'
    + '<p class="mut" style="margin-top:.9rem;font-size:.8rem">با ورود، یک کوکی امن فقط برای نگه داشتن ورود شما (حداکثر ۳۰ روز) ذخیره می‌شود. <a href="/privacy/#account">بیشتر بخوانید</a></p>'
    + '</div>';
  var back, box, inline = false, last, view = 'login', email = '', S = {}, tExp = null, tRes = null;
  function $(s) { return box.querySelector(s); }
  function $$(s) { return [].slice.call(box.querySelectorAll(s)); }
  function score(p) { var s = 0; if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return p.length < 8 ? Math.min(s, 1) : Math.min(s, 4); }
  var cssOn = false; function css() { if (cssOn) return; cssOn = true; var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); }
  function build(host) {
    css();
    box = document.createElement('div'); box.className = 'fsm' + (host ? ' inline' : ''); box.setAttribute('lang', 'fa'); box.setAttribute('dir', 'rtl'); box.innerHTML = HTML;
    if (host) { inline = true; host.appendChild(box); $('.fsm-x').remove(); $('#fsm-h').remove(); }
    else {
      back = document.createElement('div'); back.className = 'fsm-back'; back.hidden = true;
      box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'fsm-h');
      back.appendChild(box); document.body.appendChild(back);
      $('.fsm-x').addEventListener('click', close);
      back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });
      back.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key === 'Tab') {
          var f = $$('button,input,a[href]').filter(function (x) { return !x.disabled && x.offsetParent !== null && x.getAttribute('tabindex') !== '-1'; });
          if (!f.length) return; var a = f[0], z = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        }
      });
    }
    box.addEventListener('keydown', function (e) { if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.getAttribute('role') === 'tab') { e.preventDefault(); go(view === 'login' ? 'signup' : 'login', true); } });
    $('#fsm-t-login').addEventListener('click', function () { go('login', true); });
    $('#fsm-t-signup').addEventListener('click', function () { go('signup', true); });
    $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { var to = b.getAttribute('data-go'); carry(to); stopT(); go(to); }); });
    $$('.fsm-eye').forEach(function (b) { b.addEventListener('click', function () { var i = document.getElementById(b.getAttribute('aria-controls')), on = i.type === 'password'; i.type = on ? 'text' : 'password'; b.textContent = on ? 'پنهان' : 'نمایش'; b.setAttribute('aria-pressed', on); i.focus(); }); });
    $$('.meter').forEach(function (m) {
      var inp = m.previousElementSibling.querySelector('input'), h = m.nextElementSibling;
      inp.addEventListener('input', function () {
        var p = inp.value, s = score(p), C = ['#c0563f', '#c0563f', '#d4a137', '#8fb34a', '#3f9e6e'];
        m.firstChild.style.width = (p ? (s + 1) * 20 : 0) + '%'; m.firstChild.style.background = C[s];
        h.textContent = !p ? 'دست‌کم ۸ نویسه؛ ترکیب حروف، عدد و نشانه رمز را محکم‌تر می‌کند.' : p.length < 8 ? 'هنوز کوتاه است؛ ' + fa(8 - p.length) + ' نویسه‌ی دیگر لازم است.' : ['ساده است؛ کمی عدد یا نشانه اضافه کنید.', 'ساده است؛ کمی عدد یا نشانه اضافه کنید.', 'بد نیست؛ با چند نویسه‌ی بیشتر محکم‌تر می‌شود.', 'خوب و محکم است.', 'عالی؛ رمزی محکم و امن!'][s];
      });
    });
    $$('form').forEach(function (f) { f.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) { e.target.removeAttribute('aria-invalid'); [].forEach.call(f.querySelectorAll('.fsm-err'), function (x) { x.remove(); }); } }); });
    $('#fsm-login').addEventListener('submit', doLogin);
    $('#fsm-signup').addEventListener('submit', doSignup);
    $('#fsm-code').addEventListener('submit', doVerify);
    $('#fsm-forgot').addEventListener('submit', doForgot);
    $('#fsm-reset').addEventListener('submit', doReset);
    $$('.fsm-resend').forEach(function (b) { b.addEventListener('click', function () { if (view === 'code') sendSignup(b, $('#fsm-code')); else sendReset(b, $('#fsm-reset')); }); });
    var c = $('#fsm-c'); c.addEventListener('input', function () { var v = latin(c.value).replace(/\D/g, '').slice(0, 5); if (v !== c.value) c.value = v; if (v.length === 5 && !c.dataset.busy) doVerify(); });
    var rc = $('#fsm-rc'); rc.addEventListener('input', function () { var v = latin(rc.value).replace(/\D/g, '').slice(0, 5); if (v !== rc.value) rc.value = v; });
  }
  function carry(to) {   // keep the e-mail when moving between forms
    var cur = { login: '#fsm-le', signup: '#fsm-se', forgot: '#fsm-fe' }[view], nx = { login: '#fsm-le', signup: '#fsm-se', forgot: '#fsm-fe' }[to];
    if (cur && nx && $(cur).value && !$(nx).value) $(nx).value = $(cur).value;
  }
  function go(v, focusTab) {
    if ((v === 'login' || v === 'signup') && view !== v) carry(v);
    view = v; var L = v !== 'signup' && v !== 'code';
    $('#fsm-t-login').setAttribute('aria-selected', L); $('#fsm-t-signup').setAttribute('aria-selected', !L);
    $('#fsm-t-login').tabIndex = L ? 0 : -1; $('#fsm-t-signup').tabIndex = L ? -1 : 0;
    $('#fsm-panel').setAttribute('aria-labelledby', L ? 'fsm-t-login' : 'fsm-t-signup');
    ['login', 'signup', 'code', 'forgot', 'reset'].forEach(function (k) { $('#fsm-' + k).hidden = k !== v; });
    $$('form').forEach(clearErr);
    if (focusTab) $(L ? '#fsm-t-login' : '#fsm-t-signup').focus();
    else { var f = $('#fsm-' + v), el = [].filter.call(f.querySelectorAll('input:not([tabindex="-1"])'), function (x) { return !x.value && x.type !== 'checkbox'; })[0] || f.querySelector('input'); if (el) setTimeout(function () { el.focus(); }, 30); }
  }
  function clearErr(f) { [].forEach.call(f.querySelectorAll('.fsm-err'), function (x) { x.remove(); }); [].forEach.call(f.querySelectorAll('[aria-invalid]'), function (x) { x.removeAttribute('aria-invalid'); }); }
  function err(f, msg, field, extra) {
    clearErr(f); var d = document.createElement('div'); d.className = 'fsm-err'; d.setAttribute('role', 'alert'); d.textContent = msg || DOWN;
    if (extra) d.appendChild(extra);
    var b = f.querySelector('button[type=submit]'); b.parentNode.insertBefore(d, b);
    var el = field && f.elements[field]; if (el && el.setAttribute) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  }
  function first(j) { var k = j && j.fields && Object.keys(j.fields)[0]; return k; }
  function busy(b, on, t) { if (on) { b.dataset.t = b.textContent; b.textContent = t; b.disabled = true; } else { b.textContent = b.dataset.t || b.textContent; b.disabled = false; } }
  function stopT() { clearInterval(tExp); clearInterval(tRes); }
  function timers(f, e, r) {
    stopT(); var te = f.querySelector('.fsm-exp'), rb = f.querySelector('.fsm-resend'), rt = f.querySelector('.fsm-rt');
    te.textContent = mmss(e); rb.disabled = true; rt.textContent = ' (' + mmss(r) + ')';
    tExp = setInterval(function () { e--; te.textContent = mmss(Math.max(e, 0)); if (e <= 0) { clearInterval(tExp); te.textContent = '— زمانش گذشت؛ یک کد تازه بگیرید'; } }, 1000);
    tRes = setInterval(function () { r--; rt.textContent = r > 0 ? ' (' + mmss(r) + ')' : ''; if (r <= 0) { clearInterval(tRes); rb.disabled = false; } }, 1000);
  }
  function getMail(f, el) {
    var v = latin(el.value).trim().toLowerCase();
    if (!v) { err(f, 'ایمیلتان را بنویسید.', el.name); return null; }
    if (!MAILRE.test(v)) { err(f, 'به نظر می‌رسد ایمیل کمی جا افتاده؛ مثلاً name@gmail.com', el.name); return null; }
    return v;
  }
  function doLogin(e) {
    e.preventDefault(); var f = $('#fsm-login'), b = f.querySelector('button[type=submit]'); clearErr(f);
    var em = getMail(f, f.email); if (!em) return;
    if (!f.password.value) return err(f, 'رمز عبورتان را بنویسید.', 'password');
    busy(b, true, 'در حال ورود…');
    call({ action: 'login', email: em, password: f.password.value }).then(function (j) {
      busy(b, false);
      if (j.ok) return done(j, 0);
      if (j._status === 503) unavailable(j.error);
      var x = null;
      if (j._status === 422) { x = document.createElement('div'); x.style.marginTop = '.4rem'; x.innerHTML = 'تازه‌وارد هستید؟ <button type="button" class="fsm-link">با همین ایمیل ثبت‌نام کنید ←</button>'; x.querySelector('button').addEventListener('click', function () { $('#fsm-se').value = em; go('signup'); }); }
      err(f, j.error, j._status === 422 ? 'password' : null, x); f.password.select();
    }).catch(function () { busy(b, false); err(f, DOWN); });
  }
  function signupData() { var f = $('#fsm-signup'); return { email: email, first_name: f.first_name.value.trim(), last_name: f.last_name.value.trim(), password: f.password.value, accept_terms: f.accept_terms.checked, website: f.website.value }; }
  function doSignup(e) {
    e.preventDefault(); var f = $('#fsm-signup'); clearErr(f);
    if (f.first_name.value.trim().length < 2) return err(f, 'نامتان را بنویسید تا بدانیم چطور صدایتان کنیم.', 'first_name');
    if (f.last_name.value.trim().length < 2) return err(f, 'نام خانوادگی‌تان را هم بنویسید.', 'last_name');
    var em = getMail(f, f.email); if (!em) return;
    if (f.password.value.length < 8) return err(f, 'رمز عبور دست‌کم ۸ نویسه باشد تا حسابتان امن بماند.', 'password');
    if (!f.accept_terms.checked) return err(f, 'برای ساخت حساب، لطفاً قوانین و حریم خصوصی را بپذیرید.', 'accept_terms');
    email = em; sendSignup(f.querySelector('button[type=submit]'), f);
  }
  function sendSignup(b, f) {
    busy(b, true, 'در حال فرستادن کد…'); var d = signupData(); d.action = 'signup_send';
    call(d).then(function (j) {
      busy(b, false);
      if (!j.ok) { if (j._status === 503) unavailable(j.error); if (f.id === 'fsm-code' && j.fields) { go('signup'); f = $('#fsm-signup'); } return err(f, j.error, first(j)); }
      $('#fsm-code .fsm-to').textContent = email; $('#fsm-c').value = ''; go('code'); timers($('#fsm-code'), j.expires_in || 600, j.resend_in || 60);
    }).catch(function () { busy(b, false); err(f, DOWN); });
  }
  function doVerify(e) {
    if (e) e.preventDefault(); var f = $('#fsm-code'), c = $('#fsm-c'), b = f.querySelector('button[type=submit]'); clearErr(f);
    var code = latin(c.value).replace(/\D/g, '');
    if (code.length !== 5) return err(f, 'کد ۵ رقمی ایمیل را کامل بنویسید.', 'code');
    c.dataset.busy = '1'; busy(b, true, 'در حال ساخت حساب…');
    var d = signupData(); d.action = 'signup_verify'; d.code = code;
    call(d).then(function (j) {
      busy(b, false); delete c.dataset.busy;
      if (!j.ok) { c.select(); if (j._status === 409) { var x = document.createElement('div'); x.innerHTML = '<button type="button" class="fsm-link">رفتن به ورود ←</button>'; x.firstChild.addEventListener('click', function () { $('#fsm-le').value = email; stopT(); go('login'); }); return err(f, j.error, null, x); } return err(f, j.error, 'code'); }
      stopT(); done(j, j.bonus || 0);
    }).catch(function () { busy(b, false); delete c.dataset.busy; err(f, DOWN); });
  }
  function doForgot(e) {
    e.preventDefault(); var f = $('#fsm-forgot'); clearErr(f);
    var em = getMail(f, f.email); if (!em) return; email = em; sendReset(f.querySelector('button[type=submit]'), f);
  }
  function sendReset(b, f) {
    busy(b, true, 'در حال فرستادن…');
    call({ action: 'reset_send', email: email }).then(function (j) {
      busy(b, false);
      if (!j.ok) { if (j._status === 503) unavailable(j.error); return err(f, j.error, first(j)); }
      $('#fsm-reset .fsm-to').textContent = email; $('#fsm-rc').value = ''; go('reset'); timers($('#fsm-reset'), j.expires_in || 1800, j.resend_in || 60);
    }).catch(function () { busy(b, false); err(f, DOWN); });
  }
  function doReset(e) {
    e.preventDefault(); var f = $('#fsm-reset'), b = f.querySelector('button[type=submit]'); clearErr(f);
    var code = latin(f.code.value).replace(/\D/g, '');
    if (code.length !== 5) return err(f, 'کد ۵ رقمی ایمیل را کامل بنویسید.', 'code');
    if (f.password.value.length < 8) return err(f, 'رمز تازه دست‌کم ۸ نویسه باشد.', 'password');
    busy(b, true, 'در حال ذخیره…');
    call({ action: 'reset_set', email: email, code: code, password: f.password.value }).then(function (j) {
      busy(b, false);
      if (!j.ok) return err(f, j.error, first(j));
      stopT(); done(j, 0, 'رمز تازه‌تان ذخیره شد و وارد شدید. ورودهای دیگر حساب، برای امنیت بیشتر، بسته شدند.');
    }).catch(function () { busy(b, false); err(f, DOWN); });
  }
  function done(j, bonus, msg) {
    try { localStorage.setItem('fs-member', '1'); } catch (e) {}
    var name = j.member ? (j.member.first_name || '') : '';
    var t = msg || (bonus ? (name + ' عزیز، به خانواده‌ی فروغ‌شمار خوش آمدید! ' + fa(bonus) + ' پر سیمرغ هدیه در حسابتان نشست.') : ((name ? name + ' عزیز، ' : '') + 'خوش برگشتید!'));
    if (inline) { try { sessionStorage.setItem('fs-toast', t); } catch (e) {} var n = new URLSearchParams(location.search).get('next') || ''; location.replace(/^\/[A-Za-z0-9\-\/]*$/.test(n) && n.indexOf('//') < 0 ? n : '/account/'); return; }
    [].forEach.call(document.querySelectorAll('.fs-acct'), function (a) { a.href = '/account/'; a.title = 'حساب من'; a.setAttribute('aria-label', 'حساب من'); var s = a.querySelector('span'); if (s) s.textContent = 'حساب من'; });
    close(); toast(t);
    try { document.dispatchEvent(new CustomEvent('fs-member-change', { detail: { member: j.member || null } })); } catch (e) {}
  }
  function toast(t) { css(); var d = document.createElement('div'); d.className = 'fs-toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 6000); }
  function unavailable(msg) { var u = $('#fsm-unav'); u.hidden = false; u.textContent = msg || UNAV; $$('button[type=submit]').forEach(function (b) { b.disabled = true; }); }
  function status() { call().then(function (j) { if (j.ok && j.bonus) $$('.fsm-gift').forEach(function (g) { g.textContent = (j.bonus === 3 ? 'سه' : fa(j.bonus)) + ' پر سیمرغ'; if (j.bonus > 3) g.innerHTML = '<strong>' + g.textContent + '</strong> (هدیه‌ی ویژه‌ی جشن افتتاحیه)'; }); if (j.ok && j.logged_in) { done(j, 0); return; } if (!j.ok || !j.available) unavailable(j.error); else if (j.auth !== 'password') unavailable('ورود با رمز عبور در حال آماده شدن است؛ چند دقیقه‌ی دیگر دوباره سر بزنید.'); }).catch(function () { unavailable(UNAV); }); }
  function open(t, trigger) {
    try { if (localStorage.getItem('fs-member') === '1') { location.href = '/account/'; return; } } catch (e) {}
    if (!box) build(null);
    last = trigger || document.activeElement; stopT();
    $$('form').forEach(function (f) { f.reset(); }); $$('.fsm-eye').forEach(function (b) { var i = document.getElementById(b.getAttribute('aria-controls')); i.type = 'password'; b.textContent = 'نمایش'; });
    $('#fsm-unav').hidden = true; $$('button[type=submit]').forEach(function (b) { b.disabled = false; });
    back.hidden = false; document.documentElement.style.overflow = 'hidden';
    go(t === 'signup' ? 'signup' : 'login'); status();
  }
  function close() { if (!back || back.hidden) return; stopT(); back.hidden = true; document.documentElement.style.overflow = ''; if (last && last.focus) last.focus(); }
  function mount(host) { build(host); go(/[?&]tab=signup\b/.test(location.search) ? 'signup' : 'login'); status(); }
  window.FSLogin = { open: open, close: close, mount: mount };
  try { var tt = sessionStorage.getItem('fs-toast'); if (tt) { sessionStorage.removeItem('fs-toast'); (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', function () { toast(tt); }) : toast(tt)); } } catch (e) {}
})();
