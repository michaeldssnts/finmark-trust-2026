#!/usr/bin/env node
/*
 * Compile CMS content into the single feed the Knowledge Hub page reads.
 *
 *   node scripts/build-knowledge.mjs          build once
 *   node scripts/build-knowledge.mjs --watch  rebuild whenever content changes (used by `npm run cms`)
 *
 * Reads  content/themes/*.json, content/programmes/*.json and content/knowledge/*.json
 * and content/settings/featured.json (what the homepage slider and the Knowledge Hub feature)
 * Writes knowledge-hub/knowledge.json  { built, themes[], programmes[], featured{}, items[] }
 * Each item carries its section (sec: data | programmes | both) and programme slugs (pg); items saved before
 * those fields existed get them worked out by scripts/classify.mjs.
 * Items are sorted newest first; unpublished drafts (draft: true) are left out.
 */
import { readFileSync, writeFileSync, readdirSync, watch, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guessSection, guessProgrammes } from './classify.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FEAT = join(ROOT, 'content/settings/featured.json');
const K = join(ROOT, 'content/knowledge'), T = join(ROOT, 'content/themes'), P = join(ROOT, 'content/programmes'), OUT = join(ROOT, 'knowledge-hub/knowledge.json');

const readDir = d => existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.json')).map(f => {
  try { return { id: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(d, f), 'utf8')) }; }
  catch (e) { console.warn(`Skipped ${f}: ${e.message}`); return null; }
}).filter(Boolean) : [];

function build() {
  const themes = readDir(T).map(t => ({ slug: t.slug || t.id, name: t.name, status: t.status || 'current', pathway: t.pathway || 'programmes', description: t.description || '' }))
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'current' ? -1 : 1));
  const known = new Set(themes.map(t => t.slug));
  const progAll = readDir(P).map(p => ({ ...p, slug: p.slug || p.id }));
  const programmes = progAll.map(p => ({ slug: p.slug, name: p.name, pathway: p.pathway || 'sadc', status: p.status || 'current', order: p.order || 99, description: p.description || '', site: p.site_url || '' }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const knownP = new Set(programmes.map(p => p.slug));
  const items = readDir(K).filter(i => !i.draft && i.title).map(i => {
    const th = (i.themes || []).filter(s => known.has(s));
    const pg = (Array.isArray(i.programmes) ? i.programmes : guessProgrammes(i, progAll)).filter(s => knownP.has(s));
    const sec = ['data', 'programmes', 'both'].includes(i.section) ? i.section : guessSection(th, themes, pg);
    const o = { id: i.id, t: i.title, d: (i.date || '').slice(0, 10), y: i.type || 'Report', th, c: i.countries || [], u: i.file || i.link || i.legacy_url || '', sec, pg };
    if (i.summary) o.s = i.summary;
    if (i.language && i.language !== 'en') o.l = i.language;
    if (i.featured) o.f = 1;
    if (i.thumbnail) o.img = i.thumbnail;
    return o;
  }).sort((a, b) => (b.d || '').localeCompare(a.d || ''));
  // Featured picks from the content manager; unknown or draft items are dropped. Empty lists mean "use the newest".
  let picks = {};
  try { picks = existsSync(FEAT) ? JSON.parse(readFileSync(FEAT, 'utf8')) : {}; } catch (e) { console.warn(`Skipped featured.json: ${e.message}`); }
  const ids = new Set(items.map(i => i.id));
  const pick = k => (Array.isArray(picks[k]) ? picks[k] : []).filter(id => ids.has(id));
  const featured = { home_data: pick('home_data').slice(0, 2), home_programmes: pick('home_programmes').slice(0, 2), hub: pick('hub').slice(0, 3) };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ built: new Date().toISOString(), themes, programmes, featured, items }));
  console.log(`knowledge.json: ${items.length} items, ${themes.length} themes, ${programmes.length} programmes`);
}

build();
if (process.argv.includes('--watch')) {
  let timer;
  const again = () => { clearTimeout(timer); timer = setTimeout(build, 300); };
  [K, T, P, dirname(FEAT)].forEach(d => { mkdirSync(d, { recursive: true }); watch(d, again); });
  console.log('Watching content/ for changes…');
}
