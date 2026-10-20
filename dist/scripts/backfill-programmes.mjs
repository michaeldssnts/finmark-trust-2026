#!/usr/bin/env node
/*
 * One-off: give every existing Knowledge Hub item a Section (data / programmes / both) and, where it can be
 * worked out, its Programme(s). Items that get a programme suggestion are flagged "Needs editor review".
 * Items that already have a section are left alone, so it is safe to run again.
 *
 *   node scripts/backfill-programmes.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guessSection, guessProgrammes } from './classify.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = d => readdirSync(join(ROOT, d)).filter(f => f.endsWith('.json')).map(f => ({ f, ...JSON.parse(readFileSync(join(ROOT, d, f), 'utf8')) }));
const themes = read('content/themes').map(t => ({ slug: t.slug || t.f.replace('.json', ''), pathway: t.pathway }));
const programmes = read('content/programmes');

let changed = 0, flagged = 0;
for (const it of read('content/knowledge')) {
  if (it.section) continue;
  const { f, ...item } = it;
  const pg = guessProgrammes(item, programmes);
  item.section = guessSection(item.themes || [], themes, pg);
  item.programmes = pg;
  if (pg.length && !item.review) { item.review = true; flagged++; }
  writeFileSync(join(ROOT, 'content/knowledge', f), JSON.stringify(item, null, 2) + '\n');
  changed++;
}
console.log(`Backfilled ${changed} items (${flagged} newly flagged for review).`);
