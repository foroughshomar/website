// SEO pass over the built site (idempotent): head tags, JSON-LD, related links, alt texts, sitemap.xml, robots.txt.
// Run after every publish: node automation/seo.mjs
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
import { gregFromFa } from './article-i18n.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = p => path.join(ROOT, p);
const SITE = 'https://foroughshomar.ir', BRAND = 'فروغ شمار سیمرغ', BRAND_EN = 'Forough Shomar Simorgh';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => String(s).replace(/<!-- -->/g, '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&');
const strip = s => unesc(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const clip = (s, n) => s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const DESC = { // pages whose built description is generic or duplicated
  '/privacy/': 'سیاست حریم خصوصی فروغ شمار سیمرغ: چه اطلاعاتی از فرم رزرو مشاوره مالیاتی جمع می‌شود، چگونه نگهداری می‌شود و چه حقوقی دارید.',
  '/terms/': 'شرایط استفاده از سایت و خدمات مشاوره مالیاتی فروغ شمار سیمرغ؛ دامنه مسئولیت، رزرو جلسه و استفاده از محتوای آموزشی.',
  '/': 'فروغ شمار سیمرغ؛ مشاوره مالیاتی و حسابداری برای اشخاص حقیقی، شرکت‌ها و صاحبان مشاغل: اظهارنامه، سامانه مؤدیان، تبصره ۱۰۰ و دفاع پرونده.',
};
const ORG = { '@type': ['Organization', 'AccountingService'], '@id': SITE + '/#org', name: BRAND, alternateName: BRAND_EN, url: SITE + '/',
  email: 'info@foroughshomar.ir', logo: SITE + '/brand/logo.jpg', image: SITE + '/og.jpg', areaServed: 'IR', knowsLanguage: ['fa', 'en'] };
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
  if (en) title = (a?.translations?.en?.title || title0).replace(/(\s*\|\s*(?:فروغ شمار سیمرغ|Forough Shomar Simorgh))+$/, '') + ' | ' + BRAND_EN;
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
      mainEntityOfPage: canon, author: { '@id': SITE + '/#org' }, publisher: { '@id': SITE + '/#org' } });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'خانه', item: SITE + '/' + (en ? '?lang=en' : '') },
      { '@type': 'ListItem', position: 2, name: en ? 'Articles' : 'مقالات', item: SITE + '/articles/' + (en ? '?lang=en' : '') },
      { '@type': 'ListItem', position: 3, name: h, item: canon }] });
    // static article pages: drop React hydration so injected blocks persist
    s = s.replace(/<script data-tsr-stream-part="">[\s\S]*?<\/script>/g, '').replace(/<script type="module"[^>]*><\/script>/g, '').replace(/<link rel="modulepreload"[^>]*>/g, '');
    // related links + hero alt
    s = s.replace(/<!--related-->[\s\S]*?<!--\/related-->/g, '');
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
  if (url === '/contact/') s = s.replace(/(<img src="\/brand\/office-[a-z]+\.jpg") alt=""/g, '$1 alt="دفتر مشاوره مالیاتی فروغ شمار سیمرغ"');
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
