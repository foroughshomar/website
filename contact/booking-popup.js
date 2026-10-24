// Shows the booking success message (rendered by the contact bundle) in a modal instead of the page body.
(function () {
  var d = document.documentElement, lang = d.getAttribute('data-lang') || 'fa', rtl = lang === 'fa' || lang === 'ar';
  var OK = { fa: 'باشه', ar: 'حسناً', en: 'OK', elv: 'OK' }[lang] || 'OK', X = { fa: 'بستن', ar: 'إغلاق' }[lang] || 'Close';
  var css = '#fs-book-pop{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;padding:16px;background:rgba(5,14,28,.45);opacity:0;transition:opacity .25s}' +
    '#fs-book-pop.on{opacity:1}#fs-book-pop .bx{position:relative;width:100%;max-width:480px;max-height:88vh;overflow:auto;border-radius:18px;padding:26px 22px 20px;background:#0f2747;color:#f4ead5;border:1px solid rgba(212,175,55,.55);box-shadow:0 18px 50px rgba(0,0,0,.35);transform:translateY(18px);transition:transform .25s}' +
    '#fs-book-pop.on .bx{transform:none}[data-theme=light] #fs-book-pop .bx{background:#fffdf8;color:#0b1f3a;border-color:#d4af37}' +
    '#fs-book-pop h3{margin:0 0 6px;font-size:1.2rem;color:#d4af37;line-height:1.9}#fs-book-pop p{opacity:.92}[data-theme=light] #fs-book-pop p{color:#1c2a3f}' +
    '#fs-book-pop .x{position:absolute;top:10px;' + (rtl ? 'left' : 'right') + ':12px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:22px;cursor:pointer;opacity:.7}' +
    '#fs-book-pop .okb{display:block;width:100%;margin-top:18px;padding:12px;border:0;border-radius:10px;background:#d4af37;color:#0b1f3a;font:inherit;font-weight:600;cursor:pointer}' +
    '@media(min-width:768px){#fs-book-pop{align-items:center}}';
  function isSuccess(el) { return el.nodeType === 1 && /border-gold\/30/.test(el.className || '') && /bg-navy/.test(el.className || '') && el.querySelector('h3.text-gold') && !el.closest('form') && !el.querySelector('form'); }
  function show(box) {
    if (box.dataset.fsPopped) return; box.dataset.fsPopped = '1';
    setTimeout(function () { // let site-ui.js translate first
      var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
      var w = document.createElement('div'); w.id = 'fs-book-pop'; w.dir = rtl ? 'rtl' : 'ltr';
      w.innerHTML = '<div class="bx" role="dialog" aria-modal="true"><button type="button" class="x" aria-label="' + X + '">×</button><div class="ct"></div><button type="button" class="okb">' + OK + '</button></div>';
      var ct = w.querySelector('.ct'); [].forEach.call(box.childNodes, function (n) { ct.appendChild(n.cloneNode(true)); });
      var h = ct.querySelector('h3'); if (h) h.id = 'fs-book-t', w.firstChild.setAttribute('aria-labelledby', 'fs-book-t');
      document.body.appendChild(w); box.style.display = 'none';
      requestAnimationFrame(function () { w.classList.add('on'); });
      function close() { w.classList.remove('on'); document.removeEventListener('keydown', esc); setTimeout(function () { w.remove(); }, 250); }
      function esc(e) { if (e.key === 'Escape') close(); }
      document.addEventListener('keydown', esc); w.querySelector('.x').onclick = close; w.querySelector('.okb').onclick = close;
      w.onclick = function (e) { if (e.target === w) close(); };
      setTimeout(function () { w.querySelector('.okb').focus({ preventScroll: true }); }, 300);
    }, 450);
  }
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) {
    if (n.nodeType !== 1) return; if (isSuccess(n)) show(n); else if (n.querySelectorAll) [].forEach.call(n.querySelectorAll('div.rounded-xl'), function (x) { if (isSuccess(x)) show(x); });
  }); }); }).observe(document.body || d, { childList: true, subtree: true });
})();
