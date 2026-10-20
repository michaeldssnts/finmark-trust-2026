#!/usr/bin/env node
/*
 * Compile CMS content into the single feed the Knowledge Hub page reads.
 *
 *   node scripts/build-knowledge.mjs          build once
 *   node scripts/build-knowledge.mjs --watch  rebuild whenever content changes (used by `npm run cms`)
 *
 * Reads  content/themes/*.json and content/knowledge/*.json
 * Writes knowledge-hub/knowledge.json  { built, themes[], items[] }
 * Items are sorted newest first; unpublished drafts (draft: true) are left out.
 */
import { readFileSync, writeFileSync, readdirSync, watch, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const K = join(ROOT, 'content/knowledge'), T = join(ROOT, 'content/themes'), OUT = join(ROOT, 'knowledge-hub/knowledge.json');

const readDir = d => existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.json')).map(f => {
  try { return { id: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(d, f), 'utf8')) }; }
  catch (e) { console.warn(`Skipped ${f}: ${e.message}`); return null; }
}).filter(Boolean) : [];

function build() {
  const themes = readDir(T).map(t => ({ slug: t.slug || t.id, name: t.name, status: t.status || 'current', pathway: t.pathway || 'programmes', description: t.description || '' }))
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'current' ? -1 : 1));
  const known = new Set(themes.map(t => t.slug));
  const items = readDir(K).filter(i => !i.draft && i.title).map(i => {
    const th = (i.themes || []).filter(s => known.has(s));
    const o = { id: i.id, t: i.title, d: (i.date || '').slice(0, 10), y: i.type || 'Report', th, c: i.countries || [], u: i.file || i.link || i.legacy_url || '' };
    if (i.summary) o.s = i.summary;
    if (i.language && i.language !== 'en') o.l = i.language;
    if (i.featured) o.f = 1;
    if (i.thumbnail) o.img = i.thumbnail;
    return o;
  }).sort((a, b) => (b.d || '').localeCompare(a.d || ''));
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ built: new Date().toISOString(), themes, items }));
  console.log(`knowledge.json: ${items.length} items, ${themes.length} themes`);
}

build();
if (process.argv.includes('--watch')) {
  let timer;
  const again = () => { clearTimeout(timer); timer = setTimeout(build, 300); };
  [K, T].forEach(d => { mkdirSync(d, { recursive: true }); watch(d, again); });
  console.log('Watching content/ for changes…');
}
