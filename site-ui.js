/* Theme switch + language selector + client-side translation (fa default). */
(function () {
  var d = document.documentElement, lang = d.getAttribute('data-lang') || 'fa', D = window.__I18N || {};
  var FA = /[\u0600-\u06FF]/, PFA = /[آ-یپچژگکی]/;
  var MON = { en: ['Farvardin','Ordibehesht','Khordad','Tir','Mordad','Shahrivar','Mehr','Aban','Azar','Dey','Bahman','Esfand'],
              ar: ['فروردين','أرديبهشت','خرداد','تير','مرداد','شهريور','مهر','آبان','آذر','دي','بهمن','إسفند'] };
  var FAM = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  var UI = { fa: { theme: 'تم روشن / تاریک', lang: 'زبان' }, en: { theme: 'Light / dark theme', lang: 'Language',
      note: 'Our articles are currently published in Persian only.' },
    ar: { theme: 'الوضع الفاتح / الداكن', lang: 'اللغة', note: 'مقالاتنا متوفرة حالياً باللغة الفارسية فقط.' } };
  function digits(s) { return lang === 'en' ? s.replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); })
      : s.replace(/[۰-۹]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(c)]; }); }
  function tr(s) {
    var k = s.replace(/\s+/g, ' ').trim();
    if (!k || !FA.test(k)) return null;
    if (D[k]) return D[k];
    var m = k.match(/^([۰-۹]+) (\S+) ([۰-۹]+)$/), i;
    if (m && (i = FAM.indexOf(m[2])) > -1) return digits(m[1]) + ' ' + MON[lang][i] + ' ' + digits(m[3]);
    if (k.indexOf(' | ') > 0) { var p = k.split(' | ').map(function (x) { return D[x] || x; }); if (p.some(function (x, j) { return x !== k.split(' | ')[j]; })) return p.join(' | '); }
    m = k.match(/^ممنون که به ما اعتماد کردید\. نوبت شما برای (.+)، ساعت (\S+) ثبت شد/);
    if (m) { var dt = tr(m[1]) || m[1];
      return lang === 'en' ? 'Thank you for trusting us. Your appointment on ' + dt + ' at ' + m[2] + ' has been received and is awaiting confirmation. Our team will be in touch shortly, and once it is confirmed we will send you a text message.'
        : 'شكراً لثقتك بنا. سُجّل موعدك يوم ' + dt + ' الساعة ' + m[2] + ' وهو بانتظار التأكيد. سيتواصل معك فريقنا قريباً، وسنرسل لك رسالة نصية عند تأكيد الموعد.'; }
    return null;
  }
  var last = new WeakMap(), ATTR = ['placeholder', 'alt', 'title', 'aria-label'];
  function doText(n) {
    var v = n.nodeValue; if (last.get(n) === v) return;
    var t = tr(v);
    if (t) { var out = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0]; last.set(n, out); n.nodeValue = out; }
    else if (PFA.test(v) && v.trim().length > 2) { var p = n.parentElement; if (p && p !== document.body && !p.hasAttribute('lang')) { p.setAttribute('lang', 'fa'); if (lang === 'en') p.setAttribute('dir', 'rtl'); } }
  }
  function doEl(el) {
    if (el.tagName === 'OPTION' && !el.hasAttribute('value')) el.setAttribute('value', el.textContent);
    for (var i = 0; i < ATTR.length; i++) { var a = el.getAttribute(ATTR[i]); if (a) { var t = tr(a); if (t) el.setAttribute(ATTR[i], t); } }
  }
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  function walk(root) {
    if (root.nodeType === 3) { if (root.parentElement && !SKIP[root.parentElement.tagName]) doText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.tagName] || root.closest && root.closest('[data-no-i18n]')) return;
    if (root.tagName === 'OPTION' || root.querySelectorAll) { doEl(root); root.querySelectorAll('option:not([value]),[placeholder],[alt],[title],[aria-label]').forEach(doEl); }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentElement; return p && !SKIP[p.tagName] ? 1 : 2; } }), n;
    var list = []; while ((n = w.nextNode())) list.push(n); list.forEach(doText);
  }
  function meta() {
    var t = tr(document.title); if (t) document.title = t;
    document.querySelectorAll('meta[name=description],meta[property="og:title"],meta[property="og:description"]').forEach(function (m) { var x = tr(m.content || ''); if (x) m.content = x; });
  }
  function note() {
    var p = location.pathname; if (!/^\/articles(\/|$)/.test(p) || document.querySelector('.fs-note')) return;
    var main = document.querySelector('main'); if (!main) return;
    var el = document.createElement('p'); el.className = 'fs-note'; el.textContent = UI[lang].note; main.insertBefore(el, main.firstChild);
  }
  function attrs() { d.lang = lang; d.dir = lang === 'en' ? 'ltr' : 'rtl'; }
  // ---- controls
  function controls() {
    var h = document.querySelector('header > div'); if (!h || h.querySelector('.fs-ctrl')) return;
    var c = document.createElement('div'); c.className = 'fs-ctrl'; c.setAttribute('data-no-i18n', '');
    var sw = document.createElement('button'); sw.type = 'button'; sw.className = 'fs-sw'; sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-label', UI[lang].theme); sw.title = UI[lang].theme;
    var setA = function () { sw.setAttribute('aria-checked', d.getAttribute('data-theme') === 'light' ? 'true' : 'false'); }; setA();
    sw.onclick = function () { var t = d.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; d.setAttribute('data-theme', t); try { localStorage.setItem('fs-theme', t); } catch (e) {} setA(); };
    var s = document.createElement('select'); s.className = 'fs-lang'; s.setAttribute('aria-label', UI[lang].lang);
    [['fa', 'فارسی'], ['en', 'English'], ['ar', 'العربية']].forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; if (o[0] === lang) op.selected = true; s.appendChild(op); });
    s.onchange = function () { try { localStorage.setItem('fs-lang', s.value); } catch (e) {} var u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString(); };
    c.appendChild(sw); c.appendChild(s); h.insertBefore(c, h.firstChild);
  }
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var started = false;
    function start() {
      if (started) return; started = true;
      controls();
      new MutationObserver(function () { controls(); }).observe(document.body, { childList: true, subtree: true });
      if (lang === 'fa') return;
      attrs(); meta(); walk(document.body); note();
      d.classList.remove('i18n-pending');
      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          if (m.type === 'characterData') doText(m.target);
          else if (m.type === 'attributes') { if (m.target === d) { if (d.lang !== lang) attrs(); } else doEl(m.target); }
          else m.addedNodes.forEach(walk);
        });
        note();
      }).observe(d, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['lang', 'dir', 'placeholder', 'alt', 'title', 'aria-label'] });
      new MutationObserver(meta).observe(document.querySelector('title') || document.head, { childList: true, characterData: true, subtree: true });
    }
    // Wait until React has hydrated (avoid hydration mismatch); static pages start at once.
    if (!document.querySelector('script[type=module]')) return start();
    var t0 = Date.now();
    (function wait() {
      var f = document.querySelector('footer') || document.querySelector('main');
      var hyd = f && Object.keys(f).some(function (k) { return k.indexOf('__reactFiber') === 0; });
      if (hyd) setTimeout(start, 60); else if (Date.now() - t0 > 3000) start(); else setTimeout(wait, 30);
    })();
  });
})();
