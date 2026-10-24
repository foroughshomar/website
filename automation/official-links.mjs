// Curated whitelist of official Iranian sources. Articles may only link to these URLs.
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const OFFICIAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'automation/official-links.json'), 'utf8')).links;
export const isOfficial = u => OFFICIAL.some(l => l.url === u || l.url === u + '/');
// pick 2–4 links relevant to the text (topic-specific first, then general)
export function pickLinks(text, min = 2, max = 4) {
  const score = l => l.tags.includes('*') ? 0.5 : l.tags.filter(t => text.includes(t)).length;
  const r = OFFICIAL.map(l => ({ l, s: score(l) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.l);
  const spec = r.filter(l => !l.tags.includes('*')), gen = r.filter(l => l.tags.includes('*'));
  const out = [...spec.slice(0, max - 1)]; for (const g of gen) if (out.length < Math.max(min, Math.min(max, out.length + 1))) out.push(g);
  while (out.length < min && gen.length) out.push(gen[out.length % gen.length]);
  return [...new Set(out)].slice(0, max);
}
