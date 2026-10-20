/*
 * Shared rules for the two "where does this belong" fields on a Knowledge Hub item:
 *   section    'data' | 'programmes' | 'both'
 *   programmes  programme slugs from content/programmes/
 * Used by the importer and the one-off backfill, and by the build as a fallback for items that have no value yet.
 * An editor's choice in the content manager always wins: these rules only fill gaps.
 */
export function guessSection(themeSlugs, themes, programmeSlugs = []) {
  const byslug = Object.fromEntries(themes.map(t => [t.slug, t]));
  const paths = new Set(themeSlugs.map(s => byslug[s] && byslug[s].pathway).filter(Boolean));
  if (programmeSlugs.length) paths.add('programmes');
  if (paths.has('data') && paths.has('programmes')) return 'both';
  return paths.has('data') ? 'data' : 'programmes';
}

export function guessProgrammes(item, programmes) {
  const text = ' ' + [item.title, item.summary].filter(Boolean).join(' ').toLowerCase() + ' ';
  const th = new Set(item.themes || []);
  const out = [];
  for (const p of programmes) {
    if (p.status === 'archived') continue;
    const kwHit = (p.keywords || []).some(k => text.includes(k.toLowerCase()));
    // A programme's own theme is enough on its own, except for broad themes that several programmes share.
    const themeHit = p.theme && th.has(p.theme) && !['sadc', 'policy-regulation'].includes(p.theme);
    if (themeHit || kwHit) out.push(p.slug);
  }
  // "Policy and regulation" programme: theme match unless the item is clearly about inclusion strategies.
  if (th.has('policy-regulation') && !out.includes('fi-strategies')) out.push('policy-regulation');
  return [...new Set(out)].slice(0, 3);
}
