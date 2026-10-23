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
  var contentLang = lang === 'fa' ? 'fa' : 'en'; // articles: Persian or English only
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
  // Grouped header nav (desktop dropdowns + grouped mobile menu); replaces React's flat nav visually
  var NAV = [['خانه', '/'], ['خدمات', [['خدمات', '/services'], ['تقویم تکالیف', '/calendar'], ['نرم‌افزار سیمرغ شمار', '/software']]],
    ['درباره ما', [['درباره ما', '/about'], ['چرا ما', '/why-us'], ['پرسش‌ها', '/faq']]], ['مقالات', '/articles'], ['تماس', '/contact']];
  function cur(h) { var p = location.pathname.replace(/\/+$/, '') || '/'; return h === '/' ? p === '/' : (p === h || p.indexOf(h + '/') === 0); }
  function link(t, h, cls) { var a = document.createElement('a'); a.href = h; a.textContent = t; a.className = cls; if (cur(h)) { a.classList.add('is-active'); a.setAttribute('aria-current', 'page'); } return a; }
  function closeAll(except) { document.querySelectorAll('.fs-dd[data-open]').forEach(function (x) { if (x !== except) { x.removeAttribute('data-open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); } }); }
  function fit() {
    var rn = document.querySelector('header nav.lg\\:flex'); if (!rn || rn.parentNode.querySelector('.fs-nav')) return;
    d.classList.add('fs-ddnav');
    var nav = document.createElement('nav'); nav.className = 'fs-nav'; nav.setAttribute('aria-label', 'Main');
    var ul = document.createElement('ul'); ul.className = 'fs-nav-list';
    var mob = document.createElement('div'); mob.className = 'fs-mpanel'; mob.hidden = true; mob.id = 'fs-mpanel';
    NAV.forEach(function (it, i) {
      var li = document.createElement('li');
      if (typeof it[1] === 'string') { li.appendChild(link(it[0], it[1], 'fs-top')); mob.appendChild(link(it[0], it[1], 'fs-mlink')); }
      else {
        li.className = 'fs-dd'; var b = document.createElement('button'); b.type = 'button'; b.className = 'fs-top';
        b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'fs-dd' + i); b.appendChild(document.createTextNode(it[0]));
        var car = document.createElement('span'); car.className = 'fs-car'; car.setAttribute('aria-hidden', 'true'); b.appendChild(car);
        var m = document.createElement('ul'); m.className = 'fs-menu'; m.id = 'fs-dd' + i;
        var sec = document.createElement('div'); sec.className = 'fs-msec'; var st = document.createElement('p'); st.className = 'fs-mhead'; st.textContent = it[0]; sec.appendChild(st);
        it[1].forEach(function (s) { var l2 = document.createElement('li'); l2.appendChild(link(s[0], s[1], 'fs-item')); m.appendChild(l2); sec.appendChild(link(s[0], s[1], 'fs-mlink')); if (cur(s[1])) b.classList.add('is-active'); });
        var open = function (v) { closeAll(li); if (v) li.setAttribute('data-open', ''); else li.removeAttribute('data-open'); b.setAttribute('aria-expanded', v ? 'true' : 'false'); };
        var ht = 0; b.onclick = function () { if (Date.now() - ht < 500) return open(true); open(!li.hasAttribute('data-open')); };
        b.onkeydown = function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); open(true); m.querySelector('a').focus(); } };
        li.onmouseenter = function () { if (matchMedia('(hover:hover)').matches && !li.hasAttribute('data-open')) { ht = Date.now(); open(true); } };
        li.onmouseleave = function () { if (matchMedia('(hover:hover)').matches) open(false); };
        li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) open(false); });
        m.onkeydown = function (e) { var as = [].slice.call(m.querySelectorAll('a')), k = as.indexOf(document.activeElement);
          if (e.key === 'ArrowDown') { e.preventDefault(); as[(k + 1) % as.length].focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); as[(k - 1 + as.length) % as.length].focus(); } };
        li.appendChild(b); li.appendChild(m); mob.appendChild(sec);
      }
      ul.appendChild(li);
    });
    var rp = document.querySelector('header div.lg\\:hidden nav'); if (rp) { var ex = document.createElement('div'); ex.className = 'fs-mextra';
      [].slice.call(rp.children).filter(function (x) { return !(x.tagName === 'A' && !x.querySelector('button')); }).forEach(function (x) { ex.appendChild(x.cloneNode(true)); }); mob.appendChild(ex); }
    var mb = document.createElement('button'); mb.type = 'button'; mb.className = 'fs-mbtn'; mb.setAttribute('aria-expanded', 'false'); mb.setAttribute('aria-controls', 'fs-mpanel');
    mb.setAttribute('aria-label', 'باز کردن منو'); mb.innerHTML = '<span></span><span></span><span></span>';
    mb.onclick = function () { var v = mob.hidden; mob.hidden = !v; mb.setAttribute('aria-expanded', v ? 'true' : 'false'); };
    nav.appendChild(ul); nav.appendChild(mb);
    rn.parentNode.insertBefore(nav, rn.nextSibling);
    (document.querySelector('header') || rn.parentNode).appendChild(mob);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var o = document.querySelector('.fs-dd[data-open] button'); closeAll(); if (o) o.focus(); if (!mob.hidden) { mob.hidden = true; mb.setAttribute('aria-expanded', 'false'); mb.focus(); } } });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeAll(); });
  }
  function controls() {
    var h = document.querySelector('header > div'); if (!h || h.querySelector('.fs-ctrl')) return;
    var c = document.createElement('div'); c.className = 'fs-ctrl'; c.setAttribute('data-no-i18n', '');
    var sw = document.createElement('button'); sw.type = 'button'; sw.className = 'fs-sw'; sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-label', UI[lang].theme); sw.title = UI[lang].theme;
    var setA = function () { sw.setAttribute('aria-checked', d.getAttribute('data-theme') === 'light' ? 'true' : 'false'); }; setA();
    sw.onclick = function () { var t = d.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; d.setAttribute('data-theme', t); try { localStorage.setItem('fs-theme', t); } catch (e) {} setA(); };
    var s = document.createElement('select'); s.className = 'fs-lang'; s.setAttribute('aria-label', UI[lang].lang);
    s.setAttribute('data-no-i18n', ''); var ph = document.createElement('option'); ph.value = ''; ph.textContent = 'زبان‌ها/Languages'; ph.disabled = true; ph.hidden = true; ph.selected = true; s.appendChild(ph);
    [['fa', 'فارسی'], ['en', 'English'], ['ar', 'العربية'], ['elv', 'Elvish ✦']].forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = (o[0] === lang ? '✓ ' : '') + o[1]; s.appendChild(op); });
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
      new MutationObserver(function () { controls(); fit(); }).observe(document.body, { childList: true, subtree: true });
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
