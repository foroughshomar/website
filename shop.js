/* فروغ‌شمار — خرید پر سیمرغ، پیگیری و ثبت شکایت (بدون درگاه پرداخت؛ فقط ثبت سفارش) */
(function () {
  'use strict';
  var API = 'https://panel.foroughshomar.ir/api/';
  var VAT = 10;
  var PKG = { p10: { f: 10, price: 209000 }, p30: { f: 30, price: 539000 }, p100: { f: 100, price: 1529000 } };
  var MAIL = 'info@foroughshomar.ir';
  var SELLER = '<tr><th scope="row">فروشنده</th><td>نام ثبتی: فروغ‌شمار سیمرغ</td></tr><tr><th scope="row">نشانی فروشنده</th><td>تهران، شهرزیبا، میدان کودک، کوچه شاداب، بن‌بست لاله، پلاک ۱۴، واحد ۱، کد پستی: ۱۴۷۴۶۱۴۳۶۱</td></tr><tr><th scope="row">ایمیل فروشنده</th><td dir="ltr" style="text-align:right">' + MAIL + '</td></tr>';
  function fa(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬').replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
  function inv(k) { var p = PKG[k]; if (!p) return null; var v = Math.round(p.price * VAT / 100); return { title: 'بسته‌ی ' + fa(p.f) + ' پر سیمرغ', f: p.f, price: p.price, vat: v, total: p.price + v }; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  var DOWN = 'سامانه‌ی ثبت هنوز در حال راه‌اندازی است یا اینترنت قطع شد. چند دقیقه‌ی دیگر دوباره امتحان کنید؛ اگر باز هم نشد، به ' + MAIL + ' ایمیل بزنید.';

  function post(file, data, cred) {
    return fetch(API + file, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), credentials: cred ? 'include' : 'omit' })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {} if (!j || typeof j !== 'object') throw new Error('bad'); return j; }); });
  }
  function clearErr(form) { $$('.ferr', form).forEach(function (x) { x.remove(); }); $$('[aria-invalid]', form).forEach(function (x) { x.removeAttribute('aria-invalid'); }); var b = $('.fs-errbox', form); if (b) b.remove(); }
  function showErr(form, j) {
    var first = null;
    Object.keys((j && j.fields) || {}).forEach(function (k) {
      var el = form.elements[k]; if (!el) return; if (el.length && !el.tagName) el = el[0];
      el.setAttribute('aria-invalid', 'true'); var m = document.createElement('p'); m.className = 'ferr'; m.textContent = j.fields[k];
      var host = el.closest('.fs-field') || el.parentNode; host.appendChild(m); if (!first) first = el;
    });
    var box = document.createElement('div'); box.className = 'fs-errbox'; box.setAttribute('role', 'alert'); box.textContent = (j && j.error) || DOWN;
    var btn = $('button[type=submit]', form); btn.parentNode.insertBefore(box, btn);
    if (first) first.focus();
  }
  function busy(form, on, label) { var b = $('button[type=submit]', form); if (!b) return; if (on) { b.dataset.t = b.textContent; b.textContent = label || 'در حال ارسال…'; b.disabled = true; } else { b.textContent = b.dataset.t || b.textContent; b.disabled = false; } }

  /* ---------- خرید ---------- */
  function shop() {
    var form = $('#fs-shop-form'); if (!form) return;
    var q = new URLSearchParams(location.search).get('p');
    if (q && PKG[q]) { var r = form.querySelector('input[name=package][value=' + q + ']'); if (r) r.checked = true; }
    function draw() {
      var c = form.querySelector('input[name=package]:checked'), i = c && inv(c.value), t = $('#fs-inv');
      if (!t) return;
      if (!i) { t.innerHTML = '<p class="muted">یک بسته انتخاب کنید تا پیش‌فاکتور ساخته شود.</p>'; return; }
      t.innerHTML = '<table class="fs-inv"><tbody>' + SELLER +
        '<tr><th scope="row">شرح</th><td>' + esc(i.title) + ' (هر سؤال پاسخ‌داده‌شده = ۱ پر)</td></tr>' +
        '<tr><th scope="row">تعداد</th><td class="n">۱</td></tr>' +
        '<tr><th scope="row">مبلغ بسته (بدون مالیات)</th><td class="n">' + fa(i.price) + ' تومان</td></tr>' +
        '<tr><th scope="row">مالیات بر ارزش افزوده (' + fa(VAT) + '٪)</th><td class="n">' + fa(i.vat) + ' تومان</td></tr>' +
        '<tr class="tot"><th scope="row">مبلغ قابل پرداخت</th><td class="n">' + fa(i.total) + ' تومان</td></tr>' +
        '</tbody></table><p class="muted">قیمت هر پر در این بسته: ' + fa(i.price / i.f) + ' تومان (بدون مالیات). پرها تاریخ انقضا ندارند.</p>';
    }
    $$('input[name=package]', form).forEach(function (x) { x.addEventListener('change', draw); }); draw();
    // member: order goes to the account (feathers, pre-invoice in «حساب من»); e-mail becomes optional
    var MEM = null, bar = document.createElement('div'); bar.className = 'fs-note'; bar.id = 'fs-shop-member';
    bar.innerHTML = '<p style="margin:0">برای اینکه پرها مستقیم به <strong>حساب کاربری</strong> شما اضافه شود و سفارش‌ها را در «حساب من» ببینید، <a href="/login/?next=/shop/">وارد شوید یا ثبت‌نام کنید</a> (عضو تازه ۳ پر هدیه می‌گیرد). بدون ورود هم می‌توانید با ایمیل سفارش بدهید.</p>';
    form.parentNode.insertBefore(bar, form);
    var mflag = false; try { mflag = localStorage.getItem('fs-member') === '1'; } catch (e) {}
    if (mflag && window.fetch) fetch(API + 'account.php', { credentials: 'include' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) return;
      if (!j.logged_in) { try { localStorage.removeItem('fs-member'); } catch (e) {} return; }
      MEM = j.member;
      bar.innerHTML = '<p style="margin:0">با حساب <strong>' + esc((MEM.first_name + ' ' + MEM.last_name).trim()) + '</strong> وارد شده‌اید؛ پرهای این خرید به حساب شما اضافه می‌شود. موجودی فعلی: <strong>' + fa(MEM.feathers) + ' پر</strong> · <a href="/account/">حساب من</a></p>';
      if (!form.full_name.value) form.full_name.value = (MEM.first_name + ' ' + MEM.last_name).trim();
      if (!form.email.value && MEM.email) form.email.value = MEM.email;
      var h = $('#s-mail-h'); if (h) h.textContent = 'اختیاری برای اعضا: اگر بنویسید، پیش‌فاکتور به آن فرستاده می‌شود. پیش‌فاکتور در «حساب من» هم هست.';
    }).catch(function () {});
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var c = form.querySelector('input[name=package]:checked');
      var d = { package: c ? c.value : '', full_name: form.full_name.value.trim(), email: form.email.value.trim(),
        consent_terms: form.consent_terms.checked, consent_start: form.consent_start.checked, website: form.website.value };
      var fe = {};
      if (!d.package) fe.package = 'لطفاً یکی از بسته‌ها را انتخاب کنید.';
      if (d.full_name.length < 3) fe.full_name = 'نام و نام خانوادگی را بنویسید.';
      if ((!MEM || d.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) fe.email = 'ایمیل درست به نظر نمی‌رسد. نمونه‌ی درست: name@gmail.com';
      if (!d.consent_terms) fe.consent_terms = 'برای ثبت سفارش، قوانین خرید و بازگشت وجه را بپذیرید.';
      if (!d.consent_start) fe.consent_start = 'لطفاً این بند را هم تأیید کنید.';
      if (Object.keys(fe).length) return showErr(form, { error: 'چند مورد نیاز به اصلاح دارد.', fields: fe });
      busy(form, true, 'در حال ثبت سفارش…');
      post('shop-order.php', d, !!MEM).then(function (j) {
        busy(form, false);
        if (!j.ok) return showErr(form, j);
        var i = j.invoice || {}, out = $('#fs-shop-done');
        out.innerHTML = '<div class="fs-ok" role="status" tabindex="-1"><h2 style="margin-top:0">سفارش شما ثبت شد</h2>' +
          '<p>شماره پیگیری: <span class="fs-trk">' + esc(j.tracking) + '</span></p>' +
          '<p>وضعیت: <strong>' + esc(j.status_fa || 'در انتظار درگاه پرداخت') + '</strong></p>' +
          '<table class="fs-inv"><tbody>' + SELLER + '<tr><th scope="row">شرح</th><td>' + esc(i.title) + '</td></tr>' +
          '<tr><th scope="row">مبلغ بسته</th><td class="n">' + fa(i.price) + ' تومان</td></tr>' +
          '<tr><th scope="row">مالیات بر ارزش افزوده</th><td class="n">' + fa(i.vat) + ' تومان</td></tr>' +
          '<tr class="tot"><th scope="row">مبلغ قابل پرداخت</th><td class="n">' + fa(i.total) + ' تومان</td></tr></tbody></table>' +
          '<p><strong>پرداخت آنلاین به‌زودی فعال می‌شود.</strong> تا آن زمان هیچ مبلغی از شما گرفته نمی‌شود. وقتی درگاه پرداخت آماده شد، با همین شماره پیگیری و ایمیل می‌توانید سفارش را پرداخت کنید. اگر ایمیل ما تنظیم شده باشد، پیش‌فاکتور به ایمیل شما هم فرستاده می‌شود.</p>' +
          (j.member ? '<p>این سفارش و پیش‌فاکتورش در <a href="/account/">حساب من</a> هم دیده می‌شود و بعد از پرداخت، پرها به حساب شما اضافه می‌شود.</p></div>'
            : '<p class="muted">این شماره را یادداشت کنید. برای پیگیری، پایین همین صفحه شماره و ایمیل را وارد کنید.</p></div>');
        form.hidden = true; var ok = $('.fs-ok', out); ok.focus(); ok.scrollIntoView({ block: 'start', behavior: 'smooth' });
        var tf = $('#fs-track-form'); if (tf) { tf.tracking.value = j.tracking; tf.email.value = d.email; }
      }).catch(function () { busy(form, false); showErr(form, { error: DOWN }); });
    });
  }

  /* ---------- شکایت ---------- */
  function complaint() {
    var form = $('#fs-complaint-form'); if (!form) return;
    var q = new URLSearchParams(location.search).get('order'); if (q && /^[Pp]\d{8}$/.test(q)) form.order_tracking.value = q.toUpperCase();
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = { full_name: form.full_name.value.trim(), email: form.email.value.trim(), topic: form.topic.value,
        order_tracking: form.order_tracking.value.trim(), message: form.message.value.trim(), website: form.website.value };
      var fe = {};
      if (d.full_name.length < 3) fe.full_name = 'نام و نام خانوادگی را بنویسید.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) fe.email = 'ایمیل درست به نظر نمی‌رسد. نمونه‌ی درست: name@gmail.com';
      if (!d.topic) fe.topic = 'موضوع را انتخاب کنید.';
      if (d.message.length < 10) fe.message = 'لطفاً شرح شکایت را کمی کامل‌تر بنویسید (حداقل ۱۰ نویسه).';
      if (Object.keys(fe).length) return showErr(form, { error: 'چند مورد نیاز به اصلاح دارد.', fields: fe });
      busy(form, true);
      post('complaint.php', d).then(function (j) {
        busy(form, false);
        if (!j.ok) return showErr(form, j);
        var out = $('#fs-complaint-done');
        out.innerHTML = '<div class="fs-ok" role="status" tabindex="-1"><h2 style="margin-top:0">درخواست شما ثبت شد</h2>' +
          '<p>شماره پیگیری: <span class="fs-trk">' + esc(j.tracking) + '</span></p><p>وضعیت: <strong>' + esc(j.status_fa) + '</strong></p>' +
          '<p>حداکثر تا ۴۸ ساعت پاسخ می‌دهیم. پاسخ را با همین شماره و ایمیل، پایین همین صفحه ببینید؛ اگر ایمیل ما تنظیم شده باشد، به ایمیل شما هم فرستاده می‌شود.</p></div>';
        form.hidden = true; var ok = $('.fs-ok', out); ok.focus(); ok.scrollIntoView({ block: 'start', behavior: 'smooth' });
        var tf = $('#fs-track-form'); if (tf) { tf.tracking.value = j.tracking; tf.email.value = d.email; }
      }).catch(function () { busy(form, false); showErr(form, { error: DOWN }); });
    });
  }

  /* ---------- پیگیری ---------- */
  function track() {
    var form = $('#fs-track-form'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = { tracking: form.tracking.value.trim(), email: form.email.value.trim() }, fe = {};
      if (d.tracking.length < 9) fe.tracking = 'شماره پیگیری را کامل بنویسید؛ مثل P12345678 یا S12345678.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) fe.email = 'همان ایمیلی را بنویسید که هنگام ثبت وارد کردید.';
      if (Object.keys(fe).length) return showErr(form, { error: 'چند مورد نیاز به اصلاح دارد.', fields: fe });
      busy(form, true, 'در حال جست‌وجو…');
      post('track.php', d).then(function (j) {
        busy(form, false); var out = $('#fs-track-out');
        if (!j.ok) { out.innerHTML = ''; return showErr(form, j); }
        var h = '<div class="fs-card" role="status"><p>شماره پیگیری: <span class="fs-trk">' + esc(j.tracking) + '</span></p>';
        if (j.type === 'order') {
          h += '<p>' + esc(j.title) + ' — ثبت: ' + esc(j.created) + '</p><p>وضعیت: <strong>' + esc(j.status_fa) + '</strong></p>' +
            '<p>مبلغ قابل پرداخت: ' + fa(j.total) + ' تومان (شامل ' + fa(j.vat) + ' تومان مالیات بر ارزش افزوده)</p>';
          if (j.status === 'awaiting_gateway') h += '<p class="muted">پرداخت آنلاین به‌زودی فعال می‌شود؛ تا آن زمان مبلغی گرفته نمی‌شود.</p>';
        } else {
          h += '<p>موضوع: ' + esc(j.topic) + ' — ثبت: ' + esc(j.created) + '</p><p>وضعیت: <strong>' + esc(j.status_fa) + '</strong></p>';
          h += j.reply ? '<h3>پاسخ ما</h3><p style="white-space:pre-line">' + esc(j.reply) + '</p>' : '<p class="muted">هنوز پاسخی ثبت نشده است. حداکثر تا ۴۸ ساعت پاسخ می‌دهیم.</p>';
        }
        h += '<p>موجودی پر سیمرغ این ایمیل: <strong>' + fa(j.balance || 0) + ' پر</strong></p></div>';
        out.innerHTML = h;
      }).catch(function () { busy(form, false); showErr(form, { error: DOWN }); });
    });
  }
  function init() { shop(); complaint(); track(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
