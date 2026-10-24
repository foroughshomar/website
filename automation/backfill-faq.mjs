// One-time: add a FAQ section (fa + en) to older articles that lack one. Answers are drawn ONLY from the article's own text.
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'); const A = p => path.join(ROOT, p);
const KEY = process.env.XAI_API_KEY; if (!KEY) { console.error('XAI_API_KEY missing'); process.exit(1); }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const DISC = '<p class="mt-8 rounded-lg border border-gold/30 p-4 text-sm leading-8 text-muted">';
const block = (h, qa) => `<h2 class="pt-4 text-xl font-medium leading-loose text-navy">${h}</h2>` + qa.map(x => `<h3 class="pt-2 text-lg font-medium leading-loose text-navy">${esc(x.q)}</h3><p class="text-base leading-9 text-ink">${esc(x.a)}</p>`).join('');
for (const slug of fs.readdirSync(A('articles')).filter(d => fs.existsSync(A(`articles/${d}/index.html`)))) {
  const fa = A(`articles/${slug}/index.html`), en = A(`articles/${slug}/en/index.html`);
  let s = fs.readFileSync(fa, 'utf8'); if (/پرسش‌های متداول/.test(s)) continue;
  const text = s.split('<div class="space-y-5">')[1].split('<!--srcs-->')[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const r = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: process.env.XAI_MODEL || 'grok-4.7', temperature: 0.2, response_format: { type: 'json_object' }, messages: [
      { role: 'system', content: 'You write FAQ sections for an Iranian tax consultancy. Use ONLY facts stated in the given article; add no new numbers, dates, article numbers or rates. Output JSON only.' },
      { role: 'user', content: `Article (Persian):\n${text}\n\nWrite 3 questions real Iranian taxpayers search on Google, each answered in 1–3 sentences strictly from the article. Return {"fa":[{"q","a"}],"en":[{"q","a"}]} where en is a natural English translation of fa.` }] }) });
  if (!r.ok) { console.error(slug, r.status); continue; }
  const o = JSON.parse((await r.json()).choices[0].message.content);
  s = s.replace(DISC, block('پرسش‌های متداول', o.fa) + DISC); fs.writeFileSync(fa, s);
  if (fs.existsSync(en)) { let e = fs.readFileSync(en, 'utf8'); if (!/Frequently Asked/.test(e)) { e = e.replace(DISC, block('Frequently Asked Questions', o.en) + DISC); fs.writeFileSync(en, e); } }
  console.log('FAQ added', slug, o.fa.map(x => x.q).join(' | '));
}
