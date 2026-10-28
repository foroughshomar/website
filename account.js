/* فروغ‌شمار — ورود و ثبت‌نام با ایمیل و کد تأیید ایمیلی، و «حساب من» */
(function () {
  'use strict';
  var API = 'https://panel.foroughshomar.ir/api/';
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && (/[?&]acctapi=local/.test(location.search) || sessionStorage.getItem('fs-acctapi'))) { sessionStorage.setItem('fs-acctapi', '1'); API = location.origin + '/api/'; } } catch (e) {}
  var UNAV = 'ورود همین حالا در دسترس نیست؛ لطفاً کمی بعد دوباره سر بزنید.';
  var DOWN = 'ارتباط با سامانه برقرار نشد. اینترنتتان را یک نگاه بیندازید و دوباره امتحان کنید.';
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

  /* ---------------- حساب من ---------------- */
  function account() {
    var root = $('#fs-account'); if (!root) return;
    var M = null;
    function render(j) {
      M = j.member; CSRF = j.csrf || CSRF;
      $('#fs-a-loading').hidden = true; $('#fs-a-body').hidden = false;
      $('#fs-a-hello').textContent = (M.first_name + ' ' + M.last_name).trim() + ' عزیز، خوش آمدید';
      $('#fs-a-phone').textContent = M.email || '';
      $('#fs-a-since').textContent = M.since;
      $('#fs-a-bal').textContent = fa(M.feathers);
      var sw = $('#fs-a-notify'); sw.setAttribute('aria-checked', M.notify_email ? 'true' : 'false');
      $('#fs-a-notify-st').textContent = M.notify_email ? 'روشن' : 'خاموش';
      $('#fs-a-noemail').hidden = !!M.email;
      var pf = $('#fs-a-profile'); pf.first_name.value = M.first_name; pf.last_name.value = M.last_name; pf.email.value = M.email;
      var lg = j.feathers_log || [];
      $('#fs-a-log').innerHTML = lg.length ? '<div class="fs-tbl-wrap"><table class="fs-tbl"><thead><tr><th>زمان</th><th>شرح</th><th>تغییر</th><th>موجودی</th></tr></thead><tbody>' + lg.map(function (l) {
        return '<tr><td class="n">' + esc(l.created) + '</td><td>' + esc(l.reason) + (l.ref ? ' <span dir="ltr">' + esc(l.ref) + '</span>' : '') + '</td><td class="n" dir="ltr" style="text-align:end">' + (l.delta > 0 ? '+' : '−') + fa(Math.abs(l.delta)) + '</td><td class="n">' + fa(l.balance) + '</td></tr>';
      }).join('') + '</tbody></table></div>' : '<p class="muted">هنوز تغییری در موجودی‌تان ثبت نشده است.</p>';
      var os = j.orders || [];
      $('#fs-a-orders').innerHTML = os.length ? '<div class="fs-tbl-wrap"><table class="fs-tbl"><thead><tr><th>شماره پیگیری</th><th>بسته</th><th>مبلغ (با مالیات)</th><th>وضعیت</th><th>تاریخ</th></tr></thead><tbody>' + os.map(function (o) {
        return '<tr><td><b dir="ltr">' + esc(o.tracking) + '</b></td><td>' + esc(o.title) + '</td><td class="n">' + fa(o.total) + ' تومان<div class="muted">مالیات: ' + fa(o.vat) + '</div></td><td><span class="fs-pill">' + esc(o.status_fa) + '</span></td><td class="n">' + esc(o.created) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="muted">مشکلی با سفارشی دارید؟ <a href="/complaints/">ثبت شکایت یا درخواست</a> (شماره پیگیری سفارش را بنویسید).</p>' : '<p class="muted">هنوز سفارشی ثبت نکرده‌اید. هر وقت خواستید، <a href="/shop/">پر سیمرغ</a> در دسترس است.</p>';
      var qs = j.questions || [];
      $('#fs-a-qs').innerHTML = qs.length ? '<ul class="fs-list">' + qs.map(function (q) {
        return '<li class="fs-qa"><details><summary>' + esc(q.question) + '</summary><div class="a">' + esc(q.answer) + '</div></details><div class="muted" style="font-size:.85rem">' + esc(q.created) + '</div></li>';
      }).join('') + '</ul>' : '<p class="muted">هنوز پرسشی نپرسیده‌اید؛ سیمرغ منتظر اولین پرسش شماست. <a href="/faq/#ask">از ما بپرسید</a></p>';
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
      var d = { action: 'profile', first_name: pf.first_name.value.trim(), last_name: pf.last_name.value.trim() }, fe = {};
      if (d.first_name.length < 2) fe.first_name = 'نامتان را بنویسید.';
      if (d.last_name.length < 2) fe.last_name = 'نام خانوادگی‌تان را هم بنویسید.';
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) fe.email = 'ایمیل درست به نظر نمی‌رسد. نمونه‌ی درست: name@gmail.com';
      if (Object.keys(fe).length) return showErr(pf, { error: 'فقط چند مورد کوچک مانده؛ لطفاً نگاهی بیندازید.', fields: fe });
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
    // password: set (if none yet) or change; other sessions are closed by the server
    var pw = $('#fs-a-pw');
    function pwMode() { var has = M && M.has_password; $$('input[name=username]', root).forEach(function (u) { u.value = M.email || ''; }); $('#fs-a-pw-cur').hidden = !has; $('#fs-a-pw-lead').textContent = has ? 'هر وقت خواستید رمزتان را عوض کنید؛ ورودهای دیگر حساب، برای امنیت بیشتر، بسته می‌شوند.' : 'هنوز رمزی برای حسابتان نساخته‌اید؛ همین حالا یکی بسازید تا ورود و حذف حساب آسان و امن باشد.'; $('button[type=submit]', pw).textContent = has ? 'تغییر رمز' : 'ساختن رمز'; }
    pw.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(pw); $('#fs-a-pw-ok').hidden = true;
      var d = { action: 'password', current_password: pw.current_password.value, new_password: pw.new_password.value };
      if (M.has_password && !d.current_password) return showErr(pw, { error: 'رمز فعلی را بنویسید.', fields: { current_password: 'رمز فعلی را بنویسید.' } });
      if (d.new_password.length < 8) return showErr(pw, { error: 'رمز تازه دست‌کم ۸ نویسه باشد تا حسابتان امن بماند.', fields: { new_password: 'دست‌کم ۸ نویسه.' } });
      var btn = $('button[type=submit]', pw); busy(btn, true, 'در حال ذخیره…');
      call('account.php', d).then(function (j) {
        busy(btn, false); if (!j.ok) return showErr(pw, j);
        M = j.member; pw.reset(); pwMode(); $('#fs-a-pw-ok').hidden = false;
      }).catch(function () { busy(btn, false); showErr(pw, { error: DOWN }); });
    });
    $$('.fs-eye', root).forEach(function (b) { b.addEventListener('click', function () { var i = document.getElementById(b.getAttribute('aria-controls')), on = i.type === 'password'; i.type = on ? 'text' : 'password'; b.textContent = on ? 'پنهان' : 'نمایش'; b.setAttribute('aria-pressed', on); }); });
    var _render = render; render = function (j) { _render(j); pwMode(); };
    // delete: confirmed with the current password
    var df = $('#fs-a-delete'), ds = $('#fs-a-del-send');
    ds.addEventListener('click', function () {
      var ob = $('#fs-a-del-err'); if (ob) ob.remove();
      if (!M.has_password) { var eb = document.createElement('div'); eb.className = 'fs-errbox'; eb.id = 'fs-a-del-err'; eb.setAttribute('role', 'alert'); eb.textContent = 'برای حذف حساب، اول از بخش «رمز عبور» همین صفحه یک رمز بسازید.'; ds.parentNode.insertBefore(eb, ds.nextSibling); return; }
      df.hidden = false; ds.hidden = true; df.password.focus();
    });
    $('#fs-a-del-cancel').addEventListener('click', function () { df.reset(); clearErr(df); df.hidden = true; ds.hidden = false; ds.focus(); });
    df.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(df);
      if (!df.password.value) return showErr(df, { error: 'برای تأیید، رمز عبورتان را بنویسید.', fields: { password: 'رمز عبورتان را بنویسید.' } });
      if (!confirm('حسابتان برای همیشه حذف می‌شود و پرهای باقی‌مانده هم از بین می‌رود. این کار برگشت ندارد. مطمئنید؟')) return;
      var btn = $('button[type=submit]', df); busy(btn, true, 'در حال حذف…');
      call('account.php', { action: 'delete_confirm', password: df.password.value }).then(function (j) {
        busy(btn, false); if (!j.ok) return showErr(df, j);
        flag(false); root.innerHTML = '<div class="fs-ok" role="status"><h2 style="margin-top:0">حسابتان حذف شد</h2><p>از همراهی‌تان صمیمانه سپاسگزاریم. ایمیل و مشخصات حسابتان پاک شد؛ فقط سوابق مالی سفارش‌ها، با نام خریدار و به مدتی که قانون مالیات لازم می‌داند، نگه داشته می‌شود. <a href="/privacy/#account">جزئیات در حریم خصوصی</a></p><p>هر وقت خواستید، درِ فروغ‌شمار به رویتان باز است. <a href="/">بازگشت به صفحه‌ی اصلی</a></p></div>';
      }).catch(function () { busy(btn, false); showErr(df, { error: DOWN }); });
    });
  }
  function init() { account(); }   // /login/ is rendered by login-modal.js (FSLogin.mount)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
