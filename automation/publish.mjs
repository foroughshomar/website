// Daily article publisher. Reads XAI_API_KEY from env; never logs it.
import fs from 'node:fs'; import path from 'node:path'; import { buildIndex } from './build-index.mjs';
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

const sys = `تو نویسنده ارشد یک دفتر مشاوره مالیاتی ایرانی به نام «فروغ شمار سیمرغ» هستی. به فارسی روان، طبیعی و حرفه‌ای بنویس، نه ترجمه‌ای و نه رباتیک. قوانین: هیچ شماره ماده، تبصره، بخشنامه، تاریخ یا نرخ دقیقی را که از درستی‌اش مطمئن نیستی ذکر نکن و چیزی از خودت نساز؛ به‌جای آن کلی و عملی توضیح بده و خواننده را به سامانه رسمی سازمان امور مالیاتی یا مشاور ارجاع بده. خروجی فقط JSON معتبر باشد.`;
const usr = `موضوع: ${topic}
یک مقاله کاربردی ۸۰۰ تا ۱۲۰۰ کلمه‌ای بنویس. خروجی JSON با کلیدهای:
"title" (عنوان کوتاه و جذاب فارسی)، "description" (یک جمله خلاصه)، "category" (یک یا دو کلمه)، "slug" (لاتین کوچک با خط تیره، حداکثر ۵ کلمه، فینگلیش)، "sections": آرایه‌ای از {"heading": عنوان زیربخش یا رشته خالی, "paragraphs": [پاراگراف‌ها]}.
در پایان یک بخش با heading «جمع‌بندی» بیاور.`;
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
try {
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
const P = t => `<p class="text-base leading-9 text-ink">${esc(t)}</p>`;
let body = '';
for (const s of art.sections || []) {
  if (s.heading) body += `<h2 class="pt-4 text-xl font-medium leading-loose text-navy">${esc(s.heading)}</h2>`;
  for (const p of s.paragraphs || []) body += P(p);
}
body += `<p class="mt-8 rounded-lg border border-gold/30 p-4 text-sm leading-8 text-muted">این مطلب صرفاً جنبه آموزشی و اطلاع‌رسانی دارد و جایگزین مشاوره تخصصی نیست. قوانین و بخشنامه‌ها ممکن است تغییر کنند؛ پیش از هر تصمیم، آخرین مقررات را بررسی کنید یا با مشاور مالیاتی مشورت کنید.</p>`;
const url = `/articles/${slug}`;
const fill = s => s.replaceAll('{{IMG}}', img).replaceAll('{{URL}}', url).replaceAll('{{TITLE}}', esc(art.title))
  .replaceAll('{{DESC}}', esc(art.description)).replaceAll('{{DATE}}', fadate);
const page = fill(fs.readFileSync(A('automation/article-template.html'), 'utf8')).replace('{{BODY}}', body);
fs.mkdirSync(A(`articles/${slug}`)); fs.writeFileSync(A(`articles/${slug}/index.html`), page);

// Card for lists
const card = `<a class="block" href="${url}"><article class="flex h-full flex-col rounded-xl border border-gold/25 bg-navy-soft p-7 transition duration-300 hover:scale-[1.03] hover:border-gold hover:bg-navy-soft hover:shadow-[0_0_24px_rgba(212,175,55,0.22)]"><img src="${img}" alt="${esc(art.title)}" loading="lazy" width="640" height="360" class="mb-5 aspect-video w-full rounded-lg object-cover"/><p class="text-xs text-saffron">${esc(art.category || 'مالیات')} · ${fadate}</p><h2 class="mt-5 text-lg leading-loose text-gold">${esc(art.title)}</h2><p class="mt-4 text-sm leading-8 text-cream/75">${esc(art.description)}</p><p class="mt-auto self-end pt-6 text-sm text-saffron">خواندن ادامه</p></article></a>`;
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
const sm = A('sitemap.xml');
if (fs.existsSync(sm)) fs.writeFileSync(sm, fs.readFileSync(sm, 'utf8').replace('</urlset>', `<url><loc>https://foroughshomar.ir${url}</loc></url></urlset>`));
used.push({ topic, slug, title: art.title, date: new Date().toISOString() });
fs.writeFileSync(usedF, JSON.stringify(used, null, 1));
console.log('index.json articles:', buildIndex());
fs.appendFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `slug=${slug}\ntitle=${art.title}\n`);
console.log('Published:', art.title, url);
