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
 * Blogs and articles with a full text (body) also get their own page: knowledge-hub/posts/<id>.json is written for
 * knowledge-hub/post.html?id=<id> to render, and the feed marks them with p: 1 so cards open that page.
 */
import { readFileSync, writeFileSync, readdirSync, watch, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guessSection, guessProgrammes } from './classify.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FEAT = join(ROOT, 'content/settings/featured.json');
const K = join(ROOT, 'content/knowledge'), T = join(ROOT, 'content/themes'), P = join(ROOT, 'content/programmes'), PE = join(ROOT, 'content/people'), OUT = join(ROOT, 'knowledge-hub/knowledge.json'), POSTS = join(ROOT, 'knowledge-hub/posts');

// Small Markdown renderer for post bodies: ## / ### headings, paragraphs, - and 1. lists, > quotes, **bold**, *italic*, [links](url), line breaks.
const escH = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => escH(s)
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u.replace(/"/g, '%22')}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>')
  .replace(/ {2,}\n/g, '<br>\n');
function md(src) {
  const out = []; let list = null, para = [], quote = [];
  const flushP = () => { if (para.length) out.push(`<p>${inline(para.join('\n'))}</p>`); para = []; };
  const flushL = () => { if (list) out.push(`<${list.t}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.t}>`); list = null; };
  const flushQ = () => { if (quote.length) out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`); quote = []; };
  for (const raw of String(src || '').replace(/\r/g, '').split('\n')) {
    const line = raw.replace(/\s+$/, m => (m.length >= 2 && !m.includes('\n') ? '  ' : ''));
    let m;
    if (!line.trim()) { flushP(); flushL(); flushQ(); continue; }
    if ((m = line.match(/^(#{2,4})\s+(.*)/))) { flushP(); flushL(); flushQ(); const n = Math.min(m[1].length, 3); out.push(`<h${n}>${inline(m[2])}</h${n}>`); continue; }
    if ((m = line.match(/^\s*[-*]\s+(.*)/)) || (m = line.match(/^\s*\d+[.)]\s+(.*)/))) { flushP(); flushQ(); const t = /^\s*\d/.test(line) ? 'ol' : 'ul'; if (!list || list.t !== t) { flushL(); list = { t, items: [] }; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^>\s?(.*)/))) { flushP(); flushL(); quote.push(m[1]); continue; }
    if (list) flushL();
    para.push(line);
  }
  flushP(); flushL(); flushQ();
  return out.join('\n');
}
const words = s => (String(s || '').match(/\S+/g) || []).length;

const readDir = d => existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.json')).map(f => {
  try { return { id: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(d, f), 'utf8')) }; }
  catch (e) { console.warn(`Skipped ${f}: ${e.message}`); return null; }
}).filter(Boolean) : [];

function build() {
  const themes = readDir(T).map(t => ({ slug: t.slug || t.id, name: t.name, status: t.status || 'current', pathway: t.pathway || 'programmes', colour: t.status === 'archived' ? '#8a94a6' : (/^#[0-9a-f]{6}$/i.test(t.colour || '') ? t.colour : (t.pathway === 'data' ? '#0098ae' : '#00997b')), description: t.description || '' }))
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'current' ? -1 : 1));
  const known = new Set(themes.map(t => t.slug));
  const progAll = readDir(P).map(p => ({ ...p, slug: p.slug || p.id }));
  const programmes = progAll.map(p => ({ slug: p.slug, name: p.name, pathway: p.pathway || 'sadc', status: p.status || 'current', order: p.order || 99, description: p.description || '', site: p.site_url || '', theme: p.theme || '' }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const knownP = new Set(programmes.map(p => p.slug));
  const people = readDir(PE).map(p => ({ slug: p.slug || p.id, name: p.name, role: p.role || '', group: p.group || 'team', order: p.order || 99, photo: p.photo || '', bio: p.bio || '', email: p.email || '', linkedin: p.linkedin || '', ...(p.hidden ? { hidden: 1 } : {}) }))
    .sort((a, b) => (a.group === b.group ? a.order - b.order || a.name.localeCompare(b.name) : a.group === 'team' ? -1 : 1));
  const PEOPLE = Object.fromEntries(people.map(p => [p.slug, p]));
  const items = readDir(K).filter(i => !i.draft && i.title).map(i => {
    const th = (i.themes || []).filter(s => known.has(s));
    const pg = (Array.isArray(i.programmes) ? i.programmes : guessProgrammes(i, progAll)).filter(s => knownP.has(s));
    const sec = ['data', 'programmes', 'both'].includes(i.section) ? i.section : guessSection(th, themes, pg);
    const o = { id: i.id, t: i.title, d: (i.date || '').slice(0, 10), y: i.type || 'Report', th, c: i.countries || [], u: i.file || i.link || i.legacy_url || '', sec, pg };
    if (i.summary) o.s = i.summary;
    if (i.language && i.language !== 'en') o.l = i.language;
    if (i.featured) o.f = 1;
    if (i.thumbnail) o.img = i.thumbnail;
    const au = (Array.isArray(i.authors) ? i.authors : []).filter(s => PEOPLE[s]);
    if (au.length) o.au = au;
    if (i.author) o.a = i.author;
    if (i.body && String(i.body).trim()) { o.p = 1; o._body = i.body; }
    return o;
  }).sort((a, b) => (b.d || '').localeCompare(a.d || ''));
  // Featured picks from the content manager; unknown or draft items are dropped. Empty lists mean "use the newest".
  let picks = {};
  try { picks = existsSync(FEAT) ? JSON.parse(readFileSync(FEAT, 'utf8')) : {}; } catch (e) { console.warn(`Skipped featured.json: ${e.message}`); }
  const ids = new Set(items.map(i => i.id));
  const pick = k => (Array.isArray(picks[k]) ? picks[k] : []).filter(id => ids.has(id));
  const featured = { home_data: pick('home_data').slice(0, 2), home_programmes: pick('home_programmes').slice(0, 2), hub: pick('hub').slice(0, 3) };
  mkdirSync(dirname(OUT), { recursive: true });
  // One JSON file per blog/article page
  rmSync(POSTS, { recursive: true, force: true }); mkdirSync(POSTS, { recursive: true });
  let posts = 0;
  for (const it of items) {
    if (!it._body) continue;
    const { _body, ...meta } = it;
    const authors = (it.au || []).map(s => ({ slug: s, name: PEOPLE[s].name, role: PEOPLE[s].role, photo: PEOPLE[s].photo }));
    writeFileSync(join(POSTS, `${it.id}.json`), JSON.stringify({ ...meta, authors, html: md(_body), mins: Math.max(1, Math.round(words(_body) / 220)) }));
    delete it._body; posts++;
  }
  writeFileSync(OUT, JSON.stringify({ built: new Date().toISOString(), themes, programmes, people, featured, items }));
  console.log(`knowledge.json: ${items.length} items, ${themes.length} themes, ${programmes.length} programmes, ${people.length} people, ${posts} post pages`);
}

build();
if (process.argv.includes('--watch')) {
  let timer;
  const again = () => { clearTimeout(timer); timer = setTimeout(build, 300); };
  [K, T, P, PE, dirname(FEAT)].forEach(d => { mkdirSync(d, { recursive: true }); watch(d, again); });
  console.log('Watching content/ for changes…');
}
