// Builds English versions (Arabic retired; /ar/ redirects to /en/) of Persian article pages (/articles/<slug>/en/, /ar/).
// Library used by publish.mjs; run directly to backfill existing articles. Never logs the API key.
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = p => path.join(ROOT, p);
export const LANGS = ['en']; // Persian + English only; ar/elv readers get English
const TRF = A('automation/translations.json');
export const loadTr = () => fs.existsSync(TRF) ? JSON.parse(fs.readFileSync(TRF, 'utf8')) : {};
export const saveTr = t => fs.writeFileSync(TRF, JSON.stringify(t, null, 1));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => String(s).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&');
const fa2en = s => String(s).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));

// Jalali -> Gregorian
function j2g(jy, jm, jd) {
  jy += 1595; let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097); days %= 146097;
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days / 1461); days %= 1461;
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let gd = days + 1; const ml = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let gm = 0;
  for (gm = 1; gm <= 12 && gd > ml[gm]; gm++) gd -= ml[gm];
  return new Date(Date.UTC(gy, gm - 1, gd));
}
export function gregFromFa(fadate) { // "dd-mm-yyyy" in Persian digits
  const m = fa2en(fadate).match(/(\d+)-(\d+)-(\d+)/); if (!m) return null; return j2g(+m[3], +m[2], +m[1]);
}
export function langDate(d, lang) {
  if (!d) return '';
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'ar-EG-u-nu-arab', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

const DISCLAIMER = {
  en: 'This article is for general information and education only and is not a substitute for professional advice. Laws and circulars can change; check the latest regulations or consult a tax adviser before making any decision.',
  ar: 'هذا المقال لأغراض تعليمية وإعلامية فقط، ولا يغني عن الاستشارة المتخصصة. قد تتغير القوانين والتعاميم؛ لذا راجع أحدث اللوائح أو استشر مستشاراً ضريبياً قبل اتخاذ أي قرار.',
};
const FA_DISCLAIMER_RE = /(<p class="mt-8 rounded-lg border border-gold\/30 p-4 text-sm leading-8 text-muted">)[^<]*(<\/p>)/;

// Ask xAI to translate one article. Returns {title, description, category, body_html}
export async function translateArticle(src, lang, key) {
  const name = lang === 'en' ? 'English' : 'Modern Standard Arabic';
  const sys = `You are a senior translator for an Iranian tax and accounting consultancy ("Forough Shomar Simorgh"). Translate Persian into natural, fluent, professional ${name} for business readers — not literal or robotic. Keep Iranian legal terms meaningful (e.g. "Taxpayers' System (Samaneh-ye Moadian)", "Note 100", "Article 169", "tax assessment notice (barg-e tashkhis)") ${lang === 'ar' ? 'using natural Arabic equivalents (منظومة المكلّفين، الملاحظة ١٠٠، ورقة التشخيص)' : ''}. Convert Solar Hijri months only if a date is given; keep numbers exact. ${lang === 'en' ? 'Use Latin digits.' : 'Use Arabic-Indic digits.'} Preserve every HTML tag and attribute exactly (keep href values unchanged); translate only the text. Translate the FAQ heading «پرسش‌های متداول» exactly as "Frequently Asked Questions". Keep the English title under 60 characters where possible and the description around 150 characters, keeping the main keyword. Output only valid JSON.`;
  const usr = JSON.stringify({ title: src.title, description: src.description, category: src.category, body_html: src.body_html });
  const r = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.XAI_MODEL || 'grok-4.20-0309-non-reasoning', temperature: 0.3, response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: `Translate the values of this JSON (keys: title, description, category, body_html) and return the same keys:\n${usr}` }] }) });
  if (!r.ok) throw new Error(`translate ${lang} status ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const out = JSON.parse(j.choices[0].message.content.replace(/^```json|```$/g, ''));
  if (!out.title || !out.body_html || /[آ-ی]{4,}/.test(lang === 'en' ? out.body_html : '')) throw new Error(`translate ${lang}: incomplete output`);
  return out;
}

export function extractFa(html) {
  html = html.replace(/<!--related-->[\s\S]*?<!--\/related-->/g, '');
  const title = unesc((html.match(/<span class="brand-shine-text">([^<]*)<\/span>/) || [])[1] || '');
  const description = unesc((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const i = html.indexOf('<div class="space-y-5">') + '<div class="space-y-5">'.length;
  const j = html.indexOf('</div><a class="mt-12', i);
  const body_html = html.slice(i, j).replace(FA_DISCLAIMER_RE, '');
  const date_fa = (html.match(/<p class="mb-4 text-sm text-muted">([^<]*)<\/p>/) || [])[1] || '';
  return { title, description, body_html, date_fa };
}

const dehydrate = s => s.replace(/<script data-tsr-stream-part="">[\s\S]*?<\/script>/g, '').replace(/<script type="module"[^>]*><\/script>/g, '')
  .replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<link rel="modulepreload"[^>]*>/g, '');

export function altLinks(slug) {
  const u = l => `https://foroughshomar.ir/articles/${slug}/${l === 'fa' ? '' : l + '/'}`;
  return ['fa', 'en'].map(l => `<link rel="alternate" hreflang="${l}" href="${u(l)}"/>`).join('') + `<link rel="alternate" hreflang="x-default" href="${u('fa')}"/>`;
}
const setAlt = (s, slug) => s.replace(/(<link rel="alternate" hreflang="[^"]+" href="[^"]*"\/>)+/, altLinks(slug));

// Build the language page from the Persian page HTML
export function buildLangPage(faHtml, slug, lang, t, dateText) {
  faHtml = faHtml.replace(/<!--related-->[\s\S]*?<!--\/related-->/g, '');
  const src = extractFa(faHtml);
  let s = dehydrate(faHtml);
  s = s.replace(/<html[^>]*>/, `<html lang="${lang}" dir="${lang === 'en' ? 'ltr' : 'rtl'}" data-page-lang="${lang}">`);
  const T = esc(t.title), D = esc(t.description);
  s = s.split(esc(src.title)).join(T).split(src.title).join(T);
  if (src.description) s = s.split(esc(src.description)).join(D).split(src.description).join(D);
  s = s.replace(/(<p class="mb-4 text-sm text-muted">)[^<]*(<\/p>)/, `$1${esc(dateText)}$2`);
  const i = s.indexOf('<div class="space-y-5">') + '<div class="space-y-5">'.length;
  const j = s.indexOf('</div><a class="mt-12', i);
  const disc = `<p class="mt-8 rounded-lg border border-gold/30 p-4 text-sm leading-8 text-muted">${esc(DISCLAIMER[lang])}</p>`;
  s = s.slice(0, i) + t.body_html + disc + s.slice(j);
  s = s.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${T}">`);
  s = s.replace(/(<a class="mt-12 inline-block text-sm text-gold[^"]*" href=")\/articles(")/, `$1/articles$2`);
  return setAlt(s, slug);
}

export async function makeVersions(slug, key, category) {
  const faF = A(`articles/${slug}/index.html`);
  let fa = fs.readFileSync(faF, 'utf8');
  const src = extractFa(fa); src.category = category || '';
  const tr = loadTr(); tr[slug] = tr[slug] || {};
  const d = gregFromFa(src.date_fa);
  for (const lang of LANGS) {
    const t = tr[slug][lang]?.body_html ? tr[slug][lang] : await translateArticle(src, lang, key);
    tr[slug][lang] = t; saveTr(tr);
    fs.mkdirSync(A(`articles/${slug}/${lang}`), { recursive: true });
    fs.writeFileSync(A(`articles/${slug}/${lang}/index.html`), buildLangPage(fa, slug, lang, t, langDate(d, lang)));
    console.log('built', slug, lang);
  }
  fs.writeFileSync(faF, setAlt(fa, slug));
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const KEY = process.env.XAI_API_KEY; if (!KEY) { console.error('XAI_API_KEY missing'); process.exit(1); }
  const idx = JSON.parse(fs.readFileSync(A('articles/index.json'), 'utf8')).articles;
  for (const a of idx) {
    try { await makeVersions(a.slug, KEY, a.category); } catch (e) { console.error('FAILED', a.slug, e.message); }
  }
}
