/* فروغ‌شمار — پنجره‌ی خوش‌آمد جشن افتتاحیه. یک بار برای هر بازدیدکننده (هش IP در سرور + localStorage)، فقط تا پایان جشن (زمان پایان از سرور). */
(function () {
  'use strict';
  var API = 'https://panel.foroughshomar.ir/api/';
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && (/[?&]acctapi=local/.test(location.search) || sessionStorage.getItem('fs-acctapi'))) { sessionStorage.setItem('fs-acctapi', '1'); API = location.origin + '/api/'; } } catch (e) {}
  var KEY = 'fs-promo-seen-v1';
  try { if (localStorage.getItem(KEY) || localStorage.getItem('fs-member') === '1') return; } catch (e) { return; }
  if (/^\/(login|account|admin)\//.test(location.pathname) || !window.fetch) return;
  function fa(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
  var CSS = '.fsp-back{position:fixed;inset:0;z-index:9998;background:rgba(4,12,24,.6);display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(2px)}'
    + '.fsp{position:relative;width:100%;max-width:430px;max-height:calc(100vh - 2rem);overflow:auto;background:var(--color-navy-soft,#132845);color:var(--color-cream,#f3ead8);border:1px solid rgba(212,175,55,.55);border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.45);padding:1.6rem 1.3rem 1.3rem;font-family:inherit;line-height:1.9;direction:rtl;text-align:center}'
    + '.fsp-x{position:absolute;top:.5rem;left:.5rem;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:1.6rem;cursor:pointer;line-height:1}.fsp-x:hover,.fsp-x:focus-visible{background:rgba(212,175,55,.15)}'
    + '.fsp .ic{font-size:2.4rem;line-height:1}.fsp h2{margin:.3rem 0 .3rem;font-size:1.25rem;color:#d4af37;font-weight:700}.fsp p{margin:.35rem 0}.fsp .big{font-size:1.05rem}.fsp .mut{color:var(--color-muted,#c4b89a);font-size:.86rem}'
    + '.fsp .cd{display:flex;justify-content:center;gap:.5rem;margin:.9rem 0 .4rem;direction:rtl}.fsp .cd div{min-width:4.2rem;padding:.45rem .3rem;border-radius:12px;border:1px solid rgba(212,175,55,.45);background:var(--color-navy,#0b1f3a)}.fsp .cd b{display:block;font-size:1.5rem;color:#d4af37;line-height:1.3}.fsp .cd span{font-size:.8rem;opacity:.85}'
    + '.fsp-btn{display:block;width:100%;min-height:48px;margin-top:1rem;border:0;border-radius:10px;background:#d4af37;color:#0b1f3a;font:inherit;font-weight:700;cursor:pointer}.fsp-later{margin-top:.5rem;border:0;background:none;color:inherit;opacity:.8;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:4px;min-height:40px}'
    + '@media (max-width:600px){.fsp-back{padding:0}.fsp{max-width:none;width:100%;height:100%;max-height:none;border-radius:0;border:0;display:flex;flex-direction:column;justify-content:center}}';
  var back, box, last, timer, endTs = 0, skew = 0;
  function nowS() { return Math.floor(Date.now() / 1000) + skew; }
  function tick() {
    var left = endTs - nowS();
    if (left <= 0) { close(); return; }
    var d = Math.floor(left / 86400), h = Math.floor(left % 86400 / 3600), m = Math.floor(left % 3600 / 60);
    box.querySelector('.cd-d').textContent = fa(d); box.querySelector('.cd-h').textContent = fa(h); box.querySelector('.cd-m').textContent = fa(m);
    box.querySelector('.cd').setAttribute('aria-label', 'زمان باقی‌مانده: ' + fa(d) + ' روز، ' + fa(h) + ' ساعت و ' + fa(m) + ' دقیقه');
  }
  function seen() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    try { fetch(API + 'promo.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"action":"seen"}', keepalive: true }); } catch (e) {}
  }
  function close(openSignup) {
    if (!back) return; clearInterval(timer); back.remove(); back = null; document.documentElement.style.overflow = '';
    if (openSignup) {
      var go = function () { window.FSLogin.open('signup'); };
      if (window.FSLogin) go(); else { var sc = document.createElement('script'); sc.src = '/login-modal.js'; sc.onload = go; sc.onerror = function () { location.href = '/login/?tab=signup'; }; document.head.appendChild(sc); }
    } else if (last && last.focus) last.focus();
  }
  function show(j) {
    if (document.querySelector('.fsm-back:not([hidden])')) return;   // never on top of the sign-in window
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    last = document.activeElement;
    back = document.createElement('div'); back.className = 'fsp-back';
    back.innerHTML = '<div class="fsp" role="dialog" aria-modal="true" aria-labelledby="fsp-h" aria-describedby="fsp-d" lang="fa" dir="rtl">'
      + '<button type="button" class="fsp-x" aria-label="بستن">×</button>'
      + '<div class="ic" aria-hidden="true">🪶</div>'
      + '<h2 id="fsp-h">جشن افتتاحیه‌ی فروغ‌شمار سیمرغ</h2>'
      + '<p class="big" id="fsp-d">خوشحالیم که اینجایید! به مناسبت افتتاحیه، با ثبت‌نام <strong>' + fa(j.bonus) + ' پر سیمرغ</strong> هدیه بگیرید و پرسش‌های مالیاتی، بیمه‌ای و حسابداری‌تان را با خیال راحت از سیمرغ بپرسید.</p>'
      + '<div class="cd" role="timer" aria-live="off"><div><b class="cd-d">۰</b><span>روز</span></div><div><b class="cd-h">۰</b><span>ساعت</span></div><div><b class="cd-m">۰</b><span>دقیقه</span></div></div>'
      + '<p class="mut">تا پایان جشن' + (j.end_label ? ' (' + j.end_label + ')' : '') + '؛ برای هر ایمیل یک بار.</p>'
      + '<button type="button" class="fsp-btn">ثبت‌نام و دریافت هدیه</button>'
      + '<button type="button" class="fsp-later">بعداً، فعلاً سری به سایت می‌زنم</button></div>';
    document.body.appendChild(back); box = back.firstChild; document.documentElement.style.overflow = 'hidden';
    box.querySelector('.fsp-x').addEventListener('click', function () { close(); });
    box.querySelector('.fsp-later').addEventListener('click', function () { close(); });
    box.querySelector('.fsp-btn').addEventListener('click', function () { close(true); });
    back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });
    back.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { var f = [].slice.call(box.querySelectorAll('button')), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    tick(); timer = setInterval(tick, 1000);
    box.querySelector('.fsp-btn').focus();
    seen();
  }
  function start() {
    fetch(API + 'promo.php', { credentials: 'omit' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok || !j.active || j.seen || !j.end_ts) { if (j && j.ok && j.active && j.seen) { try { localStorage.setItem(KEY, 'ip'); } catch (e) {} } return; }
      skew = (j.now_ts || 0) - Math.floor(Date.now() / 1000); endTs = j.end_ts;
      if (endTs - nowS() <= 0) return;
      setTimeout(function () { if (!document.querySelector('.fsm-back:not([hidden])')) show(j); }, 1200);
    }).catch(function () {});
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
