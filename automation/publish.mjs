// Daily article publisher. Reads XAI_API_KEY from env; never logs it.
import fs from 'node:fs'; import path from 'node:path'; import { buildIndex } from './build-index.mjs'; import { makeVersions } from './article-i18n.mjs'; import { pickLinks, isOfficial } from './official-links.mjs';
const DRY = !!process.env.DRY_RUN; // DRY_RUN=1: write a sample to $DRY_OUT (default /tmp/sample-article) only; nothing on the site changes
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = p => path.join(ROOT, p);
const KEY = process.env.XAI_API_KEY; if (!KEY) { console.error('XAI_API_KEY missing'); process.exit(1); }
const topics = JSON.parse(fs.readFileSync(A('automation/topics.json'), 'utf8'));
const usedF = A('automation/used.json');
const used = fs.existsSync(usedF) ? JSON.parse(fs.readFileSync(usedF, 'utf8')) : [];
const topic = topics.find(t => !used.some(u => u.topic === t));
if (!topic) { console.log('No unused topics left.'); process.exit(0); }
console.log('Topic:', topic);
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` };
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const allTitles = JSON.parse(fs.readFileSync(A('articles/index.json'), 'utf8')).articles.map(x => '- ' + x.title).join('\n');
const links = pickLinks(topic);
const linkList = links.map(l => `- ${l.url} → ${l.fa}`).join('\n');
const sys = `تو نویسنده ارشد یک دفتر مشاوره مالیاتی ایرانی به نام «فروغ‌شمار سیمرغ» هستی. به فارسی روان، طبیعی و حرفه‌ای بنویس، نه ترجمه‌ای و نه رباتیک. قوانین: هیچ شماره ماده، تبصره، بخشنامه، تاریخ یا نرخ دقیقی را که از درستی‌اش مطمئن نیستی ذکر نکن و چیزی از خودت نساز؛ به‌جای آن کلی و عملی توضیح بده و خواننده را به سامانه رسمی سازمان امور مالیاتی یا مشاور ارجاع بده. خروجی فقط JSON معتبر باشد. اصول محتوای مفید گوگل (E-E-A-T) را رعایت کن: برای انسان بنویس نه موتور جست‌وجو، از تجربه عملی یک مشاور مالیاتی بگو (مثال‌های فرضی را صریحاً «مثال فرضی» بنام و بدون نام واقعی)، هر عدد یا نرخ یا تاریخ را فقط اگر از منبع رسمی و قطعی است بیاور و منبعش را بگو، و اصلاً لینک یا آدرس اینترنتی‌ای جز فهرست مجاز نساز.`;
const recent = JSON.parse(fs.readFileSync(A('articles/index.json'), 'utf8')).articles.slice(0, 12).map(x => `- ${x.title} → /articles/${x.slug}/`).join('\n');
const usr = `موضوع: ${topic}
سؤال اصلی: این موضوع کلی است؛ آن را به یک «سؤال واقعی و مشخص» تبدیل کن که یک مؤدی ایرانی دقیقاً در گوگل می‌پرسد (مثلاً «اگر اظهارنامه ارزش افزوده را دیر بدهم چه می‌شود؟»). این سؤال نباید با عنوان هیچ‌کدام از مقاله‌های موجود زیر تکراری یا خیلی نزدیک باشد:
${allTitles}
پاسخ مستقیم و کوتاه سؤال (۲ تا ۳ جمله) را در کلید "answer" بده تا بالای مقاله نمایش داده شود.
یک مقاله کاربردی ۹۰۰ تا ۱۳۰۰ کلمه‌ای و سئو‌محور بنویس. قواعد سئو:
- یک «کلیدواژه اصلی» فارسی (عبارتی که مردم در گوگل جست‌وجو می‌کنند) انتخاب کن؛ این عبارت باید عیناً در title، در اولین پاراگراف (intro) و حداقل در یکی از عنوان‌های H2 بیاید، طبیعی و بدون تکرار زیاد.
- "seo_title": حداکثر ۶۰ کاراکتر، کلیدواژه در ابتدای آن.
- "description": توضیح متا بین ۱۲۰ تا ۱۵۵ کاراکتر، شامل کلیدواژه و دعوت به خواندن.
- ساختار: چند بخش H2 و در صورت نیاز زیربخش H3؛ پاراگراف‌های کوتاه.
- در متن، به ۲ یا ۳ مقاله مرتبط از فهرست زیر لینک بده (با تگ <a href="مسیر">متن لینک توصیفی</a> داخل پاراگراف‌ها) و یک‌بار هم به صفحه رزرو /contact/ یا خدمات /services/ لینک بده. فقط از همین مسیرها استفاده کن:
${recent}
- لینک به منابع رسمی: در ۲ تا ۴ جای مناسب از متن، با تگ <a href="آدرس کامل">متن توصیفی</a> به منابع رسمی زیر لینک بده و خواننده را برای جزئیات و آخرین بخشنامه به آن‌ها ارجاع بده. فقط و فقط از همین آدرس‌ها، عیناً:
${linkList}
- لینک داخلی: علاوه بر بالا، اگر موضوع به موعدها مربوط است به /calendar/ (تقویم تکالیف مالیاتی) لینک بده.
- حداقل یک بخش «مثال عملی» (H2 یا H3) با یک سناریوی فرضی گام‌به‌گام داشته باش.
- "faq": ۳ تا ۴ پرسش واقعی کاربران با پاسخ کوتاه و دقیق.
خروجی JSON با کلیدهای:
"question" (سؤال مشخص)، "answer"، "keyword"، "title" (عنوان H1 جذاب، شامل کلیدواژه)، "seo_title"، "description"، "category" (یک یا دو کلمه)، "slug" (لاتین کوچک با خط تیره، ۳ تا ۵ کلمه فینگلیش بر پایه کلیدواژه)، "image_alt" (توضیح فارسی تصویر شامل کلیدواژه)، "intro" (پاراگراف اول)، "sections": آرایه‌ای از {"heading": عنوان H2, "paragraphs": [..], "subsections": [{"heading": عنوان H3, "paragraphs": [..]}]}، "faq": [{"q": .., "a": ..}].
آخرین بخش heading «جمع‌بندی» داشته باشد. در پاراگراف‌ها فقط تگ <a> مجاز است.`;
const r = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', headers: H, body: JSON.stringify({
  model: process.env.XAI_MODEL || 'grok-4.20-0309-non-reasoning', temperature: 0.6,
  response_format: { type: 'json_object' }, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }] }) });
if (!r.ok) { console.error('Text API error', r.status, (await r.text()).slice(0, 300)); process.exit(1); }
const j = await r.json(); console.log('Usage:', JSON.stringify(j.usage || {}));
const art = JSON.parse(j.choices[0].message.content.replace(/^```json|```$/g, ''));
let slug = (art.slug || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'article';
while (fs.existsSync(A(`articles/${slug}`))) slug += '-2';

// Header image (16:9), fallback to default
let img = '/og.jpg';
if (!DRY) try {
  const ir = await fetch('https://api.x.ai/v1/images/generations', { method: 'POST', headers: H, body: JSON.stringify({
    model: process.env.XAI_IMAGE_MODEL || 'grok-imagine-image', n: 1, response_format: 'b64_json', aspect_ratio: '16:9',
    prompt: `Elegant editorial header illustration for a Persian tax-consulting article about: ${art.title} (${topic}). Abstract, calm, professional; deep navy and gold palette; documents, ledgers, calculators, geometric Persian patterns. Absolutely no text, no letters, no numbers, no people, no faces, no logos. Wide 16:9 composition.` }) });
  if (!ir.ok) throw new Error('image status ' + ir.status + ' ' + (await ir.text()).slice(0, 200));
  const d = (await ir.json()).data[0];
  const buf = d.b64_json ? Buffer.from(d.b64_json, 'base64') : Buffer.from(await (await fetch(d.url)).arrayBuffer());
  const ext = buf[0] === 0x89 ? 'png' : buf.slice(8, 12).toString() === 'WEBP' ? 'webp' : 'jpg';
  fs.writeFileSync(A(`articles/${slug}.${ext}`), buf); img = `/articles/${slug}.${ext}`;
} catch (e) { console.log('Image failed, using default:', e.message); }

const date = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' })
  .formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
const fadate = `${date.day}-${date.month}-${date.year}`;
// paragraphs: escape everything, then re-allow internal <a href="/..."> links only
const linkify = t => esc(t).replace(/&lt;a href=&quot;(\/[a-z0-9\/-]*)&quot;&gt;([\s\S]*?)&lt;\/a&gt;/g, '<a class="text-gold underline" href="$1">$2</a>')
  .replace(/&lt;a href=&quot;(https:\/\/[^&\s]+)&quot;&gt;([\s\S]*?)&lt;\/a&gt;/g, (m, u, t) => isOfficial(u) ? `<a class="text-gold underline" href="${u}" target="_blank" rel="noopener">${t}</a>` : t);
const P = t => `<p class="text-base leading-9 text-ink">${linkify(t)}</p>`;
const H2 = t => `<h2 class="pt-4 text-xl font-medium leading-loose text-navy">${esc(t)}</h2>`;
const H3 = t => `<h3 class="pt-2 text-lg font-medium leading-loose text-navy">${esc(t)}</h3>`;
let body = (art.answer ? `<div class="rounded-xl border border-gold/40 bg-gold/5 p-5"><p class="text-sm font-medium text-gold">پاسخ کوتاه</p><p class="mt-2 text-base leading-9 text-ink">${esc(art.answer)}</p></div>` : '') + (art.intro ? P(art.intro) : '');
const conc = (art.sections || []).filter(x => /جمع‌?بندی/.test(x.heading || '')), main = (art.sections || []).filter(x => !conc.includes(x));
const sec = x => { let o = x.heading ? H2(x.heading) : ''; for (const p of x.paragraphs || []) o += P(p);
  for (const ss of x.subsections || []) { if (ss.heading) o += H3(ss.heading); for (const p of ss.paragraphs || []) o += P(p); } return o; };
for (const x of main) body += sec(x);
if ((art.faq || []).length) { body += H2('پرسش‌های متداول'); for (const f of art.faq) body += H3(f.q) + `<p class="text-base leading-9 text-ink">${esc(f.a)}</p>`; }
for (const x of conc) body += sec(x);
body += `<p class="mt-8 rounded-lg border border-gold/30 p-4 text-sm leading-8 text-muted">این مطلب صرفاً جنبه آموزشی و اطلاع‌رسانی دارد و جایگزین مشاوره تخصصی نیست. قوانین و بخشنامه‌ها ممکن است تغییر کنند؛ پیش از هر تصمیم، آخرین مقررات را بررسی کنید یا با مشاور مالیاتی مشورت کنید.</p>`;
const url = `/articles/${slug}`;
const st = String(art.seo_title || art.title).trim(); const seoTitle = (st + ' | فروغ‌شمار سیمرغ').length <= 60 ? st + ' | فروغ‌شمار سیمرغ' : st;
const fill = s => s.replaceAll('{{IMG}}', img).replaceAll('{{URL}}', url).replaceAll('{{TITLE}}', esc(art.title))
  .replaceAll('{{SEOTITLE}}', esc(seoTitle)).replaceAll('{{ALT}}', esc(art.image_alt || art.title)).replaceAll('{{DESC}}', esc(art.description)).replaceAll('{{DATE}}', fadate);
const page = fill(fs.readFileSync(A('automation/article-template.html'), 'utf8')).replace('{{BODY}}', body);
if (DRY) { const out = process.env.DRY_OUT || '/tmp/sample-article'; fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), page); fs.writeFileSync(path.join(out, 'article.json'), JSON.stringify({ topic, links: links.map(l => l.url), ...art }, null, 1));
  console.log('DRY RUN written to', out); process.exit(0); }
fs.mkdirSync(A(`articles/${slug}`)); fs.writeFileSync(A(`articles/${slug}/index.html`), page);

// Card for lists
const card = `<a class="block" href="${url}"><article class="flex h-full flex-col rounded-xl border border-gold/25 bg-navy-soft p-7 transition duration-300 hover:scale-[1.03] hover:border-gold hover:bg-navy-soft hover:shadow-[0_0_24px_rgba(212,175,55,0.22)]"><img src="${img}" alt="${esc(art.image_alt || art.title)}" loading="lazy" width="640" height="360" class="mb-5 aspect-video w-full rounded-lg object-cover"/><p class="text-xs text-saffron">${esc(art.category || 'مالیات')} · ${fadate}</p><h2 class="mt-5 text-lg leading-loose text-gold">${esc(art.title)}</h2><p class="mt-4 text-sm leading-8 text-cream/75">${esc(art.description)}</p><p class="mt-auto self-end pt-6 text-sm text-saffron">خواندن ادامه</p></article></a>`;
// Remove React hydration so static edits are not overwritten in the browser
const dehydrate = s => s.replace(/<script data-tsr-stream-part="">[\s\S]*?<\/script>/g, '').replace(/<script type="module"[^>]*><\/script>/g, '').replace(/<script>[\s\S]*?<\/script>/g, '');
{ const f = A('articles/index.html'); let s = fs.readFileSync(f, 'utf8');
  const m = s.match(/<a class="block" href="\/articles\/[^"]+">/); if (m) s = s.replace(m[0], card + m[0]);
  fs.writeFileSync(f, dehydrate(s)); }
{ const f = A('index.html'); let s = fs.readFileSync(f, 'utf8');
  const m = s.match(/<a[^>]*href="\/articles\/[a-z0-9-]+"[^>]*>[\s\S]*?<\/a>/);
  if (m) { // newest first, drop the oldest home card to keep the block size
    const all = [...s.matchAll(/<a[^>]*href="\/articles\/[a-z0-9-]+"[^>]*>[\s\S]*?<\/a>/g)];
    const homeCard = m[0].startsWith('<a class="block"') ? card : null;
    if (homeCard) { s = s.replace(m[0], homeCard + m[0]); if (all.length > 1) { const last = all[all.length - 1][0]; const i = s.lastIndexOf(last); s = s.slice(0, i) + s.slice(i + last.length); } fs.writeFileSync(f, dehydrate(s)); }
  } }
used.push({ topic, slug, title: art.title, date: new Date().toISOString() });
fs.writeFileSync(usedF, JSON.stringify(used, null, 1));
try { await makeVersions(slug, KEY, art.category || ''); } catch (e) { console.log('Translation failed (Persian still published):', e.message); }
console.log('index.json articles:', buildIndex());
await import('./seo.mjs'); // head tags, JSON-LD (Article/FAQ/Breadcrumb), related links, sitemap.xml, robots.txt
fs.appendFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `slug=${slug}\ntitle=${art.title}\n`);
console.log('Published:', art.title, url);
