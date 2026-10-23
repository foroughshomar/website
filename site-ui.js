/* Theme switch + language selector + client-side translation (fa default; en, ar, elv). */
(function () {
  var d = document.documentElement, lang = d.getAttribute('data-lang') || 'fa', D = window.__I18N || {};
  var pageLang = d.getAttribute('data-page-lang');
  var LTR = lang === 'en' || lang === 'elv', ELV = lang === 'elv';
  var FA = /[\u0600-\u06FF]/, PFA = /[آ-یپچژگکی]/, IDIG = /[۰-۹٠-٩]/;
  var MON = { en: ['Farvardin','Ordibehesht','Khordad','Tir','Mordad','Shahrivar','Mehr','Aban','Azar','Dey','Bahman','Esfand'],
              ar: ['فروردين','أرديبهشت','خرداد','تير','مرداد','شهريور','مهر','آبان','آذر','دي','بهمن','إسفند'] };
  var FAM = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  var UI = { fa: { theme: 'تم روشن / تاریک', lang: 'زبان' },
    en: { theme: 'Light / dark theme', lang: 'Language', note: 'This article is currently available in Persian only.' },
    ar: { theme: 'الوضع الفاتح / الداكن', lang: 'اللغة', note: 'هذا المقال متوفر حالياً باللغة الفارسية فقط.' },
    elv: { theme: 'Light / dark theme', lang: 'Language', note: '✦ The Elvish scribes are still copying this scroll — here it is in the tongue of Men (English).' } };
  // Sindarin-flavoured words (for fun); everything else stays English, written in Tengwar
  var SJN = { 'home': 'bar', 'contact': 'pedo', 'services': 'tegil', 'articles': 'teithant', 'about us': 'ammen', 'why us': 'manen ammen',
    'faq': 'maeth', 'welcome': 'mae govannen', 'thank you': 'hannon le', 'light': 'galad', 'friend': 'mellon', 'send request': 'anno',
    'book a consultation': 'tolo a pedo', 'email': 'tîw', 'phone number': 'nûr', 'full name': 'eneth', 'city': 'ost', 'online': 'mi gwilith',
    'back': 'dan', 'read more': 'gweno', 'coming soon': 'ae sí', 'tax calendar': 'genediad', 'office': 'barad' };
  function latin(s) { return s.replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); }).replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }); }
  function digits(s) { return LTR ? latin(s) : s.replace(/[۰-۹]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(c)]; }); }
  function elvify(s) { var k = s.toLowerCase().trim(); return SJN[k] ? SJN[k] : s.toLowerCase(); }
  function tr0(s) {
    var k = s.replace(/\s+/g, ' ').trim();
    if (!k || !FA.test(k)) return null;
    if (D[k]) return D[k];
    var m = k.match(/^([۰-۹]+) (\S+) ([۰-۹]+)$/), i;
    if (m && (i = FAM.indexOf(m[2])) > -1) return digits(m[1]) + ' ' + MON[lang === 'ar' ? 'ar' : 'en'][i] + ' ' + digits(m[3]);
    if (k.indexOf(' | ') > 0) { var p0 = k.split(' | '), p = p0.map(function (x) { return D[x] || x; }); if (p.some(function (x, j) { return x !== p0[j]; })) return p.join(' | '); }
    m = k.match(/^ممنون که به ما اعتماد کردید\. نوبت شما برای (.+)، ساعت (\S+) ثبت شد/);
    if (m) { var dt = tr0(m[1]) || m[1];
      return lang !== 'ar' ? 'Thank you for trusting us. Your appointment on ' + dt + ' at ' + m[2] + ' has been received and is awaiting confirmation. Our team will be in touch shortly, and once it is confirmed we will send you a text message.'
        : 'شكراً لثقتك بنا. سُجّل موعدك يوم ' + dt + ' الساعة ' + m[2] + ' وهو بانتظار التأكيد. سيتواصل معك فريقنا قريباً، وسنرسل لك رسالة نصية عند تأكيد الموعد.'; }
    return null;
  }
  function tr(s) { var t = tr0(s); return t && LTR ? latin(t) : t; }
  var last = new WeakMap(), ATTR = ['placeholder', 'alt', 'title', 'aria-label'];
  function doText(n) {
    var v = n.nodeValue; if (last.get(n) === v) return;
    var t = tr(v), p = n.parentElement, out = null;
    if (t) {
      if (ELV && p && !p.closest('[data-no-i18n]')) { if (p.closest('form') && !p.hasAttribute('data-en') && t.length < 40) p.setAttribute('data-en', t); p.classList.add('fs-elv'); t = elvify(t); }
      out = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0];
    } else if (LTR && IDIG.test(v)) out = latin(v);
    if (out !== null) { last.set(n, out); n.nodeValue = out; }
    else if (PFA.test(v) && v.trim().length > 2 && p && p !== document.body && !p.hasAttribute('lang') && !p.closest('[data-no-i18n]')) { p.setAttribute('lang', 'fa'); if (LTR) p.setAttribute('dir', 'rtl'); }
  }
  function doEl(el) {
    if (el.tagName === 'OPTION' && !el.hasAttribute('value')) el.setAttribute('value', el.textContent);
    for (var i = 0; i < ATTR.length; i++) { var a = el.getAttribute(ATTR[i]); if (a) { var t = tr(a) || (LTR && IDIG.test(a) ? latin(a) : null); if (t) el.setAttribute(ATTR[i], t); } }
  }
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  function walk(root) {
    if (root.nodeType === 3) { if (root.parentElement && !SKIP[root.parentElement.tagName]) doText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.tagName] || root.closest && root.closest('[data-no-i18n]')) return;
    doEl(root); root.querySelectorAll('option:not([value]),[placeholder],[alt],[title],[aria-label]').forEach(doEl);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentElement; return p && !SKIP[p.tagName] && !p.closest('[data-no-i18n]') ? 1 : 2; } }), n, list = [];
    while ((n = w.nextNode())) list.push(n); list.forEach(doText);
  }
  function meta() {
    var t = tr(document.title); if (t) document.title = t;
    document.querySelectorAll('meta[name=description],meta[property="og:title"],meta[property="og:description"]').forEach(function (m) { var x = tr(m.content || ''); if (x) m.content = x; });
  }
  function alt(l) { var a = document.querySelector('link[rel=alternate][hreflang="' + l + '"]'); if (!a) return null; try { var u = new URL(a.href, location.href); return u.pathname !== location.pathname ? u.pathname + u.hash : null; } catch (e) { return null; } }
  var contentLang = lang === 'elv' ? 'en' : lang;
  function note() {
    if (!/^\/articles\/[a-z0-9-]+/.test(location.pathname) || document.querySelector('.fs-note')) return;
    if (pageLang && !ELV) return;
    var main = document.querySelector('main'); if (!main) return;
    var el = document.createElement('p'); el.className = 'fs-note'; el.setAttribute('data-no-i18n', ''); el.textContent = UI[lang].note; main.insertBefore(el, main.firstChild);
  }
  // Article cards on lists: show the translated title/excerpt and link to that language's page
  var IDX = null;
  function cards() {
    if (lang === 'fa') return;
    var as = document.querySelectorAll('a[href^="/articles/"]:not([data-fs-card])'); if (!as.length) return;
    var go = function () {
      as.forEach(function (a) {
        var slug = (a.getAttribute('href').match(/^\/articles\/([a-z0-9-]+)\/?$/) || [])[1]; if (!slug) return;
        var e = IDX[slug]; a.setAttribute('data-fs-card', '1'); if (!e) return;
        var t = e.translations && e.translations[contentLang]; if (!t) return;
        a.setAttribute('href', t.path);
        var h = a.querySelector('h2,h3'), p = a.querySelector('p.mt-4'), m = a.querySelector('p.text-xs'), im = a.querySelector('img');
        [h, p, m].forEach(function (x) { if (x) { x.removeAttribute('lang'); x.removeAttribute('dir'); x.setAttribute('data-no-i18n', ''); } });
        if (h) h.textContent = t.title; if (p) p.textContent = t.excerpt || ''; if (m) m.textContent = (t.category ? t.category + ' · ' : '') + (t.date || '');
        if (im) im.alt = t.title;
      });
    };
    if (IDX) return go();
    fetch('/articles/index.json').then(function (r) { return r.json(); }).then(function (j) { IDX = {}; (j.articles || []).forEach(function (x) { IDX[x.slug] = x; }); go(); }).catch(function () {});
  }
  function attrs() { var L = ELV ? 'sjn' : lang; if (d.lang !== L) d.lang = L; var R = lang === 'ar' ? 'rtl' : 'ltr'; if (d.dir !== R) d.dir = R; }
  // Collapse the desktop nav into the menu button when the header would overflow
  function fit() {
    var h = document.querySelector('header > div'); if (!h) return;
    d.classList.remove('fs-compact');
    if (window.innerWidth >= 1024 && h.scrollWidth > h.clientWidth + 1) d.classList.add('fs-compact');
  }
  function controls() {
    var h = document.querySelector('header > div'); if (!h || h.querySelector('.fs-ctrl')) return;
    var c = document.createElement('div'); c.className = 'fs-ctrl'; c.setAttribute('data-no-i18n', '');
    var sw = document.createElement('button'); sw.type = 'button'; sw.className = 'fs-sw'; sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-label', UI[lang].theme); sw.title = UI[lang].theme;
    var setA = function () { sw.setAttribute('aria-checked', d.getAttribute('data-theme') === 'light' ? 'true' : 'false'); }; setA();
    sw.onclick = function () { var t = d.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; d.setAttribute('data-theme', t); try { localStorage.setItem('fs-theme', t); } catch (e) {} setA(); };
    var s = document.createElement('select'); s.className = 'fs-lang'; s.setAttribute('aria-label', UI[lang].lang);
    [['fa', 'فارسی'], ['en', 'English'], ['ar', 'العربية'], ['elv', 'Elvish ✦']].forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; if (o[0] === lang) op.selected = true; s.appendChild(op); });
    s.onchange = function () {
      var v = s.value; try { localStorage.setItem('fs-lang', v); } catch (e) {}
      var target = alt(v === 'elv' ? 'en' : v);
      if (pageLang && !target) target = alt('fa');
      if (target) { location.href = target; return; }
      var u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString();
    };
    c.appendChild(sw); c.appendChild(s); h.insertBefore(c, h.firstChild);
    fit();
  }
  // On a Persian article page with another language chosen, open that language's version
  if (!pageLang && lang !== 'fa') { var t0a = alt(contentLang); if (t0a) { location.replace(t0a); return; } }
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var started = false;
    function start() {
      if (started) return; started = true;
      controls();
      window.addEventListener('resize', fit);
      new MutationObserver(function () { controls(); }).observe(document.body, { childList: true, subtree: true });
      if (lang === 'fa') return;
      attrs(); meta(); walk(document.body); note(); cards(); fit();
      d.classList.remove('i18n-pending');
      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          if (m.type === 'characterData') doText(m.target);
          else if (m.type === 'attributes') { if (m.target === d) attrs(); else doEl(m.target); }
          else m.addedNodes.forEach(walk);
        });
        note(); cards();
      }).observe(d, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['lang', 'dir', 'placeholder', 'alt', 'title', 'aria-label'] });
      new MutationObserver(meta).observe(document.querySelector('title') || document.head, { childList: true, characterData: true, subtree: true });
    }
    if (!document.querySelector('script[type=module]')) return start();
    var t0 = Date.now();
    (function wait() {
      var f = document.querySelector('footer') || document.querySelector('main');
      var hyd = f && Object.keys(f).some(function (k) { return k.indexOf('__reactFiber') === 0; });
      if (hyd) setTimeout(start, 60); else if (Date.now() - t0 > 3000) start(); else setTimeout(wait, 30);
    })();
  });
})();
