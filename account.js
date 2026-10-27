/* فروغ‌شمار — ورود و ثبت‌نام با موبایل و کد پیامکی، و «حساب من» */
(function () {
  'use strict';
  var API = 'https://panel.foroughshomar.ir/api/';
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && (/[?&]acctapi=local/.test(location.search) || sessionStorage.getItem('fs-acctapi'))) { sessionStorage.setItem('fs-acctapi', '1'); API = location.origin + '/api/'; } } catch (e) {}
  var UNAV = 'ورود موقتاً در دسترس نیست. لطفاً کمی بعد دوباره امتحان کنید.';
  var DOWN = 'ارتباط با سامانه برقرار نشد. اینترنت را بررسی کنید و دوباره امتحان کنید.';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fa(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '٬').replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
  function latin(s) { return String(s || '').replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); }
  function flag(on) { try { if (on) localStorage.setItem('fs-member', '1'); else localStorage.removeItem('fs-member'); } catch (e) {} }
  var CSRF = '';
  function call(file, data) {
    var o = { method: data ? 'POST' : 'GET', credentials: 'include', headers: {} };
    if (data) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(data); }
    if (CSRF) o.headers['X-CSRF-Token'] = CSRF;
    return fetch(API + file, o).then(function (r) {
      return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {} if (!j || typeof j !== 'object') throw new Error('bad'); j._status = r.status; return j; });
    });
  }
  function clearErr(form) { $$('.ferr', form).forEach(function (x) { x.remove(); }); $$('[aria-invalid]', form).forEach(function (x) { x.removeAttribute('aria-invalid'); }); $$('.fs-errbox', form).forEach(function (x) { x.remove(); }); }
  function showErr(form, j) {
    var first = null;
    Object.keys((j && j.fields) || {}).forEach(function (k) {
      var el = form.elements[k]; if (!el || el.type === 'hidden') return;
      el.setAttribute('aria-invalid', 'true'); var m = document.createElement('p'); m.className = 'ferr'; m.textContent = j.fields[k];
      var host = el.closest('.fs-field') || el.parentNode; host.appendChild(m); if (!first) first = el;
    });
    var box = document.createElement('div'); box.className = 'fs-errbox'; box.setAttribute('role', 'alert'); box.textContent = (j && j.error) || DOWN;
    var btn = $('button[type=submit]', form); if (btn) btn.parentNode.insertBefore(box, btn); else form.appendChild(box);
    if (first) first.focus();
  }
  function busy(btn, on, label) { if (!btn) return; if (on) { btn.dataset.t = btn.textContent; btn.textContent = label || 'لطفاً صبر کنید…'; btn.disabled = true; } else { btn.textContent = btn.dataset.t || btn.textContent; btn.disabled = false; } }
  function next() { var n = new URLSearchParams(location.search).get('next') || ''; return /^\/[A-Za-z0-9\-\/]*$/.test(n) && n.indexOf('//') < 0 ? n : '/account/'; }
  function normPhone(v) { v = latin(v).replace(/[\s\-()]/g, ''); if (/^\+98/.test(v)) v = '0' + v.slice(3); else if (/^0098/.test(v)) v = '0' + v.slice(4); else if (/^9\d{9}$/.test(v)) v = '0' + v; return v; }
  function mmss(s) { var m = Math.floor(s / 60), x = s % 60; return fa(m) + ':' + (x < 10 ? '۰' : '') + fa(x); }

  /* ---------------- ورود / ثبت‌نام ---------------- */
  function login() {
    var root = $('#fs-login'); if (!root) return;
    var fPhone = $('#fs-l-phone'), fCode = $('#fs-l-code'), fProf = $('#fs-l-profile'), steps = $$('.fs-steps li', root);
    var phone = '', token = '', tExp = null, tRes = null;
    function step(n) {
      [fPhone, fCode, fProf].forEach(function (f, i) { f.hidden = i !== n; });
      steps.forEach(function (li, i) { li.classList.toggle('done', i < n); if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
      var f = [fPhone, fCode, fProf][n], el = f && $('input:not([type=hidden]):not([tabindex="-1"])', f); if (el) setTimeout(function () { el.focus(); }, 30);
    }
    function unavailable(msg) {
      var n = $('#fs-l-unav'); n.hidden = false; n.querySelector('p').textContent = msg || UNAV;
      $$('button[type=submit]', root).forEach(function (b) { b.disabled = true; });
    }
    call('auth.php?action=status').then(function (j) {
      if (j.ok && j.logged_in) { flag(true); location.replace(next()); return; }
      if (!j.ok || !j.available) unavailable(j.error);
    }).catch(function () { unavailable(UNAV); });

    function timers(expires, resend) {
      clearInterval(tExp); clearInterval(tRes);
      var e = expires, r = resend, te = $('#fs-l-exp'), rb = $('#fs-l-resend'), rt = $('#fs-l-rt');
      te.textContent = mmss(e); rb.disabled = true; rt.textContent = ' (' + mmss(r) + ')';
      tExp = setInterval(function () { e--; te.textContent = mmss(Math.max(e, 0)); if (e <= 0) { clearInterval(tExp); te.textContent = 'کد منقضی شد'; } }, 1000);
      tRes = setInterval(function () { r--; rt.textContent = r > 0 ? ' (' + mmss(r) + ')' : ''; if (r <= 0) { clearInterval(tRes); rb.disabled = false; } }, 1000);
    }
    function send(btn, form) {
      clearErr(form); busy(btn, true, 'در حال فرستادن کد…');
      return call('auth.php', { action: 'send', phone: phone, website: fPhone.website.value }).then(function (j) {
        busy(btn, false);
        if (!j.ok) { if (j._status === 503) unavailable(j.error); if (j.fields && j.fields.phone && form !== fPhone) { step(0); form = fPhone; } showErr(form, j); return false; }
        $('#fs-l-to').textContent = phone.replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; });
        step(1); fCode.code.value = ''; timers(j.expires_in || 120, j.resend_in || 60); return true;
      }).catch(function () { busy(btn, false); showErr(form, { error: DOWN }); });
    }
    fPhone.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(fPhone);
      phone = normPhone(fPhone.phone.value);
      if (!/^09\d{9}$/.test(phone)) return showErr(fPhone, { error: 'شماره موبایل را درست بنویسید.', fields: { phone: 'شماره موبایل را کامل و مثل ۰۹۱۲۳۴۵۶۷۸۹ بنویسید.' } });
      send($('button[type=submit]', fPhone), fPhone);
    });
    $('#fs-l-edit').addEventListener('click', function () { clearInterval(tExp); clearInterval(tRes); step(0); });
    $('#fs-l-resend').addEventListener('click', function () { send($('#fs-l-resend'), fCode); });
    fCode.code.addEventListener('input', function () { var v = latin(fCode.code.value).replace(/\D/g, '').slice(0, 5); if (v !== fCode.code.value) fCode.code.value = v; if (v.length === 5 && !fCode.dataset.busy) fCode.requestSubmit ? fCode.requestSubmit() : fCode.dispatchEvent(new Event('submit')); });
    fCode.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(fCode);
      var code = latin(fCode.code.value).replace(/\D/g, '');
      if (code.length !== 5) return showErr(fCode, { error: 'کد ۵ رقمی را کامل بنویسید.', fields: { code: 'کد ۵ رقمی پیامک را بنویسید.' } });
      var btn = $('button[type=submit]', fCode); busy(btn, true, 'در حال بررسی…'); fCode.dataset.busy = '1';
      call('auth.php', { action: 'verify', phone: phone, code: code }).then(function (j) {
        busy(btn, false); delete fCode.dataset.busy;
        if (!j.ok) { fCode.code.select(); return showErr(fCode, j); }
        clearInterval(tExp); clearInterval(tRes);
        if (j.status === 'in') { flag(true); location.replace(next()); return; }
        token = j.signup_token; step(2);
      }).catch(function () { busy(btn, false); delete fCode.dataset.busy; showErr(fCode, { error: DOWN }); });
    });
    fProf.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(fProf);
      var d = { action: 'register', phone: phone, signup_token: token, first_name: fProf.first_name.value.trim(), last_name: fProf.last_name.value.trim(),
        email: fProf.email.value.trim(), accept_terms: fProf.accept_terms.checked }, fe = {};
      if (d.first_name.length < 2) fe.first_name = 'لطفاً نام را بنویسید.';
      if (d.last_name.length < 2) fe.last_name = 'لطفاً نام خانوادگی را بنویسید.';
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) fe.email = 'ایمیل درست به نظر نمی‌رسد. نمونه‌ی درست: name@gmail.com';
      if (!d.accept_terms) fe.accept_terms = 'برای ساخت حساب، قوانین و حریم خصوصی را بپذیرید.';
      if (Object.keys(fe).length) return showErr(fProf, { error: 'چند مورد نیاز به اصلاح دارد.', fields: fe });
      var btn = $('button[type=submit]', fProf); busy(btn, true, 'در حال ساخت حساب…');
      call('auth.php', d).then(function (j) {
        busy(btn, false);
        if (!j.ok) { if (j._status === 410) { step(0); return showErr(fPhone, j); } return showErr(fProf, j); }
        flag(true); location.replace(next() + (j.bonus ? (next().indexOf('?') < 0 ? '?' : '&') + 'welcome=' + j.bonus : ''));
      }).catch(function () { busy(btn, false); showErr(fProf, { error: DOWN }); });
    });
    step(0);
  }

  /* ---------------- حساب من ---------------- */
  function account() {
    var root = $('#fs-account'); if (!root) return;
    var M = null;
    function render(j) {
      M = j.member; CSRF = j.csrf || CSRF;
      $('#fs-a-loading').hidden = true; $('#fs-a-body').hidden = false;
      $('#fs-a-hello').textContent = (M.first_name + ' ' + M.last_name).trim() + ' عزیز، خوش آمدید';
      $('#fs-a-phone').textContent = M.phone.replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; });
      $('#fs-a-since').textContent = M.since;
      $('#fs-a-bal').textContent = fa(M.feathers);
      var sw = $('#fs-a-notify'); sw.setAttribute('aria-checked', M.notify_email ? 'true' : 'false');
      $('#fs-a-notify-st').textContent = M.notify_email ? 'روشن' : 'خاموش';
      $('#fs-a-noemail').hidden = !!M.email;
      var pf = $('#fs-a-profile'); pf.first_name.value = M.first_name; pf.last_name.value = M.last_name; pf.email.value = M.email;
      var lg = j.feathers_log || [];
      $('#fs-a-log').innerHTML = lg.length ? '<div class="fs-tbl-wrap"><table class="fs-tbl"><thead><tr><th>زمان</th><th>شرح</th><th>تغییر</th><th>موجودی</th></tr></thead><tbody>' + lg.map(function (l) {
        return '<tr><td class="n">' + esc(l.created) + '</td><td>' + esc(l.reason) + (l.ref ? ' <span dir="ltr">' + esc(l.ref) + '</span>' : '') + '</td><td class="n" dir="ltr" style="text-align:end">' + (l.delta > 0 ? '+' : '−') + fa(Math.abs(l.delta)) + '</td><td class="n">' + fa(l.balance) + '</td></tr>';
      }).join('') + '</tbody></table></div>' : '<p class="muted">هنوز تغییری در موجودی ثبت نشده است.</p>';
      var os = j.orders || [];
      $('#fs-a-orders').innerHTML = os.length ? '<div class="fs-tbl-wrap"><table class="fs-tbl"><thead><tr><th>شماره پیگیری</th><th>بسته</th><th>مبلغ (با مالیات)</th><th>وضعیت</th><th>تاریخ</th></tr></thead><tbody>' + os.map(function (o) {
        return '<tr><td><b dir="ltr">' + esc(o.tracking) + '</b></td><td>' + esc(o.title) + '</td><td class="n">' + fa(o.total) + ' تومان<div class="muted">مالیات: ' + fa(o.vat) + '</div></td><td><span class="fs-pill">' + esc(o.status_fa) + '</span></td><td class="n">' + esc(o.created) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="muted">مشکلی با سفارشی دارید؟ <a href="/complaints/">ثبت شکایت یا درخواست</a> (شماره پیگیری سفارش را بنویسید).</p>' : '<p class="muted">هنوز سفارشی ثبت نکرده‌اید. <a href="/shop/">خرید پر سیمرغ</a></p>';
      var qs = j.questions || [];
      $('#fs-a-qs').innerHTML = qs.length ? '<ul class="fs-list">' + qs.map(function (q) {
        return '<li class="fs-qa"><details><summary>' + esc(q.question) + '</summary><div class="a">' + esc(q.answer) + '</div></details><div class="muted" style="font-size:.85rem">' + esc(q.created) + '</div></li>';
      }).join('') + '</ul>' : '<p class="muted">هنوز سؤالی نپرسیده‌اید. <a href="/faq/#ask">از سیمرغ بپرسید</a></p>';
    }
    function load() {
      return call('account.php').then(function (j) {
        if (j.ok && !j.logged_in) { flag(false); location.replace('/login/?next=/account/'); return; }
        if (!j.ok) throw new Error('x');
        flag(true); render(j);
      }).catch(function () { $('#fs-a-loading').innerHTML = '<div class="fs-errbox" role="alert">' + esc(DOWN) + '</div>'; });
    }
    var w = +(new URLSearchParams(location.search).get('welcome') || 0);
    if (w > 0) { var wb = $('#fs-a-welcome'); wb.hidden = false; wb.querySelector('b').textContent = fa(w) + ' پر سیمرغ'; history.replaceState(null, '', location.pathname); }
    load();
    var sw = $('#fs-a-notify');
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') !== 'true'; sw.disabled = true;
      call('account.php', { action: 'notify', on: on }).then(function (j) {
        sw.disabled = false; if (!j.ok) { alert(j.error || DOWN); return; }
        sw.setAttribute('aria-checked', j.notify_email ? 'true' : 'false'); $('#fs-a-notify-st').textContent = j.notify_email ? 'روشن' : 'خاموش';
      }).catch(function () { sw.disabled = false; alert(DOWN); });
    });
    var pf = $('#fs-a-profile');
    pf.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(pf); $('#fs-a-pok').hidden = true;
      var d = { action: 'profile', first_name: pf.first_name.value.trim(), last_name: pf.last_name.value.trim(), email: pf.email.value.trim() }, fe = {};
      if (d.first_name.length < 2) fe.first_name = 'لطفاً نام را بنویسید.';
      if (d.last_name.length < 2) fe.last_name = 'لطفاً نام خانوادگی را بنویسید.';
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) fe.email = 'ایمیل درست به نظر نمی‌رسد. نمونه‌ی درست: name@gmail.com';
      if (Object.keys(fe).length) return showErr(pf, { error: 'چند مورد نیاز به اصلاح دارد.', fields: fe });
      var btn = $('button[type=submit]', pf); busy(btn, true, 'در حال ذخیره…');
      call('account.php', d).then(function (j) {
        busy(btn, false); if (!j.ok) { if (j._status === 401) return location.replace('/login/?next=/account/'); return showErr(pf, j); }
        $('#fs-a-pok').hidden = false; load();
      }).catch(function () { busy(btn, false); showErr(pf, { error: DOWN }); });
    });
    $('#fs-a-logout').addEventListener('click', function () {
      var b = this; busy(b, true, 'در حال خروج…');
      call('account.php', { action: 'logout' }).then(function () { flag(false); location.replace('/'); }, function () { busy(b, false); alert(DOWN); });
    });
    var df = $('#fs-a-delete'), ds = $('#fs-a-del-send');
    ds.addEventListener('click', function () {
      if (!confirm('برای حذف حساب، یک کد تأیید به موبایل شما فرستاده می‌شود. ادامه می‌دهید؟')) return;
      clearErr(df); busy(ds, true, 'در حال فرستادن کد…');
      call('account.php', { action: 'delete_send' }).then(function (j) {
        busy(ds, false); var ob = $('#fs-a-del-err'); if (ob) ob.remove();
        if (!j.ok) { var eb = document.createElement('div'); eb.className = 'fs-errbox'; eb.id = 'fs-a-del-err'; eb.setAttribute('role', 'alert'); eb.textContent = j.error || DOWN; ds.parentNode.insertBefore(eb, ds.nextSibling); return; }
        df.hidden = false; ds.hidden = true; df.code.focus();
      }).catch(function () { busy(ds, false); alert(DOWN); });
    });
    df.code.addEventListener('input', function () { var v = latin(df.code.value).replace(/\D/g, '').slice(0, 5); if (v !== df.code.value) df.code.value = v; });
    df.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(df);
      var code = latin(df.code.value).replace(/\D/g, '');
      if (code.length !== 5) return showErr(df, { error: 'کد ۵ رقمی پیامک را بنویسید.', fields: { code: 'کد ۵ رقمی را کامل بنویسید.' } });
      if (!confirm('حساب شما برای همیشه حذف می‌شود و پرهای باقی‌مانده از بین می‌رود. مطمئنید؟')) return;
      var btn = $('button[type=submit]', df); busy(btn, true, 'در حال حذف…');
      call('account.php', { action: 'delete_confirm', code: code }).then(function (j) {
        busy(btn, false); if (!j.ok) return showErr(df, j);
        flag(false); root.innerHTML = '<div class="fs-ok" role="status"><h2 style="margin-top:0">حساب شما حذف شد</h2><p>اطلاعات شخصی شما پاک شد. سوابق مالی سفارش‌ها، بی‌نام و فقط به اندازه‌ای که قانون مالیات لازم می‌داند نگه داشته می‌شود. <a href="/privacy/#account">جزئیات در حریم خصوصی</a></p><p><a href="/">بازگشت به صفحه‌ی اصلی</a></p></div>';
      }).catch(function () { busy(btn, false); showErr(df, { error: DOWN }); });
    });
  }
  function init() { login(); account(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
