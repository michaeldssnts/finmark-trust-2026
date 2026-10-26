// Files uploaded through the CMS are stored as /uploads/...; resolve them relative to this page so the prototype works from any folder.
function asset(p){return p&&p.startsWith('/uploads/')?'..'+p:p}
/* Knowledge Hub: loads knowledge.json (built from the CMS) and filters it in the browser. */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PAGE = 24;
  const PLACES = { AGO: 'Angola', BWA: 'Botswana', COM: 'Comoros', COD: 'DR Congo', SWZ: 'Eswatini', LSO: 'Lesotho', MDG: 'Madagascar', MWI: 'Malawi', MUS: 'Mauritius', MOZ: 'Mozambique', NAM: 'Namibia', SYC: 'Seychelles', ZAF: 'South Africa', TZA: 'Tanzania', ZMB: 'Zambia', ZWE: 'Zimbabwe', SADC: 'SADC region',
    BEN: 'Benin', BFA: 'Burkina Faso', KHM: 'Cambodia', CMR: 'Cameroon', GMB: 'Gambia', GHA: 'Ghana', HTI: 'Haiti', KEN: 'Kenya', LAO: 'Laos', MEX: 'Mexico', MMR: 'Myanmar', NPL: 'Nepal', NGA: 'Nigeria', RWA: 'Rwanda', THA: 'Thailand', TGO: 'Togo', UGA: 'Uganda' };
  const SADC = ['AGO', 'BWA', 'COM', 'COD', 'SWZ', 'LSO', 'MDG', 'MWI', 'MUS', 'MOZ', 'NAM', 'SYC', 'ZAF', 'TZA', 'ZMB', 'ZWE', 'SADC'];
  const LANGS = { en: 'English', pt: 'Portuguese', fr: 'French' };
  const TYPE_LOOK = {
    Report: ['#213265', '▤'], 'Pocket guide': ['#0098ae', '▭'], Presentation: ['#2b4a8a', '▷'], Dashboard: ['#00997b', '▥'],
    Article: ['#0d6f80', '¶'], Blog: ['#00806a', '✎'], 'Media release': ['#142044', '❝'], Video: ['#0a7f93', '▶'],
    Podcast: ['#1b5e74', '◉'], Interview: ['#00997b', '❞'], Infographic: ['#b9801a', '◔']
  };
  const TYPE_ORDER = Object.keys(TYPE_LOOK);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = d => { const [y, m, dd] = (d || '').split('-'); return y ? `${+dd} ${MONTHS[+m - 1]} ${y}` : 'Undated'; };

  const S = { q: '', path: '', prog: '', themes: new Set(), types: new Set(), country: '', from: '', to: '', langs: new Set(), archived: false, sort: 'new', view: 'grid', shown: PAGE };
  let THEMES = [], TH = {}, ITEMS = [], PROGS = [], PG = {}, FEATURED = {};

  // ---------- URL state (works on the live site; ignored where query strings are unavailable) ----------
  function readUrl() {
    try {
      const p = new URLSearchParams(location.search);
      S.q = p.get('q') || ''; S.path = p.get('pathway') || p.get('section') || ''; S.prog = p.get('programme') || ''; S.country = p.get('country') || '';
      S.from = p.get('from') || ''; S.to = p.get('to') || ''; S.archived = p.get('archived') === '1'; S.sort = p.get('sort') || 'new';
      (p.get('theme') || '').split(',').filter(Boolean).forEach(t => S.themes.add(t));
      (p.get('type') || '').split(',').filter(Boolean).forEach(t => S.types.add(t));
      (p.get('lang') || '').split(',').filter(Boolean).forEach(t => S.langs.add(t));
      // Addresses from the old website: /search?tag_term=…, /search?locations[]=…, and /knowledge-hub/<type>/<old-slug>
      const tag = p.get('tag_term') || p.get('tag') || '';
      if (tag) { const th = THEMES.find(t => (t.lt || []).includes(tag) || t.slug === tag); if (th) S.themes.add(th.slug); else S.q = tag.replace(/-/g, ' '); }
      const loc = p.get('locations[]') || ''; if (loc && !S.country) S.country = loc;
      if (S.q && !/\s/.test(S.q) && (S.q.match(/-/g) || []).length >= 2) { S.q = S.q.replace(/-/g, ' '); S.loose = true; if (!p.get('sort')) S.sort = 'rel'; }
      if ([...S.themes].some(t => TH[t] && TH[t].status === 'archived')) S.archived = true;
    } catch (e) {}
  }
  function writeUrl() {
    try {
      const p = new URLSearchParams();
      if (S.q) p.set('q', S.q); if (S.path) p.set('section', S.path); if (S.prog) p.set('programme', S.prog); if (S.themes.size) p.set('theme', [...S.themes].join(','));
      if (S.types.size) p.set('type', [...S.types].join(',')); if (S.country) p.set('country', S.country);
      if (S.from) p.set('from', S.from); if (S.to) p.set('to', S.to); if (S.langs.size) p.set('lang', [...S.langs].join(','));
      if (S.archived) p.set('archived', '1'); if (S.sort !== 'new') p.set('sort', S.sort);
      const qs = p.toString(); history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    } catch (e) {}
  }

  // ---------- Search ----------
  const norm = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  function prep(it) {
    it.year = it.d ? it.d.slice(0, 4) : '';
    it.isArch = !!it.ar || (it.th.length > 0 && it.th.every(s => TH[s] && TH[s].status === 'archived'));
    // Section comes from the item itself (set in the content manager); older feeds fall back to the themes' pathway.
    it.pg = it.pg || [];
    it.paths = it.sec ? new Set(it.sec === 'both' ? ['data', 'programmes'] : [it.sec]) : new Set(it.th.map(s => TH[s] && TH[s].pathway).filter(Boolean));
    it.hay = norm([it.t, it.s || '', it.y, it.year, ...it.th.map(s => TH[s] ? TH[s].name : ''), ...it.c.map(c => PLACES[c] || c), ...it.pg.map(s => PG[s] ? PG[s].name : ''), ...(it.tg || [])].join(' '));
    it.titleN = norm(it.t);
  }
  const terms = () => norm(S.q).split(/\s+/).filter(t => t.length > 1);
  // Loose mode (old-site addresses turned into a search): words don't all have to match; at least half must.
  const STOPW = new Set('a an and the of in on for to with from by at is are as or its it be our we how why what new'.split(' '));
  function score(it, ts) {
    if (S.loose) { const k = ts.filter(t => !STOPW.has(t)); let s = 0, hit = 0; for (const t of k) { if (it.hay.includes(t)) { hit++; s += it.titleN.includes(t) ? 3 : 1; } } return hit >= Math.max(1, Math.ceil(k.length / 2)) ? s : -1; }
    let s = 0; for (const t of ts) { if (!it.hay.includes(t)) return -1; s += it.titleN.includes(t) ? 3 : 1; } return s;
  }

  // ---------- Filtering with facet counts ----------
  // 'SADC' is the regional view: work covering the SADC region as a whole, or tagged with the SADC theme (same as the old site's locations[]=SADC).
  const inPlace = (it, c) => c === 'SADC' ? (it.c.includes('SADC') || it.th.includes('sadc')) : it.c.includes(c);
  function passes(it, skip, ts) {
    if (!S.archived && it.isArch) return false;
    if (skip !== 'path' && S.path && !it.paths.has(S.path)) return false;
    if (skip !== 'prog' && S.prog && !it.pg.includes(S.prog)) return false;
    if (skip !== 'themes' && S.themes.size && !it.th.some(t => S.themes.has(t))) return false;
    if (skip !== 'types' && S.types.size && !S.types.has(it.y)) return false;
    if (skip !== 'country' && S.country && !(S.country === 'SADC-ALL' ? it.c.some(c => SADC.includes(c)) : inPlace(it, S.country))) return false;
    if (skip !== 'year' && S.from && (!it.year || it.year < S.from)) return false;
    if (skip !== 'year' && S.to && (!it.year || it.year > S.to)) return false;
    if (skip !== 'langs' && S.langs.size && !S.langs.has(it.l || 'en')) return false;
    if (ts.length && score(it, ts) < 0) return false;
    return true;
  }
  function count(skip, keyFn) {
    const ts = terms(), m = new Map();
    for (const it of ITEMS) if (passes(it, skip, ts)) for (const k of keyFn(it)) m.set(k, (m.get(k) || 0) + 1);
    return m;
  }

  // ---------- Rendering: filters ----------
  function check(name, value, label, n, on, colour) {
    return `<label class="kh-check${n ? '' : ' zero'}"${colour ? ` style="--tc:${colour}"` : ''}><input type="checkbox" name="${name}" value="${esc(value)}"${on ? ' checked' : ''}>${colour ? '<i class="sw" aria-hidden="true"></i>' : ''}<span>${esc(label)}</span><small>${n || 0}</small></label>`;
  }
  function renderFilters() {
    const pc = count('path', it => [...it.paths, 'all']);
    $('fPath').innerHTML = `<div class="kh-radio">${[['', 'All'], ['data', 'Data'], ['programmes', 'Programmes']].map(([v, l]) =>
      `<label><input type="radio" name="path" value="${v}"${S.path === v ? ' checked' : ''}><span>${l}${v ? ` <small style="font-weight:600;opacity:.7">${pc.get(v) || 0}</small>` : ''}</span></label>`).join('')}</div>`;
    const tc = count('themes', it => it.th);
    const cur = THEMES.filter(t => t.status === 'current'), arc = THEMES.filter(t => t.status === 'archived');
    $('fThemes').innerHTML = cur.map(t => check('theme', t.slug, t.name, tc.get(t.slug), S.themes.has(t.slug), t.colour)).join('');
    $('fThemesArchived').innerHTML = arc.map(t => check('theme', t.slug, t.name, tc.get(t.slug), S.themes.has(t.slug), t.colour)).join('');
    $('fThemesArchived').hidden = !S.archived; $('fArchived').checked = S.archived;
    $('fArchivedN').textContent = `${ITEMS.filter(i => i.isArch).length}`;
    const yc = count('types', it => [it.y]);
    $('fTypes').innerHTML = TYPE_ORDER.filter(t => ITEMS.some(i => i.y === t)).map(t => check('type', t, t, yc.get(t), S.types.has(t))).join('');
    const cc = count('country', it => it.c);
    const regN = count('country', it => (inPlace(it, 'SADC') ? ['x'] : [])).get('x') || 0;
    const sadcN = count('country', it => (it.c.some(c => SADC.includes(c)) ? ['x'] : [])).get('x') || 0;
    const opt = (v, l, n) => `<option value="${v}"${S.country === v ? ' selected' : ''}>${esc(l)}${n !== undefined ? ` (${n})` : ''}</option>`;
    const others = Object.keys(PLACES).filter(c => !SADC.includes(c) && cc.get(c)).sort((a, b) => PLACES[a].localeCompare(PLACES[b]));
    $('fCountry').innerHTML = opt('', 'All countries') + opt('SADC', 'SADC – regional view', regN) + opt('SADC-ALL', 'Any SADC country', sadcN)
      + `<optgroup label="SADC">${SADC.filter(c => c !== 'SADC' && (cc.get(c) || S.country === c)).sort((a, b) => PLACES[a].localeCompare(PLACES[b])).map(c => opt(c, PLACES[c], cc.get(c) || 0)).join('')}</optgroup>`
      + (others.length ? `<optgroup label="Beyond SADC">${others.map(c => opt(c, PLACES[c], cc.get(c))).join('')}</optgroup>` : '');
    const prc = count('prog', it => it.pg);
    const popt = p => `<option value="${esc(p.slug)}"${S.prog === p.slug ? ' selected' : ''}>${esc(p.name)} (${prc.get(p.slug) || 0})</option>`;
    const GROUPS = [['sadc', 'SADC region'], ['za', 'South Africa'], ['cross', 'Cross-cutting']];
    $('fProgramme').innerHTML = `<option value="">All programmes</option>` + GROUPS.map(([k, l]) => {
      const list = PROGS.filter(p => p.pathway === k && p.status !== 'archived' && (prc.get(p.slug) || S.prog === p.slug));
      return list.length ? `<optgroup label="${l}">${list.map(popt).join('')}</optgroup>` : '';
    }).join('') + (PROGS.some(p => p.status === 'archived' && prc.get(p.slug)) ? `<optgroup label="Past programmes">${PROGS.filter(p => p.status === 'archived' && prc.get(p.slug)).map(popt).join('')}</optgroup>` : '');
    const years = [...new Set(ITEMS.map(i => i.year).filter(Boolean))].sort().reverse();
    $('fFrom').innerHTML = `<option value="">Any</option>` + years.slice().reverse().map(y => `<option${S.from === y ? ' selected' : ''}>${y}</option>`).join('');
    $('fTo').innerHTML = `<option value="">Any</option>` + years.map(y => `<option${S.to === y ? ' selected' : ''}>${y}</option>`).join('');
    const lc = count('langs', it => [it.l || 'en']);
    $('fLang').innerHTML = Object.entries(LANGS).filter(([k]) => ITEMS.some(i => (i.l || 'en') === k)).map(([k, l]) => check('lang', k, l, lc.get(k), S.langs.has(k))).join('');
    const n = (S.path ? 1 : 0) + (S.prog ? 1 : 0) + S.themes.size + S.types.size + (S.country ? 1 : 0) + (S.from || S.to ? 1 : 0) + S.langs.size;
    $('khFilterCount').textContent = n || '';
  }

  function renderRail() {
    const all = new Map(); ITEMS.forEach(i => i.th.forEach(t => all.set(t, (all.get(t) || 0) + 1)));
    const reg = ITEMS.filter(i => !i.isArch && inPlace(i, 'SADC')).length;
    $('khThemeRail').innerHTML = `<button type="button" class="kh-tile region" data-region="SADC" aria-pressed="${S.country === 'SADC'}" title="Southern African Development Community"><i aria-hidden="true"></i>SADC region <small>${reg}</small></button>` + THEMES.filter(t => t.status === 'current').sort((a, b) => (all.get(b.slug) || 0) - (all.get(a.slug) || 0))
      .map(t => `<button type="button" class="kh-tile ${t.pathway}" style="--tc:${t.colour}" data-theme="${t.slug}" aria-pressed="${S.themes.has(t.slug) && S.themes.size === 1}"><i aria-hidden="true"></i>${esc(t.name)} <small>${all.get(t.slug) || 0}</small></button>`).join('');
  }

  // ---------- Rendering: results ----------
  function hl(text, ts) {
    let out = esc(text);
    ts.forEach(t => { if (t.length < 3) return; out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
    return out;
  }
  function card(it, ts, featured) {
    const [col, ic] = TYPE_LOOK[it.y] || TYPE_LOOK.Report;
    const ext = /^https?:/.test(it.u) && !/^https?:\/\/(www\.)?finmark\.org\.za/.test(it.u);
    const themes = it.th.slice(0, 2).map(s => TH[s] ? `<span class="kh-tag th ${TH[s].status === 'archived' ? 'archived' : TH[s].pathway}" style="--tc:${TH[s].colour}">${esc(TH[s].name)}</span>` : '').join('');
    const places = it.c.filter(c => c !== 'SADC').slice(0, 2).map(c => `<span class="kh-tag place">${esc(PLACES[c] || c)}</span>`).join('') + (it.c.length > 3 ? `<span class="kh-tag place">+${it.c.length - 2}</span>` : '');
    // Blogs and articles with full text open their own page on this site
    const tag = it.p || it.u ? 'a' : 'div';
    const attrs = it.p ? ` href="${typeof it.p === 'string' ? it.p + '/' : 'post.html?id=' + encodeURIComponent(it.id)}"` : it.u ? ` href="${esc(asset(it.u))}"${ext || /\.pdf/i.test(it.u) ? ' target="_blank" rel="noopener"' : ''}` : '';
    const tc = it.th.map(s => TH[s]).find(Boolean);
    return `<${tag} class="kh-card${featured ? ' kh-feat' : ''}${tc ? ' has-tc' : ''}"${tc ? ` style="--tc:${tc.colour}"` : ''}${attrs}>
      <span class="kh-cover${it.isArch ? ' pt-arch' : ''}${it.img ? ' has-img' : ''}" style="--c:${col};background:${col}" aria-hidden="true">${it.img ? `<img class="bg" src="${esc(asset(it.img))}" alt="" loading="lazy"><img class="fg" src="${esc(asset(it.img))}" alt="" loading="lazy">` : ''}<span class="t">${esc(it.y)}</span><span class="ic">${ic}</span><span class="yr">${it.year}</span></span>
      <span class="kh-cbody"><span class="kh-meta"><span>${esc(it.y)}</span><span>${fmtDate(it.d)}</span>${it.l && it.l !== 'en' ? `<span class="lang">${LANGS[it.l]}</span>` : ''}${it.isArch ? '<span>Archive</span>' : ''}</span>
      <h3>${hl(it.t, ts)}</h3>${it.s ? `<p class="s">${hl(it.s, ts)}</p>` : ''}<span class="kh-tags">${themes}${places}</span></span></${tag}>`;
  }
  function results() {
    const ts = terms();
    let list = ITEMS.filter(it => passes(it, null, ts));
    const sort = S.sort === 'rel' && !ts.length ? 'new' : S.sort;
    if (sort === 'old') list.sort((a, b) => (a.d || '9').localeCompare(b.d || '9'));
    else if (sort === 'az') list.sort((a, b) => a.t.localeCompare(b.t));
    else if (sort === 'rel') { list.forEach(i => (i._s = score(i, ts))); list.sort((a, b) => b._s - a._s || (b.d || '').localeCompare(a.d || '')); }
    return { list, ts };
  }
  const filtered = () => !!(S.q || S.path || S.prog || S.themes.size || S.types.size || S.country || S.from || S.to || S.langs.size);

  function renderResults() {
    const { list, ts } = results();
    // Featured: only on the unfiltered landing view. Chosen in the content manager (Featured content); otherwise the newest.
    const picked = (FEATURED.hub || []).map(id => ITEMS.find(i => i.id === id)).filter(Boolean);
    const feat = !filtered() ? picked.length ? picked : (ITEMS.filter(i => i.f && !i.isArch).slice(0, 3).length ? ITEMS.filter(i => i.f && !i.isArch).slice(0, 3) : (() => { const out = [], seen = new Set(); for (const i of ITEMS) { if (i.isArch || seen.has(i.y) || !['Report', 'Pocket guide', 'Article', 'Blog', 'Video', 'Presentation'].includes(i.y)) continue; seen.add(i.y); out.push(i); if (out.length === 3) break; } return out; })()) : [];
    $('khFeatured').innerHTML = feat.length ? `<h2 class="kh-feat-label">Latest from FinMark Trust</h2>` + feat.map(i => card(i, [], true)).join('') : '';
    const shown = list.slice(0, S.shown);
    $('khResults').className = 'kh-results' + (S.view === 'list' ? ' list' : '');
    $('khResults').innerHTML = shown.length ? shown.map(i => `<li>${card(i, ts)}</li>`).join('')
      : `<li class="kh-empty"><b>No results match these filters.</b>Try fewer filters${S.archived ? '' : ', or include archived themes'}.<br><button type="button" class="kh-link" data-clear>Clear all filters</button></li>`;
    const hidden = !S.archived ? ITEMS.filter(i => i.isArch && passes(Object.assign({}, i, { isArch: false }), null, ts)).length : 0;
    $('khCount').innerHTML = `<b>${list.length.toLocaleString('en-GB')}</b> result${list.length === 1 ? '' : 's'}${S.q ? ` for “${esc(S.q)}”` : ''}${hidden ? ` <span style="color:var(--muted)">· ${hidden} more in archived themes</span>` : ''}`;
    $('khMore').hidden = list.length <= S.shown;
    $('khMore').textContent = `Show ${Math.min(PAGE, list.length - S.shown)} more`;
    $('khPaging').textContent = list.length ? `Showing ${Math.min(S.shown, list.length)} of ${list.length.toLocaleString('en-GB')}` : '';
    // Active filter chips
    const chips = [];
    if (S.q) chips.push(['q', '', `“${S.q}”`]);
    if (S.path) chips.push(['path', '', S.path === 'data' ? 'Data' : 'Programmes']);
    if (S.prog) chips.push(['prog', '', PG[S.prog] ? PG[S.prog].name : S.prog]);
    S.themes.forEach(t => chips.push(['theme', t, TH[t] ? TH[t].name : t]));
    S.types.forEach(t => chips.push(['type', t, t]));
    if (S.country) chips.push(['country', '', S.country === 'SADC-ALL' ? 'Any SADC country' : S.country === 'SADC' ? 'SADC – Southern African Development Community' : PLACES[S.country] || S.country]);
    if (S.from || S.to) chips.push(['year', '', `${S.from || '…'}–${S.to || '…'}`]);
    S.langs.forEach(l => chips.push(['lang', l, LANGS[l]]));
    $('khChips').innerHTML = chips.map(([k, v, l]) => `<button type="button" class="kh-chip" data-k="${k}" data-v="${esc(v)}" aria-label="Remove filter ${esc(l)}">${esc(l)}<span aria-hidden="true">×</span></button>`).join('')
      + (chips.length > 1 ? `<button type="button" class="kh-link" data-clear>Clear all</button>` : '');
  }

  function render(resetPage = true) { if (resetPage) S.shown = PAGE; renderFilters(); renderRail(); renderResults(); writeUrl(); }
  function clearAll() { S.q = ''; $('khQ').value = ''; S.path = ''; S.prog = ''; S.themes.clear(); S.types.clear(); S.country = ''; S.from = ''; S.to = ''; S.langs.clear(); render(); }

  // ---------- Events ----------
  function wire() {
    $('khSearch').addEventListener('submit', e => { e.preventDefault(); S.q = $('khQ').value.trim(); if (S.q && S.sort === 'new') { S.sort = 'rel'; $('khSort').value = 'rel'; } render(); $('khCount').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    let t; $('khQ').addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { S.q = $('khQ').value.trim(); if (!S.q && S.sort === 'rel') { S.sort = 'new'; $('khSort').value = 'new'; } render(); }, 220); });
    $('khFilters').addEventListener('change', e => {
      const el = e.target;
      if (el.name === 'path') S.path = el.value;
      else if (el.name === 'theme') el.checked ? S.themes.add(el.value) : S.themes.delete(el.value);
      else if (el.name === 'type') el.checked ? S.types.add(el.value) : S.types.delete(el.value);
      else if (el.name === 'lang') el.checked ? S.langs.add(el.value) : S.langs.delete(el.value);
      else if (el.id === 'fCountry') S.country = el.value;
      else if (el.id === 'fProgramme') S.prog = el.value;
      else if (el.id === 'fFrom') S.from = el.value;
      else if (el.id === 'fTo') S.to = el.value;
      else if (el.id === 'fArchived') { S.archived = el.checked; if (!S.archived) [...S.themes].forEach(s => TH[s] && TH[s].status === 'archived' && S.themes.delete(s)); }
      render();
    });
    $('khThemeRail').addEventListener('click', e => { const r = e.target.closest('[data-region]'); if (r) { S.country = S.country === r.dataset.region ? '' : r.dataset.region; return render(); } const b = e.target.closest('[data-theme]'); if (!b) return; const s = b.dataset.theme; const only = S.themes.size === 1 && S.themes.has(s); S.themes.clear(); if (!only) S.themes.add(s); render(); });
    document.addEventListener('click', e => {
      if (e.target.closest('[data-clear]')) return clearAll();
      const c = e.target.closest('.kh-chip'); if (!c) return;
      const k = c.dataset.k, v = c.dataset.v;
      if (k === 'q') { S.q = ''; $('khQ').value = ''; } else if (k === 'path') S.path = ''; else if (k === 'prog') S.prog = ''; else if (k === 'theme') S.themes.delete(v); else if (k === 'type') S.types.delete(v);
      else if (k === 'country') S.country = ''; else if (k === 'year') { S.from = ''; S.to = ''; } else if (k === 'lang') S.langs.delete(v);
      render();
    });
    $('khClear').addEventListener('click', clearAll);
    $('khSort').addEventListener('change', e => { S.sort = e.target.value; render(); });
    $('vGrid').addEventListener('click', () => setView('grid')); $('vList').addEventListener('click', () => setView('list'));
    $('khMore').addEventListener('click', () => { S.shown += PAGE; renderResults(); });
    const panel = $('khFilters');
    $('khOpenFilters').addEventListener('click', () => { panel.classList.add('open'); $('khCloseFilters').focus(); });
    [$('khCloseFilters'), $('khApply')].forEach(b => b.addEventListener('click', () => { panel.classList.remove('open'); $('khOpenFilters').focus(); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) { panel.classList.remove('open'); $('khOpenFilters').focus(); } });
  }
  function setView(v) { S.view = v; $('vGrid').setAttribute('aria-pressed', v === 'grid'); $('vList').setAttribute('aria-pressed', v === 'list'); try { localStorage.setItem('kh-view', v); } catch (e) {} renderResults(); }

  // Thumbnails much squarer than the wide banner shape are shown whole (over a blurred copy) instead of being cropped.
  document.addEventListener('load', e => {
    const im = e.target;
    if (im.tagName === 'IMG' && im.classList.contains('fg') && im.naturalHeight && im.naturalWidth / im.naturalHeight < 2.2) im.parentElement.classList.add('fit');
  }, true);

  fetch('knowledge.json').then(r => r.json()).then(feed => {
    THEMES = feed.themes; THEMES.forEach(t => (TH[t.slug] = t));
    PROGS = feed.programmes || []; FEATURED = feed.featured || {}; PROGS.forEach(p => (PG[p.slug] = p));
    ITEMS = feed.items; ITEMS.forEach(prep);
    readUrl();
    try { const v = localStorage.getItem('kh-view'); if (v === 'list' || v === 'grid') S.view = v; } catch (e) {}
    $('khQ').value = S.q; $('khSort').value = S.sort; $('vGrid').setAttribute('aria-pressed', S.view === 'grid'); $('vList').setAttribute('aria-pressed', S.view === 'list');
    const cur = THEMES.filter(t => t.status === 'current').length, years = ITEMS.map(i => i.year).filter(Boolean).sort();
    $('khStats').textContent = `${ITEMS.length.toLocaleString('en-GB')} pieces · ${cur} current themes · ${years[0]}–${years[years.length - 1]}`;
    wire(); render();
  }).catch(() => { $('khResults').innerHTML = '<li class="kh-empty"><b>The library could not load.</b>Refresh the page to try again.</li>'; $('khStats').textContent = ''; });
})();
