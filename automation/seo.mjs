// SEO pass over the built site (idempotent): head tags, JSON-LD, related links, alt texts, sitemap.xml, robots.txt.
// Run after every publish: node automation/seo.mjs
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
import { gregFromFa } from './article-i18n.mjs'; import { pickLinks, isOfficial } from './official-links.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = p => path.join(ROOT, p);
const SITE = 'https://foroughshomar.ir', BRAND = 'فروغ‌شمار سیمرغ', BRAND_EN = 'Forough Shomar Simorgh';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => String(s).replace(/<!-- -->/g, '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&');
const strip = s => unesc(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const clip = (s, n) => s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const DESC = { // pages whose built description is generic or duplicated
  '/privacy/': 'چه اطلاعاتی از شما نگه می‌داریم، برای چه و تا کی؛ پوشاندن اطلاعات شخصی، کارت بانکی، کوکی‌ها و حق درخواست حذف در فروغ‌شمار سیمرغ.',
  '/terms/': 'شرایط استفاده از سایت و خدمات فروغ‌شمار سیمرغ: محتوای آموزشی، رزرو مشاوره، پاسخ سیمرغ، خرید «پر سیمرغ»، پرداخت، تحویل و بازگشت وجه.',
  '/': 'فروغ‌شمار سیمرغ؛ مشاوره مالیاتی و حسابداری برای اشخاص حقیقی، شرکت‌ها و صاحبان مشاغل: اظهارنامه، سامانه مؤدیان، تبصره ۱۰۰ و دفاع پرونده.',
};
const ORG = { '@type': ['Organization', 'AccountingService'], '@id': SITE + '/#org', name: BRAND, alternateName: BRAND_EN, url: SITE + '/',
  email: 'info@foroughshomar.ir', logo: SITE + '/brand/logo.jpg', image: SITE + '/og.jpg', areaServed: 'IR', knowsLanguage: ['fa', 'en'], legalName: BRAND,
  address: { '@type': 'PostalAddress', streetAddress: 'شهرزیبا، میدان کودک، کوچه شاداب، بن‌بست لاله، پلاک ۱۴، واحد ۱', addressLocality: 'تهران', addressRegion: 'تهران', postalCode: '1474614361', addressCountry: 'IR' } };
const AUTHOR = { '@type': 'Person', '@id': SITE + '/#hamed', name: 'دکتر حامد ملاطفی', alternateName: 'Dr. Hamed Molatefi', jobTitle: 'مشاور مالیاتی', url: SITE + '/about/', worksFor: { '@id': SITE + '/#org' } };
const faDate = iso => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
function byline(en, mod) { return `<!--byline--><p class="mb-6 text-sm leading-8 text-muted" data-no-i18n${en ? ' lang="en" dir="ltr"' : ''}>${en
  ? `By <a class="text-gold hover:underline" href="/about/?lang=en" rel="author">Dr. Hamed Molatefi</a>, tax adviser · Reviewed ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(mod))}`
  : `نویسنده: <a class="text-gold hover:underline" href="/about/" rel="author">دکتر حامد ملاطفی</a>، مشاور مالیاتی · آخرین بازبینی: ${faDate(mod)}`}</p><!--/byline-->`; }
function sources(faText, en, bodyHtml) { // links already cited in the body + topic picks from the whitelist, 2–4 total
  const cited = [...bodyHtml.matchAll(/href="(https:\/\/[^"]+)"/g)].map(m => m[1]).filter(isOfficial);
  const L = JSON.parse(fs.readFileSync(A('automation/official-links.json'), 'utf8')).links;
  const list = [...new Set([...cited.map(u => L.find(l => l.url === u || l.url === u + '/')), ...pickLinks(faText)])].filter(Boolean).slice(0, 4);
  return `<!--srcs--><section class="mt-8 rounded-xl border border-gold/25 p-5" data-no-i18n${en ? ' lang="en" dir="ltr"' : ''}><h2 class="text-lg font-medium text-navy">${en ? 'Official sources' : 'منابع رسمی برای پیگیری'}</h2><p class="mt-2 text-sm leading-8 text-muted">${en ? 'Check the latest rules and deadlines on the official websites:' : 'آخرین قوانین، بخشنامه‌ها و مهلت‌ها را در این سایت‌های رسمی ببینید:'}</p><ul class="mt-3 list-disc space-y-1 ps-5 text-sm leading-8">${list.map(l => `<li><a class="text-gold hover:underline" href="${l.url}" target="_blank" rel="noopener">${esc(en ? l.en : l.fa)}</a></li>`).join('')}</ul></section><!--/srcs-->`; }
const lastmod = f => { try { const d = execSync(`git log -1 --format=%cI -- "${f}"`, { cwd: ROOT }).toString().trim(); if (d) return d.slice(0, 10); } catch {} return new Date().toISOString().slice(0, 10); };
const idx = JSON.parse(fs.readFileSync(A('articles/index.json'), 'utf8')).articles;
const pubDate = a => (a.published_at ? new Date(a.published_at) : gregFromFa(a.date_fa) || new Date()).toISOString().slice(0, 10);

function pages() {
  const out = [];
  const walk = d => { for (const e of fs.readdirSync(A(d), { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['assets', 'automation', 'i18n', 'fonts', 'brand', 'node_modules'].includes(e.name)) continue;
    const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'ar') walk(p); } else if (e.name === 'index.html') out.push(p);
  } };
  walk('.'); return out.map(f => ({ f, url: '/' + path.dirname(f).replace(/^\.\/?/, '').replace(/^\.$/, '') }))
    .map(o => ({ ...o, url: (o.url + '/').replace(/\/+$/, '/') }));
}
function related(slug, lang) {
  const me = idx.find(a => a.slug === slug); const others = idx.filter(a => a.slug !== slug);
  const pick = [...others.filter(a => me && a.category === me.category), ...others.filter(a => !me || a.category !== me.category)].slice(0, 3);
  const en = lang === 'en';
  const li = pick.map(a => { const t = en ? a.translations?.en : null; if (en && !t) return '';
    return `<li><a class="text-gold hover:underline" href="${en ? t.path : `/articles/${a.slug}/`}">${esc(en ? t.title : a.title)}</a></li>`; }).join('');
  return `<!--related--><section class="mt-12 rounded-xl border border-gold/25 p-6" data-no-i18n ${en ? 'lang="en" dir="ltr"' : ''}><h2 class="text-lg font-medium text-navy">${en ? 'Related articles' : 'مقالات مرتبط'}</h2><ul class="mt-4 list-disc space-y-2 ps-5 text-sm leading-8">${li}</ul><p class="mt-5 text-sm leading-8">${en
    ? 'Need help with your own case? See our <a class="text-gold hover:underline" href="/services/?lang=en">services</a> or <a class="text-gold hover:underline" href="/contact/?lang=en">book an introductory session</a>.'
    : 'برای بررسی پرونده خودتان، <a class="text-gold hover:underline" href="/services/">خدمات ما</a> را ببینید یا <a class="text-gold hover:underline" href="/contact/">جلسه آشنایی رزرو کنید</a>.'}</p></section><!--/related-->`;
}
function faqFrom(html) { // <h2>پرسش‌های متداول|FAQ</h2> followed by <h3>Q</h3><p>A</p>
  const m = html.match(/<h2[^>]*>\s*(?:پرسش‌های متداول|پرسش‌های پرتکرار|سؤالات متداول|Frequently Asked Questions|FAQ)[^<]*<\/h2>([\s\S]*?)(?=<h2|<p class="mt-8 rounded-lg|<!--related-->|$)/i);
  if (!m) return [];
  return [...m[1].matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g)].map(x => ({ '@type': 'Question', name: strip(x[1]), acceptedAnswer: { '@type': 'Answer', text: strip(x[2]) } }));
}
const urls = [];
for (const { f, url } of pages()) {
  let s = fs.readFileSync(A(f), 'utf8');
  const art = url.match(/^\/articles\/([a-z0-9-]+)\/(en\/)?$/); const slug = art?.[1]; const en = !!art?.[2]; const a = slug && idx.find(x => x.slug === slug);
  // remove previous SEO tags (ours and the build's). NOTE: <meta name="google-site-verification"> is never touched — keep it that way
  s = s.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/g, '').replace(/<link rel="(?:canonical|alternate)" hreflang="[^"]*" href="[^"]*"\/?>/g, '')
    .replace(/<link rel="canonical"[^>]*>/g, '').replace(/<meta (?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/g, '');
  const title0 = unesc((s.match(/<title>([^<]*)<\/title>/) || [])[1] || BRAND);
  let desc = DESC[url] || unesc((s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  let title = title0;
  if (en) title = (a?.translations?.en?.title || title0).replace(/(\s*\|\s*(?:فروغ‌شمار سیمرغ|Forough Shomar Simorgh))+$/, '') + ' | ' + BRAND_EN;
  desc = clip(desc, 160);
  s = s.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`).replace(/<meta name="description" content="[^"]*"\/?>/, `<meta name="description" content="${esc(desc)}"/>`);
  if (!/<meta name="description"/.test(s)) s = s.replace('</title>', `</title><meta name="description" content="${esc(desc)}"/>`);
  const canon = SITE + url;
  const alts = slug ? { fa: `${SITE}/articles/${slug}/`, en: a?.translations?.en ? `${SITE}/articles/${slug}/en/` : null }
    : { fa: canon, en: url === '/404/' ? null : canon + '?lang=en' };
  const img = slug ? SITE + ((s.match(/<img src="(\/articles\/[^"]+)"/) || [])[1] || '/og.jpg') : SITE + '/og.jpg';
  const graph = [ORG];
  if (url === '/') graph.push({ '@type': 'WebSite', '@id': SITE + '/#site', name: BRAND, url: SITE + '/', inLanguage: 'fa', publisher: { '@id': SITE + '/#org' } });
  if (slug && a) {
    const h = en ? (a.translations?.en?.title || title) : a.title;
    graph.push({ '@type': 'Article', headline: clip(h, 110), description: desc, image: [img], inLanguage: en ? 'en' : 'fa', datePublished: pubDate(a), dateModified: lastmod(f),
      mainEntityOfPage: canon, author: AUTHOR, publisher: { '@id': SITE + '/#org' } });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'خانه', item: SITE + '/' + (en ? '?lang=en' : '') },
      { '@type': 'ListItem', position: 2, name: en ? 'Articles' : 'مقالات', item: SITE + '/articles/' + (en ? '?lang=en' : '') },
      { '@type': 'ListItem', position: 3, name: h, item: canon }] });
    // static article pages: drop React hydration so injected blocks persist
    s = s.replace(/<script data-tsr-stream-part="">[\s\S]*?<\/script>/g, '').replace(/<script type="module"[^>]*><\/script>/g, '').replace(/<link rel="modulepreload"[^>]*>/g, '');
    // related links + hero alt
    s = s.replace(/<!--related-->[\s\S]*?<!--\/related-->/g, '');
    // byline (E-E-A-T) under the date, official sources before the disclaimer, external links open safely
    s = s.replace(/<!--byline-->[\s\S]*?<!--\/byline-->/g, '').replace(/<!--srcs-->[\s\S]*?<!--\/srcs-->/g, '');
    s = s.replace(/(<p class="mb-4 text-sm text-muted">[^<]*<\/p>)/, '$1' + byline(en, lastmod(f)));
    const faHtml = en ? fs.readFileSync(A(`articles/${slug}/index.html`), 'utf8') : s;
    const faText = a.title + ' ' + strip((faHtml.split('<div class="space-y-5">')[1] || '').split('<!--srcs-->')[0].split('</div><a class="mt-12')[0]);
    if (!/<p class="mt-8 rounded-lg border border-gold\/30 p-4 text-sm leading-8 text-muted">/.test(s)) // older pages: add the standard disclaimer
      s = s.replace('</div><a class="mt-12', `<p class="mt-8 rounded-lg border border-gold/30 p-4 text-sm leading-8 text-muted">${en ? 'This article is for general information and education only and is not a substitute for professional advice. Laws and circulars can change; check the latest regulations or consult a tax adviser before making any decision.' : 'این مطلب صرفاً جنبه آموزشی و اطلاع‌رسانی دارد و جایگزین مشاوره تخصصی نیست. قوانین و بخشنامه‌ها ممکن است تغییر کنند؛ پیش از هر تصمیم، آخرین مقررات را بررسی کنید یا با مشاور مالیاتی مشورت کنید.'}</p></div><a class="mt-12`);
    s = s.replace(/(<p class="mt-8 rounded-lg border border-gold\/30 p-4 text-sm leading-8 text-muted">)/, sources(faText, en, s) + '$1');
    s = s.replace(/<a ([^>]*?)href="(https:\/\/[^"]+)"([^>]*)>/g, (m, b, u, c) => isOfficial(u) && !/target=/.test(b + c) ? `<a ${b}href="${u}"${c} target="_blank" rel="noopener">` : m);
    s = s.replace(/(<a class="mt-12 inline-block text-sm text-gold)/, related(slug, en ? 'en' : 'fa') + '$1');
    s = s.replace(/(<img src="\/articles\/[^"]+" alt=")[^"]*(")/, `$1${esc(h)}$2`);
  }
  let faq = slug ? faqFrom(s) : [];
  if (url === '/faq/') { const qa = JSON.parse(fs.readFileSync(A('automation/faq.json'), 'utf8')); faq = qa.filter(x => s.includes(esc(x.q)) || s.includes(x.q)).map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })); }
  if (faq.length) graph.push({ '@type': 'FAQPage', mainEntity: faq });
  const og = slug ? 'article' : 'website';
  const head = `<!--seo--><link rel="canonical" href="${canon}"/>` + (slug ? '' : `<script>if(/[?&]lang=en\\b/.test(location.search)){var c=document.querySelector('link[rel=canonical]');if(c)c.href+='?lang=en'}</script>`)
    + Object.entries(alts).filter(([, v]) => v).map(([l, v]) => `<link rel="alternate" hreflang="${l}" href="${v}"/>`).join('') + `<link rel="alternate" hreflang="x-default" href="${alts.fa}"/>`
    + `<meta property="og:type" content="${og}"/><meta property="og:site_name" content="${BRAND}"/><meta property="og:locale" content="${en ? 'en_US' : 'fa_IR'}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:url" content="${canon}"/><meta property="og:image" content="${img}"/>`
    + `<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(title)}"/><meta name="twitter:description" content="${esc(desc)}"/><meta name="twitter:image" content="${img}"/>`
    + (url === '/404/' ? '<meta name="robots" content="noindex"/>' : '') + ld({ '@context': 'https://schema.org', '@graph': graph }) + '<!--/seo-->';
  s = s.replace(/<head>/, '<head>' + head);
  if (url === '/contact/') s = s.replace(/(<img src="\/brand\/office-[a-z]+\.jpg") alt=""/g, '$1 alt="دفتر مشاوره مالیاتی فروغ‌شمار سیمرغ"');
  fs.writeFileSync(A(f), s);
  if (url !== '/404/') urls.push({ loc: canon, lastmod: lastmod(f), alts, pri: url === '/' ? '1.0' : slug ? '0.7' : '0.8' });
}
// 404.html at the root (GitHub Pages)
if (fs.existsSync(A('404/index.html'))) fs.copyFileSync(A('404/index.html'), A('404.html'));
const x = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
const seen = new Set();
for (const u of urls) { // en article pages get their own <url> too (they are in urls already)
  if (seen.has(u.loc)) continue; seen.add(u.loc);
  const al = Object.entries(u.alts).filter(([, v]) => v).map(([l, v]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(v)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(u.alts.fa)}"/>`;
  x.push(`<url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pri}</priority>${al}</url>`);
}
x.push('</urlset>');
fs.writeFileSync(A('sitemap.xml'), x.join('\n') + '\n');
fs.writeFileSync(A('robots.txt'), `User-agent: *\nAllow: /\nDisallow: /automation/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('SEO: pages', urls.length, 'sitemap urls', seen.size);
