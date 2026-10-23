// Builds articles/index.json from the article cards in articles/index.html (newest first).
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = p => path.join(ROOT, p);
const unesc = s => s.replace(/<!-- -->/g, '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').trim();
export function buildIndex() {
  const html = fs.readFileSync(A('articles/index.html'), 'utf8');
  const used = fs.existsSync(A('automation/used.json')) ? JSON.parse(fs.readFileSync(A('automation/used.json'), 'utf8')) : [];
  const seen = new Set(); const items = [];
  const re = /<a class="block" href="\/articles\/([a-z0-9-]+)">([\s\S]*?)<\/article>/g;
  for (const m of html.matchAll(re)) {
    const slug = m[1], c = m[2]; if (seen.has(slug)) continue; seen.add(slug);
    const meta = unesc((c.match(/<p class="text-xs text-saffron">([\s\S]*?)<\/p>/) || [])[1] || '');
    const [category, date] = meta.includes('·') ? meta.split('·').map(s => s.trim()) : ['', meta];
    const u = used.find(x => x.slug === slug);
    items.push({ slug, url: `https://foroughshomar.ir/articles/${slug}`,
      title: unesc((c.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || slug),
      category, date_fa: date, published_at: u ? u.date : null,
      excerpt: unesc((c.match(/<p class="mt-4[^"]*">([\s\S]*?)<\/p>/) || [])[1] || ''),
      image: (c.match(/<img src="([^"]+)"/) || [])[1] || null });
  }
  const key = d => { const m = String(d).replace(/[۰-۹]/g, x => '۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).match(/(\d+)-(\d+)-(\d+)/); return m ? m[3] + m[2] + m[1] : ''; };
  items.sort((a, b) => key(b.date_fa).localeCompare(key(a.date_fa)) || String(b.published_at || '').localeCompare(String(a.published_at || '')));
  fs.writeFileSync(A('articles/index.json'), JSON.stringify({ updated: new Date().toISOString(), count: items.length, articles: items }, null, 1));
  return items.length;
}
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) console.log('index.json articles:', buildIndex());
