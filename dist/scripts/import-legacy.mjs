#!/usr/bin/env node
/*
 * One-off migration: legacy Knowledge Hub export → Decap CMS content files.
 *
 *   node scripts/import-legacy.mjs --in legacy/hub-inventory.json [--clean]
 *
 * Input: JSON array (or { items: [...] }) of legacy items with
 *   { title, date_iso | date, type, tags[], countries[], url, summary? }
 * Output:
 *   content/themes/<slug>.json        one file per theme (from scripts/theme-map.json)
 *   content/knowledge/<date>-<slug>.json  one file per item
 *   legacy/migration-report.csv       every item with what was changed and what needs review
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const input = arg('--in', join(ROOT, 'legacy/hub-inventory.json'));
const OUT_K = join(ROOT, 'content/knowledge');
const OUT_T = join(ROOT, 'content/themes');

const MAP = JSON.parse(readFileSync(join(ROOT, 'scripts/theme-map.json'), 'utf8'));
const raw = JSON.parse(readFileSync(input, 'utf8'));
const items = Array.isArray(raw) ? raw : raw.items;

if (args.includes('--clean')) { rmSync(OUT_K, { recursive: true, force: true }); rmSync(OUT_T, { recursive: true, force: true }); }
mkdirSync(OUT_K, { recursive: true }); mkdirSync(OUT_T, { recursive: true }); mkdirSync(join(ROOT, 'legacy'), { recursive: true });

const COUNTRIES = {
  'Angola': 'AGO', 'Botswana': 'BWA', 'Comoros': 'COM', 'Democratic Republic of the Congo': 'COD', 'DRC': 'COD', 'Eswatini': 'SWZ', 'Swaziland': 'SWZ',
  'Lesotho': 'LSO', 'Madagascar': 'MDG', 'Malawi': 'MWI', 'Mauritius': 'MUS', 'Mozambique': 'MOZ', 'Namibia': 'NAM', 'Seychelles': 'SYC',
  'South Africa': 'ZAF', 'Tanzania': 'TZA', 'Zambia': 'ZMB', 'Zimbabwe': 'ZWE', 'SADC': 'SADC',
  'Togo': 'TGO', 'Nigeria': 'NGA', 'Cameroon': 'CMR', 'Cambodia': 'KHM', 'Burkina Faso': 'BFA', 'Rwanda': 'RWA', 'Uganda': 'UGA', 'Laos': 'LAO',
  'Kenya': 'KEN', 'Benin': 'BEN', 'Ghana': 'GHA', 'Myanmar': 'MMR', 'Thailand': 'THA', 'Gambia': 'GMB', 'Mexico': 'MEX', 'Haiti': 'HTI', 'Nepal': 'NPL'
};
const legacyToTheme = {};
MAP.themes.forEach(t => (t.legacy || []).forEach(l => { legacyToTheme[l.toLowerCase()] = t.slug; }));

const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70).replace(/-[^-]*$/, m => (m.length < 3 ? '' : m));
const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
function isoDate(it) {
  if (it.date_iso && /^\d{4}-\d{2}-\d{2}$/.test(it.date_iso)) return it.date_iso;
  const m = String(it.date || '').match(/(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})/);
  return m ? `${m[3]}-${MONTHS[m[2].toLowerCase()]}-${m[1].padStart(2, '0')}` : null;
}
function contentType(it, title, url) {
  const t = title.toLowerCase();
  if (/youtu\.?be|vimeo/.test(url)) return 'Video';
  if (/media release|press release/.test(t)) return 'Media release';
  if ((it.type || '') === 'Publications') {
    if (/presentation|launch deck|slides|webinar/.test(t)) return 'Presentation';
    if (/pocket ?guide|highlights|brochure|by numbers|factsheet|fact sheet/.test(t)) return 'Pocket guide';
    if (/dashboard/.test(t)) return 'Dashboard';
  }
  return MAP.types[it.type] || 'Report';
}
function language(title) {
  if (/\b(relatório|papel|mulheres|inquérito|remessas|português|portuguese)\b/i.test(title)) return 'pt';
  if (/\b(rapport|français|french|l'inclusion|financière)\b/i.test(title)) return 'fr';
  return 'en';
}
function suggestThemes(title) {
  const t = ' ' + title.toLowerCase() + ' ', hits = [];
  for (const th of MAP.themes) {
    if ((th.keywords || []).some(k => t.includes(k))) hits.push(th.slug);
    if (hits.length === 2) break;
  }
  if (!hits.length && t.includes('finscope')) hits.push(/msme|small business/.test(t) ? 'finscope-msme' : 'finscope-consumer');
  return hits;
}

// Themes
for (const t of MAP.themes) {
  writeFileSync(join(OUT_T, `${t.slug}.json`), JSON.stringify({ name: t.name, slug: t.slug, status: t.status, pathway: t.pathway, description: t.description, legacy_labels: t.legacy }, null, 2) + '\n');
}

// Items
const seenUrl = new Map(), seenTitle = new Map(), used = new Set(), report = [];
const csv = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
let written = 0;
for (const it of items) {
  const title = String(it.title || '').replace(/\s+/g, ' ').trim();
  let url = String(it.url || '').trim();
  const notes = [];
  if (!title) { report.push([title, '', '', 'skipped', 'no title']); continue; }
  if (url.startsWith('http://')) { url = 'https://' + url.slice(7); notes.push('http→https'); }
  url = url.replace('://www.finmark.org.za', '://finmark.org.za').replace(/ /g, '%20');
  const key = url.replace(/[?#].*$/, '').toLowerCase(), tkey = title.toLowerCase();
  if (url && seenUrl.has(key)) { report.push([title, it.date, url, 'duplicate', `same file as "${seenUrl.get(key)}"`]); continue; }
  if (seenTitle.has(tkey)) notes.push('possible duplicate title');
  if (url) seenUrl.set(key, title); seenTitle.set(tkey, 1);

  const date = isoDate(it);
  if (!date) notes.push('missing date');
  const legacyTags = (it.tags || []).filter(x => !MAP.dropTags.includes(x));
  let themes = [...new Set(legacyTags.map(x => legacyToTheme[x.toLowerCase()]).filter(Boolean))];
  let source = 'legacy tags';
  if (!themes.length) { themes = suggestThemes(title); source = themes.length ? 'auto-suggested' : 'none'; }
  const unmapped = legacyTags.filter(x => !legacyToTheme[x.toLowerCase()]);
  if (unmapped.length) notes.push('unmapped tags: ' + unmapped.join('; '));
  const countries = [...new Set((it.countries || []).map(c => COUNTRIES[String(c).replace(/\s*\|\s*$/, '').trim()]).filter(Boolean))];
  const type = contentType(it, title, url);
  const isFile = /\.(pdf|zip|xlsx?|docx?|pptx?)(\?|$)/i.test(url);

  let slug = `${date || 'undated'}-${slugify(title)}`; let n = 2;
  while (used.has(slug)) slug = `${date || 'undated'}-${slugify(title)}-${n++}`;
  used.add(slug);

  const entry = {
    title, date: date || '', type, summary: it.summary || '',
    themes, countries, language: language(title),
    file: isFile ? url : '', link: isFile ? '' : url,
    featured: false, review: source !== 'legacy tags', legacy_url: url, legacy_type: it.type || ''
  };
  writeFileSync(join(OUT_K, `${slug}.json`), JSON.stringify(entry, null, 2) + '\n');
  written++;
  report.push([title, date, url, source === 'legacy tags' ? 'imported' : 'imported, needs review', [`themes ${source}: ${themes.join(', ') || '—'}`, ...notes].join(' | ')]);
}
writeFileSync(join(ROOT, 'legacy/migration-report.csv'), 'title,date,legacy_url,status,notes\n' + report.map(r => r.map(csv).join(',')).join('\n') + '\n');
const review = report.filter(r => r[3].includes('review')).length, dup = report.filter(r => r[3] === 'duplicate').length;
console.log(`Imported ${written} items (${review} need theme review, ${dup} duplicates skipped) and ${MAP.themes.length} themes.`);
console.log('Report: legacy/migration-report.csv');
