/* FinScope survey results (data/survey.html): national figures, filters, Analyse, Compare and Share.
   National figures come from data/surveys/<survey>-<ISO>-<year>.json (migrated from the old data portal).
   Filtered and analysed figures are asked of /api/v1 (or /msme-api/v1) on this server, which fetches them from
   the old portal once and keeps them for good.
   Address: survey.html?d=consumer-ZAF-2019&tab=access&f=gender:Female&a=total_fas_strand:geographic_area&w=total_fas_strand */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pct = (v, d = 1) => (v == null || isNaN(v) ? '–' : (v > 0 && v < 0.05 ? '<0.1' : (+v).toFixed(d)) + '%');
  const people = w => { if (!w) return '–'; if (w >= 1e6) return (w / 1e6).toFixed(w >= 1e7 ? 1 : 2) + ' million'; if (w >= 1e3) return Math.round(w / 1e3).toLocaleString('en-GB') + 'k'; return Math.round(w).toLocaleString('en-GB'); };
  const SADC = ['AGO', 'BWA', 'COD', 'SWZ', 'LSO', 'MDG', 'MWI', 'MUS', 'MOZ', 'NAM', 'SYC', 'ZAF', 'TZA', 'ZMB', 'ZWE'];
  // Countries with a country page (SADC plus the other FinScope countries)
  const PAGES = SADC.concat(['BGD', 'BEN', 'BFA', 'KHM', 'CMR', 'CIV', 'GMB', 'GHA', 'HTI', 'LAO', 'MMR', 'NPL', 'NGA', 'PAK', 'RWA', 'THA', 'TGO', 'UGA']);
  const EXPLORER = { 'consumer-MWI-2023': 'finscope-consumer.html#MWI-2023' };   // surveys with the full explorer (respondent-level data)
  const STRAND = ['--s1', '--s2', '--s3', '--s4', '--c5', '--c6', '--c7', '--c8'], LIGHT = new Set(['--s4', '--c5', '--none']);
  const GROUP = ['--s1', '--s2', '--s3', '--c5', '--c7', '--c6', '--c8', '--s4', '#8b5a9e', '#b5534a', '#5f7d2e', '#2f6d8a', '#a07a1f', '#6a6f86', '#3d8f7a'];
  const LOW_N = 50;

  const TABS = {
    consumer: [
      { id: 'access', tab: 'Access', title: 'Access to financial services', strand: 'total_fas_strand', usage: ['fas_strand'], extra: ['mobile_money'], sub: 'Each adult is placed in the most formal category they use: banked first, then other formal (non-bank), then informal only. Excluded adults use no financial products or services.' },
      { id: 'savings', tab: 'Savings', title: 'Savings', strand: 'total_saving_strand', usage: ['savings_strand'], sub: 'Where adults keep their savings, placed in the most formal channel they use.' },
      { id: 'credit', tab: 'Credit', title: 'Credit', strand: 'total_credit_strand', usage: ['credit_strand'], sub: 'Where adults borrow, placed in the most formal source they use.' },
      { id: 'remittances', tab: 'Remittances', title: 'Sending and receiving money', strand: 'total_remittances_strand', usage: ['remittances_strand'], sub: 'How adults send or receive money, placed in the most formal channel they use.' },
      { id: 'insurance', tab: 'Insurance', title: 'Insurance', strand: 'total_insurance_strand', usage: ['insurance_strand'], sub: 'Insurance cover, placed in the most formal source adults use.' },
      { id: 'trend', tab: 'Over time', title: 'Change over time', trend: ['total_fas_strand', 'total_saving_strand', 'total_credit_strand', 'total_remittances_strand', 'total_insurance_strand'], sub: 'The same strand for each survey in this country.' },
      { id: 'wellbeing', tab: 'Wellbeing', title: 'Wellbeing and the SDGs', usage: ['sdgs_strand'], dists: ['poverty_line'], sub: 'Signs of hardship and employment, linked to the Sustainable Development Goals.' },
      { id: 'profile', tab: 'Profile', title: 'Who the adults are', dists: ['gender', 'geographic_area', 'age', 'i2i_Education', 'i2i_Marital_Status', 'i2i_Income_Sources'], sub: 'The demographic profile of the adult population.' },
      { id: 'living', tab: 'Living conditions', title: 'Living conditions', dists: ['electricity_access_type', 'cooking_energy_type', 'water_source_type', 'toilet_type', 'dwelling_type', 'access_to_resources'], sub: 'Access to basic services at home.' }
    ],
    msme: [
      { id: 'access', tab: 'Access', title: 'Access to financial services', strand: 'total_fas_strand', usage: ['fas_strand'], extra: ['mobile_money'], sub: 'Each business is placed in the most formal category it uses. Excluded businesses use no financial products or services.' },
      { id: 'savings', tab: 'Savings', title: 'Savings', strand: 'total_saving_strand', usage: ['savings_strand'], sub: 'Where businesses keep their savings.' },
      { id: 'credit', tab: 'Credit', title: 'Credit', strand: 'total_credit_strand', usage: ['credit_strand'], sub: 'Where businesses borrow.' },
      { id: 'insurance', tab: 'Insurance', title: 'Insurance', strand: 'total_insurance_strand', usage: ['insurance_strand'], sub: 'Insurance cover for the business.' },
      { id: 'transactions', tab: 'Payments', title: 'Payments and transactions', strand: 'total_transaction_strand', usage: ['transaction_strand'], sub: 'How businesses pay and get paid.' },
      { id: 'trend', tab: 'Over time', title: 'Change over time', trend: ['total_fas_strand', 'total_saving_strand', 'total_credit_strand', 'total_insurance_strand'], sub: 'The same strand for each survey in this country.' },
      { id: 'business', tab: 'The businesses', title: 'About the businesses', dists: ['business_sector', 'business_size', 'n_of_employees', 'business_age', 'licensed_registered', 'financial_records', 'business_coaching', 'business_development_measure'], sub: 'Size, sector and formality of the businesses.' },
      { id: 'owners', tab: 'The owners', title: 'Who runs them', dists: ['gender', 'age', 'geographic_area'], sub: 'The owners of the businesses.' },
      { id: 'growth', tab: 'Growth and barriers', title: 'Growth, barriers and start-up', dists: ['total_barrier_strand', 'obstacle_to_growth', 'total_motive_strand', 'total_capital_source_strand', 'total_source_of_skills_strand'], usage: ['infrastructure_strand'], sub: 'What holds businesses back, why they started and how they were funded.' }
    ]
  };
  // Indicators people can filter by, and the longer list they can analyse (break down) by — as on the old portal
  const FILTER_DIMS = { consumer: ['gender', 'geographic_area', 'age', 'i2i_Education', 'i2i_Income_Sources', 'i2i_Marital_Status'], msme: ['gender', 'geographic_area', 'age', 'business_sector', 'business_size', 'licensed_registered'] };
  const ANALYSE_DIMS = { consumer: ['geographic_area', 'gender', 'age', 'i2i_Marital_Status', 'i2i_Education', 'i2i_Income_Sources', 'water_source_type', 'toilet_type', 'cooking_energy_type', 'electricity_access_type', 'poverty_line'], msme: ['geographic_area', 'gender', 'age', 'business_sector', 'business_size', 'n_of_employees', 'business_age', 'licensed_registered', 'financial_records'] };
  const SHORT = { geographic_area: 'Area', gender: 'Gender', age: 'Age', i2i_Education: 'Education', i2i_Income_Sources: 'Income source', i2i_Marital_Status: 'Marital status', water_source_type: 'Water source', toilet_type: 'Toilet type', cooking_energy_type: 'Cooking energy', electricity_access_type: 'Electricity access', poverty_line: 'Poverty line', business_sector: 'Sector', business_size: 'Business size', n_of_employees: 'Employees', business_age: 'Business age', licensed_registered: 'Registration', financial_records: 'Financial records' };

  let INDEX = [], D = null, SAME = [];
  const S = { s: 'consumer', iso: '', year: 0, tab: 'access', view: 'chart', f: {}, a: {}, c: {}, w: '' };
  const keyOf = x => `${x.s}-${x.iso}-${x.year}`;
  const fileOf = k => `surveys/${k}.json`;
  const curKey = () => keyOf(S);
  const label = s => s === 'msme' ? 'FinScope MSME' : D && D.kind === 'smallholder' ? 'CGAP Smallholder Household Survey' : D && D.by && !D.by.some(b => /FinMark/.test(b.n)) ? 'National financial inclusion survey' : 'FinScope Consumer';
  const owners = () => (D && D.by && D.by.length ? D.by : [{ n: 'FinMark Trust (FinScope)', u: 'https://finmark.org.za/' }]);
  const citeOwner = () => owners().map(b => b.n.replace(/ \(FinScope\)$/, '')).join(' and ');
  const unit = () => S.s === 'msme' ? 'businesses' : 'adults';
  const ind = k => D && D.ind[k];
  const dimName = k => SHORT[k] || (ind(k) ? ind(k).t : k);
  const hasFilters = () => Object.values(S.f).some(v => v && v.length);

  // ---------- survey files ----------
  const FILES = new Map();
  function loadSurvey(k) { if (!FILES.has(k)) FILES.set(k, fetch(fileOf(k)).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })); return FILES.get(k); }
  const entry = k => INDEX.find(x => keyOf(x) === k);
  const surveyName = k => { const e = entry(k); return e ? `${e.country} ${e.year}` : k; };

  // ---------- figures: national (from the file) or filtered (from the data service) ----------
  const FIX = { 'Other_Formal': 'Other formal (non-bank)', 'Other formal': 'Other formal (non-bank)', 'Informal Only': 'Informal only', 'Credit at bank': 'From bank', 'Credit informal': 'From informal', 'Credit with family and friends': 'From family and friends', 'Credit other formal (non-bank)': 'From other formal (non-bank)', 'Formal insurance': 'From other formal (non-bank)', 'From informal channels': 'From informal sources' };
  const CREDIT_FIX = { 'At bank': 'From bank', 'From informal sources': 'From informal', 'Informal': 'From informal' };
  function norm(l, k) {
    l = String(l || '').trim().replace(/\s+/g, ' ').replace('non bank', 'non-bank').replace('formal non-bank', 'formal (non-bank)').replace('poverty line(', 'poverty line (');
    if (k === 'total_fas_strand' && l === 'Informal') l = 'Informal only';
    if (/credit/.test(k) && CREDIT_FIX[l]) return CREDIT_FIX[l];
    return FIX[l] || l;
  }
  function fromApi(json, k, kind, order) {
    const agg = new Map();
    for (const x of (json.data || [])) {
      const l = norm(x.value, k), lo = l.toLowerCase();
      if (!l || ['no data', 'yes', 'no'].includes(lo)) continue;
      if (kind === 'usage' && /^(no|not) /.test(lo) && k !== 'sdgs_strand') continue;
      const a = agg.get(l) || [l, 0, 0, 0]; a[1] += +x.percentage || 0; a[2] += +x.count || 0; a[3] += +x.sum || 0; agg.set(l, a);
    }
    const rows = [...agg.values()].map(a => [a[0], Math.round(a[1] * 10) / 10, a[2], Math.round(a[3])]);
    const pos = l => { const i = order.indexOf(l); return i < 0 ? 999 : i; };
    return rows.sort((a, b) => pos(a[0]) - pos(b[0]) || b[1] - a[1]);
  }
  const API = new Map();
  function filtersParam(f) {
    const arr = Object.entries(f).filter(([, v]) => v && v.length).map(([k, v]) => ({ indicatorId: k, value: v }));
    return arr.length ? '&filters=' + encodeURIComponent(JSON.stringify(arr)) : '';
  }
  async function figures(k, i, f) {   // k = survey key, i = indicator, f = filters → rows [[label, %, n, weighted]]
    const file = await loadSurvey(k), base = file.ind[i];
    if (!base) return null;
    if (!Object.values(f).some(v => v && v.length)) return base.r;
    const [s, iso, year] = k.split('-');
    const url = `/${s === 'msme' ? 'msme-api' : 'api'}/v1/indicator/${i}?${iso}=${year}${filtersParam(f)}`;
    if (!API.has(url)) API.set(url, fetch(url).then(r => { if (!r.ok) throw new Error('data service ' + r.status); return r.json(); }));
    const json = await API.get(url);
    return fromApi(json, i, base.k, base.r.map(r => r[0]));
  }

  // ---------- drawing ----------
  const colourOf = (l, i) => /^(not |excluded$|no )/i.test(l) && !/^no (formal|toilet|cell|electric|internet|telephone)/i.test(l) ? '--none' : STRAND[i % STRAND.length];
  const cv = v => v.startsWith('--') ? `var(${v})` : v;
  function stackRow(lab, sub, rows, big, low) {
    const parts = rows.map((x, i) => { const c = colourOf(x[0], i); return `<div class="seg-bar${LIGHT.has(c) ? ' light' : ''}" style="flex-basis:${x[1]}%;background:${cv(c)}" title="${esc(x[0])}: ${pct(x[1])}${x[3] ? ' · ' + people(x[3]) + ' ' + unit() : ''}">${x[1] >= 6 ? pct(x[1], 0) : ''}</div>`; }).join('');
    return `<div class="srow${low ? ' low' : ''}"><div class="lab">${esc(lab)}${sub ? `<small>${sub}</small>` : ''}</div><div class="stack${big ? ' big' : ''}">${parts}</div></div>`;
  }
  const legendStrand = rows => `<div class="legend static">${rows.map((x, i) => `<span><i style="background:${cv(colourOf(x[0], i))}"></i>${esc(x[0])}</span>`).join('')}</div>`;
  const legendGroups = gs => gs.length > 1 ? `<div class="legend static">${gs.map((g, i) => `<span><i style="background:${cv(GROUP[i % GROUP.length])}"></i>${esc(g.label)}</span>`).join('')}</div>` : '';
  const axis = `<div class="axis"><div></div><div class="num"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div></div>`;
  function groupedBars(labels, gs, single) {
    return `<div class="ind">${labels.map(l => {
      const bars = gs.map((g, gi) => { const r = g.rows && g.rows.find(x => x[0] === l), v = r ? r[1] : 0, n = r ? r[2] : 0;
        return `<div class="ibar${n && n < LOW_N ? ' low' : ''}"><div class="track"><div class="fill" style="width:${Math.min(100, v)}%;background:${cv(gs.length > 1 ? GROUP[gi % GROUP.length] : single)}"></div></div><div class="val num">${r ? pct(v) : '–'} <small>${r && r[3] && gs.length === 1 ? people(r[3]) : ''}</small></div></div>`; }).join('');
      return `<div class="irow"><div class="lab">${esc(l)}</div><div class="ibars">${bars}</div></div>`; }).join('')}</div>`;
  }
  function matrix(labels, gs, firstHead) {
    const one = gs.length === 1;
    return `<div class="tablewrap"><table data-csv><thead><tr><th>${esc(firstHead)}</th>${one ? `<th>Share</th><th>${unit()[0].toUpperCase() + unit().slice(1)} ('000)</th><th>n</th>` : gs.map(g => `<th>${esc(g.label)}</th>`).join('')}</tr></thead><tbody>${labels.map(l => `<tr><td>${esc(l)}</td>${one
      ? (() => { const r = gs[0].rows && gs[0].rows.find(x => x[0] === l); return `<td class="num">${r ? pct(r[1]) : '–'}</td><td class="num">${r && r[3] ? Math.round(r[3] / 1000).toLocaleString('en-GB') : '–'}</td><td class="num">${r && r[2] ? r[2].toLocaleString('en-GB') : '–'}</td>`; })()
      : gs.map(g => { const r = g.rows && g.rows.find(x => x[0] === l); return `<td class="num">${r ? pct(r[1]) : '–'}${r && r[2] ? ` <small>n ${r[2]}</small>` : ''}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  // ---------- widgets ----------
  // A widget is one chart: a strand, a usage list (several indicators) or one distribution.
  function widgetsFor(sec) {
    if (sec.trend) return sec.trend.filter(k => ind(k)).map(k => ({ id: 'trend-' + k, inds: [k], kind: 'trend', title: ind(k).t, sub: sec.sub }));
    const w = [];
    if (sec.strand && ind(sec.strand)) w.push({ id: sec.strand, inds: [sec.strand], kind: 'strand', title: sec.title, sub: sec.sub });
    const use = (sec.usage || []).filter(k => ind(k)).concat((sec.extra || []).filter(k => ind(k) && ind(k).r.length === 1));
    if (use.length) w.push({ id: use[0], inds: use, kind: 'usage', title: sec.strand ? 'Usage of each channel' : sec.title, sub: sec.strand ? `Share of ${unit()} using each channel. One person can use several, so these can add up to more than 100%.` : sec.sub });
    (sec.dists || []).filter(k => ind(k)).forEach(k => w.push({ id: k, inds: [k], kind: 'dist', title: ind(k).t, sub: '', mini: true }));
    return w;
  }
  const analysable = (w, d) => ANALYSE_DIMS[S.s].filter(x => ind(x) && !w.inds.includes(x) && x !== d);
  function toolbar(w) {
    const a = S.a[w.id] || '', cmp = S.c[w.id] || [];
    const dims = analysable(w);
    const others = INDEX.filter(x => x.data && x.s === S.s && keyOf(x) !== curKey());
    const sameCountry = others.filter(x => x.iso === S.iso).sort((x, y) => y.year - x.year);
    const latest = [...new Map(others.filter(x => x.iso !== S.iso).sort((x, y) => x.year - y.year).map(x => [x.iso, x])).values()].sort((x, y) => x.country.localeCompare(y.country));
    const cbox = x => `<label><input type="checkbox" data-cmp="${w.id}" value="${keyOf(x)}"${cmp.includes(keyOf(x)) ? ' checked' : ''}> ${esc(x.country)} ${x.year}</label>`;
    return `<div class="wtools">`
      + (w.kind !== 'trend' && dims.length ? `<details class="wmenu"><summary class="wbtn${a ? ' on' : ''}">Analyse${a ? `: ${esc(dimName(a))}` : ''}</summary><div class="wpop"><p>Break this down by</p><label><input type="radio" name="an-${w.id}" data-an="${w.id}" value=""${!a ? ' checked' : ''}> No breakdown</label>${dims.map(d => `<label><input type="radio" name="an-${w.id}" data-an="${w.id}" value="${d}"${a === d ? ' checked' : ''}> ${esc(dimName(d))}</label>`).join('')}</div></details>` : '')
      + (w.kind !== 'trend' ? `<details class="wmenu"><summary class="wbtn${cmp.length ? ' on' : ''}">Compare${cmp.length ? ` (${cmp.length})` : ''}</summary><div class="wpop wide"><p>Compare with up to 3 surveys</p>${sameCountry.length ? `<b>${esc(D.country)}, other years</b>${sameCountry.map(cbox).join('')}` : ''}<b>Other countries (latest survey)</b>${latest.map(cbox).join('')}${cmp.length ? `<button type="button" class="linkbtn" data-cmpclear="${w.id}">Clear comparison</button>` : ''}</div></details>` : '')
      + `<details class="wmenu"><summary class="wbtn">Share</summary><div class="wpop share"><button type="button" data-share="link" data-w="${w.id}">Copy link to this chart</button><button type="button" data-share="email" data-w="${w.id}">Email</button><button type="button" data-share="linkedin" data-w="${w.id}">LinkedIn</button><button type="button" data-share="x" data-w="${w.id}">X (Twitter)</button><button type="button" data-share="whatsapp" data-w="${w.id}">WhatsApp</button><button type="button" data-share="csv" data-w="${w.id}">Download data (CSV)</button><button type="button" data-share="png" data-w="${w.id}">Download image (PNG)</button></div></details>`
      + `</div>`;
  }
  function card(w) {
    return `<div class="card${w.mini ? ' mini' : ''} widget" id="w-${w.id}" data-w="${w.id}"><div class="card-head"><div>${w.mini ? `<h3>${esc(w.title)}</h3>` : `<h2>${esc(w.title)}</h2>`}${w.sub ? `<p class="sub">${esc(w.sub)}</p>` : ''}</div>${toolbar(w)}</div><div class="wbody"><p class="wload">Loading…</p></div><p class="wfoot"></p></div>`;
  }
  async function fillWidget(w, el) {
    const body = el.querySelector('.wbody'), foot = el.querySelector('.wfoot'), tbl = S.view === 'table';
    const f = S.f, a = S.a[w.id], cmp = S.c[w.id] || [];
    let gs, rowsHead = w.kind === 'usage' ? 'Channel' : 'Category';
    try {
      if (w.kind === 'trend') {
        gs = SAME.slice().sort((x, y) => x.year - y.year).map(x => ({ label: String(x.year), key: keyOf(x) }));
      } else if (a) {
        const cats = ind(a).r.map(r => r[0]).filter(c => !(f[a] && f[a].length) || f[a].includes(c));
        gs = [{ label: `All ${unit()}`, key: curKey(), f }].concat(cats.map(c => ({ label: c, key: curKey(), f: Object.assign({}, f, { [a]: [c] }) })));
      } else {
        gs = [{ label: cmp.length ? surveyName(curKey()) : `All ${unit()}`, key: curKey(), f }].concat(cmp.map(k => ({ label: surveyName(k), key: k, f })));
      }
      await Promise.all(gs.map(async g => {
        const per = await Promise.all(w.inds.map(i => figures(g.key, i, g.f || f).catch(e => { g.err = e; return null; })));
        g.rows = per.some(Boolean) ? per.filter(Boolean).flat() : null;
        if (g.key !== curKey()) { const e = entry(g.key); g.sub = e ? '' : ''; }
      }));
    } catch (e) { body.innerHTML = `<p class="werr">These figures could not load. Refresh the page to try again.</p>`; return; }
    const ok = gs.filter(g => g.rows && g.rows.length);
    if (!ok.length) { body.innerHTML = `<p class="werr">${gs.some(g => g.err) ? 'The filtered figures could not load right now. Clear the filters to see the national figures, or try again later.' : 'No figures for this selection.'}</p>`; foot.textContent = ''; return; }
    const labels = []; ok.forEach(g => g.rows.forEach(r => { if (!labels.includes(r[0])) labels.push(r[0]); }));
    if (w.kind === 'strand' || w.kind === 'trend') {
      const ref = ok[0].rows;
      body.innerHTML = tbl ? matrix(labels, ok, a ? dimName(a) : 'Category').replace('<th>Category</th>', '<th>Category</th>')
        : `${legendStrand(ref)}<div class="stack-rows" style="margin-top:14px">${ok.map(g => { const n = g.rows.reduce((t, r) => t + (r[2] || 0), 0), wsum = g.rows.reduce((t, r) => t + (r[3] || 0), 0); return stackRow(g.label, [wsum ? people(wsum) + ' ' + unit() : '', n ? 'n = ' + n.toLocaleString('en-GB') : ''].filter(Boolean).join(' · '), labels.map(l => g.rows.find(r => r[0] === l) || [l, 0, 0, 0]), ok.length === 1, n && n < LOW_N); }).join('')}</div>${axis}`;
    } else {
      body.innerHTML = tbl ? matrix(labels, ok, rowsHead) : legendGroups(ok) + groupedBars(labels, ok, w.kind === 'dist' ? '--s1' : '--s2');
    }
    const notes = [];
    if (hasFilters()) notes.push('Filtered to ' + filterText() + '.');
    if (a) notes.push(`Broken down by ${dimName(a).toLowerCase()}.`);
    if (gs.some(g => !g.rows)) notes.push(`No figures for: ${gs.filter(g => !g.rows).map(g => g.label).join(', ')}.`);
    if (ok.some(g => g.rows.some(r => r[2] && r[2] < LOW_N))) notes.push('Faded bars are based on fewer than 50 interviews, so read them with caution.');
    if (w.kind === 'trend') notes.push('Category names can differ slightly between survey rounds.');
    foot.textContent = notes.join(' ');
    el.dataset.ready = '1';
  }

  // ---------- page ----------
  function sections() { return TABS[S.s].filter(sec => sec.trend ? SAME.length > 1 : [sec.strand, ...(sec.usage || []), ...(sec.dists || [])].some(k => k && ind(k))); }
  function headline(k) { const r = ind(k).r, none = r.find(x => /^(not |excluded)/i.test(x[0])); return none ? pct(100 - none[1], 0) : ''; }
  function renderTabs() {
    const list = sections();
    if (!list.some(x => x.id === S.tab)) S.tab = list[0] ? list[0].id : '';
    $('tabs').innerHTML = list.map(x => `<button role="tab" aria-selected="${x.id === S.tab}" tabindex="${x.id === S.tab ? 0 : -1}" data-tab="${x.id}">${x.tab}<small class="num">${x.strand && ind(x.strand) && !hasFilters() ? headline(x.strand) : ''}</small></button>`).join('');
  }
  function filterText() { return Object.entries(S.f).filter(([, v]) => v && v.length).map(([k, v]) => `${dimName(k)}: ${v.join(', ')}`).join(' · '); }
  function renderFilters() {
    const dims = FILTER_DIMS[S.s].filter(k => ind(k));
    $('filters').innerHTML = `<span class="flabel">Filter</span>` + dims.map(k => { const on = S.f[k] || [];
      return `<details class="wmenu fmenu"><summary class="wbtn${on.length ? ' on' : ''}">${esc(dimName(k))}${on.length ? `: ${on.length === 1 ? esc(on[0]) : on.length}` : ''}</summary><div class="wpop">${ind(k).r.map(r => `<label><input type="checkbox" data-f="${k}" value="${esc(r[0])}"${on.includes(r[0]) ? ' checked' : ''}> ${esc(r[0])}</label>`).join('')}</div></details>`; }).join('')
      + (hasFilters() ? `<button type="button" class="fclear" id="clearFilters">Clear filters</button>` : '');
  }
  async function renderTop() {
    const fas = ind('total_fas_strand');
    let rows = fas ? fas.r : null, mmRow = ind('mobile_money') && ind('mobile_money').r.length === 1 ? ind('mobile_money').r[0] : null, adults = D.adults, n = D.n;
    if (hasFilters() && fas) {
      try { rows = await figures(curKey(), 'total_fas_strand', S.f); adults = rows.reduce((t, r) => t + (r[3] || 0), 0); n = rows.reduce((t, r) => t + (r[2] || 0), 0); } catch (e) { rows = null; }
      try { if (mmRow) { const m = await figures(curKey(), 'mobile_money', S.f); mmRow = m && m[0]; } } catch (e) { mmRow = null; }
    }
    const g = l => { const r = rows && rows.find(x => x[0] === l); return r ? r[1] : 0; };
    const k = [[people(adults), `${unit()} ${hasFilters() ? 'in this selection' : 'represented'}`, n ? `weighted from ${n.toLocaleString('en-GB')} interviews` : '']];
    if (rows) {
      k.push([pct(100 - g('Excluded')), 'financially included', 'use any formal or informal product'], [pct(g('Banked') + g('Other formal (non-bank)')), 'formally served', 'banked or other formal (non-bank)']);
      if (mmRow) k.push([pct(mmRow[1]), 'use mobile money', '']); else k.push([pct(g('Banked')), 'banked', 'have a bank product']);
      k.push([pct(g('Excluded')), 'financially excluded', 'use no financial products']);
    }
    $('kpis').innerHTML = k.slice(0, 5).map(([v, l, s]) => `<div class="kpi"><b class="num">${v}</b><span>${l}</span><small class="num">${s}</small></div>`).join('');
    $('scope').innerHTML = `<b>${esc(D.country)}</b> · ${label(S.s)} ${S.year} · ${hasFilters() ? esc(filterText()) : 'all ' + unit()}${SAME.length > 1 ? ` · also surveyed in ${SAME.filter(x => x.year !== S.year).map(x => `<a href="?d=${keyOf(x)}" data-go="${keyOf(x)}">${x.year}</a>`).join(', ')}` : ''}`;
  }
  let renderToken = 0;
  function renderPanel() {
    const sec = TABS[S.s].find(x => x.id === S.tab), my = ++renderToken;
    if (!sec) { $('panel').innerHTML = '<div class="card empty">No figures are online for this survey yet. The report in the Knowledge Hub has the results.</div>'; return; }
    const ws = widgetsFor(sec);
    const big = ws.filter(w => !w.mini), small = ws.filter(w => w.mini);
    $('panel').innerHTML = (!big.length && small.length ? `<div><h2 style="color:var(--navy);font-size:1.35rem">${esc(sec.title)}</h2><p class="sub" style="color:var(--muted);margin:4px 0 0">${esc(sec.sub)}</p></div>` : '')
      + big.map(card).join('') + (small.length ? `<div class="dists">${small.map(card).join('')}</div>` : '')
      + (sec.trend && hasFilters() ? '' : '');
    ws.forEach(w => { const el = $('w-' + w.id); if (el) fillWidget(w, el).then(() => { if (my === renderToken && S.w === w.id) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('flash'); S.w = ''; } }); });
  }
  function renderHead() {
    const name = D.country, sadc = PAGES.includes(S.iso), k = curKey();
    $('countryName').textContent = name; $('crumbCountry').textContent = name; $('crumbSurvey').textContent = label(S.s);
    $('surveyEyebrow').textContent = label(S.s); $('yearEyebrow').textContent = S.year;
    $('crumbCountryLink').href = sadc ? `country.html?country=${S.iso}` : '../countries/index.html';
    $('backLink').hidden = !sadc; $('backLink').href = `country.html?country=${S.iso}`; $('backName').textContent = name;
    $('lede').textContent = S.s === 'msme'
      ? `Results from the FinScope MSME survey of micro, small and medium enterprises in ${name}, ${S.year}. Figures are weighted to all businesses in the survey's scope.`
      : `Results from ${label(S.s) === 'FinScope Consumer' ? 'the FinScope Consumer survey' : 'the national financial inclusion survey'} of adults in ${name}, ${S.year}. Every figure is weighted, so it describes the adult population rather than only the people interviewed.`;
    if (D.kind === 'smallholder') $('lede').textContent = `Results from the CGAP national survey of smallholder families in ${name}, ${S.year}. The figures are nationally representative of smallholder farming households, not of all adults.`;
    const ex = EXPLORER[k];
    $('explorerLink').hidden = !ex;
    if (ex) $('explorerLink').innerHTML = `<span><b>Go deeper:</b> filter by district as well, in the full explorer.</span><a class="btn" href="${ex}">Open the explorer</a>`;
    $('credit').innerHTML = `${D.kind === 'partnership' ? 'Data developed in partnership by' : 'Data supplied by'} ${owners().map(b => `<a href="${esc(b.u)}" target="_blank" rel="noopener">${esc(b.n)}</a>`).join(' and ')}. Please credit ${esc(citeOwner())} when you use these figures.`;
    document.title = `${name} ${S.year} — ${label(S.s)} — FinMark Trust`;
    const list = INDEX.filter(x => x.data && x.s === S.s);
    const countries = [...new Map(list.map(x => [x.iso, x.country])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
    $('pickSurvey').value = S.s;
    $('pickCountry').innerHTML = countries.map(([iso, n]) => `<option value="${iso}"${iso === S.iso ? ' selected' : ''}>${esc(n)}</option>`).join('');
    $('pickYear').innerHTML = SAME.slice().sort((a, b) => b.year - a.year).map(x => `<option${x.year === S.year ? ' selected' : ''}>${x.year}</option>`).join('');
    const e = entry(k), dl = !!(e && e.dl);
    $('request').hidden = !dl; $('toRequest').hidden = !dl;
    $('reqTitle').textContent = `${name} ${S.year}`; $('reqSurvey').textContent = `${citeOwner()}, ${label(S.s)}`;
    document.querySelectorAll('.yr').forEach(el => (el.textContent = S.year));
  }
  function renderAll() { renderTop(); renderFilters(); renderTabs(); renderPanel(); writeUrl(true); }

  // ---------- address (so every view and chart can be shared) ----------
  function stateQuery(w) {
    const p = new URLSearchParams();
    p.set('d', curKey()); if (S.tab) p.set('tab', S.tab);
    const f = Object.entries(S.f).filter(([, v]) => v && v.length).map(([k, v]) => `${k}:${v.join('~')}`).join('|'); if (f) p.set('f', f);
    const a = Object.entries(S.a).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join('|'); if (a) p.set('a', a);
    const c = Object.entries(S.c).filter(([, v]) => v && v.length).map(([k, v]) => `${k}:${v.join('~')}`).join('|'); if (c) p.set('c', c);
    if (S.view === 'table') p.set('view', 'table');
    if (w) p.set('w', w);
    return '?' + p.toString();
  }
  function writeUrl(replace) { try { history[replace ? 'replaceState' : 'pushState'](null, '', stateQuery() + (location.hash === '#request' ? '#request' : '')); } catch (e) {} }
  function readUrl() {
    const p = new URLSearchParams(location.search), d = p.get('d') || location.hash.slice(1);
    const m = (d || '').match(/^(?:(consumer|msme)-)?([A-Za-z]{3})(?:-(\d{4}))?$/i);
    const pairs = v => (v || '').split('|').filter(Boolean).map(x => { const i = x.indexOf(':'); return [x.slice(0, i), x.slice(i + 1)]; });
    S.f = Object.fromEntries(pairs(p.get('f')).map(([k, v]) => [k, v.split('~').filter(Boolean)]));
    S.a = Object.fromEntries(pairs(p.get('a')));
    S.c = Object.fromEntries(pairs(p.get('c')).map(([k, v]) => [k, v.split('~').filter(Boolean)]));
    S.tab = p.get('tab') || S.tab; S.view = p.get('view') === 'table' ? 'table' : 'chart'; S.w = p.get('w') || '';
    return m ? { s: (m[1] || 'consumer').toLowerCase(), iso: m[2].toUpperCase(), year: m[3] ? +m[3] : 0 } : null;
  }

  // ---------- choosing a survey ----------
  function pick(want, keepCountry) {
    const list = INDEX.filter(x => x.data);
    let c = list.filter(x => x.s === want.s && x.iso === want.iso), note = '';
    if (!c.length && keepCountry) c = list.filter(x => x.iso === want.iso);
    if (!c.length) { c = list.filter(x => x.s === want.s && x.iso === 'ZAF'); if (!c.length) c = list.filter(x => x.s === want.s); note = want.iso; }
    c.sort((a, b) => b.year - a.year);
    return { x: c.find(x => x.year === want.year) || c[0], note };
  }
  async function go(want, push, opts = {}) {
    const { x, note } = pick(want, opts.keepCountry);
    if (!x) return;
    const changed = keyOf(x) !== curKey();
    S.s = x.s; S.iso = x.iso; S.year = x.year;
    if (changed && !opts.keepState) { S.f = {}; S.a = {}; S.c = {}; }
    SAME = INDEX.filter(y => y.data && y.s === x.s && y.iso === x.iso);
    try { D = await loadSurvey(keyOf(x)); } catch (e) { $('panel').innerHTML = '<div class="card empty">These figures could not load. Refresh the page to try again.</div>'; return; }
    // drop filters and breakdowns this survey doesn't have
    Object.keys(S.f).forEach(k => { if (!ind(k)) delete S.f[k]; });
    Object.keys(S.a).forEach(k => { if (!ind(S.a[k])) delete S.a[k]; });
    $('vChart').setAttribute('aria-pressed', S.view === 'chart'); $('vTable').setAttribute('aria-pressed', S.view === 'table');
    renderHead(); renderTop(); renderFilters(); renderTabs(); renderPanel();
    writeUrl(!push);
    if (note) {
      const nm = (INDEX.find(y => y.iso === note) || {}).country || note;
      $('scope').insertAdjacentHTML('beforeend', ` · <span class="warn">There is no ${S.s === 'msme' ? 'FinScope MSME' : 'FinScope Consumer'} survey online for ${esc(nm)}, so this shows ${esc(D.country)}.</span>`);
    } else if (want.year && want.year !== x.year) $('scope').insertAdjacentHTML('beforeend', ` · <span class="warn">Figures for ${want.year} aren't online yet, so this shows ${x.year}. The ${want.year} report is in the Knowledge Hub.</span>`);
    if (!push && location.hash === '#request' && !$('request').hidden) setTimeout(() => $('request').scrollIntoView({ behavior: 'smooth' }), 300);
  }

  // ---------- sharing ----------
  function widgetCsv(el) {
    const t = el.querySelector('table');
    if (t) return [...t.rows].map(r => [...r.cells].map(x => `"${x.textContent.trim().replace(/"/g, '""')}"`).join(',')).join('\r\n');
    return null;
  }
  async function shareAction(kind, wid) {
    const el = $('w-' + wid), title = el.querySelector('h2,h3').textContent.trim();
    const link = location.origin + location.pathname + stateQuery(wid);
    const text = `${title} — ${D.country} ${S.year}, ${label(S.s)}${hasFilters() ? ' (' + filterText() + ')' : ''}`;
    if (kind === 'link') { try { await navigator.clipboard.writeText(link); toast('Link copied'); } catch (e) { prompt('Copy this link', link); } return; }
    if (kind === 'email') { location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(text + '\n\n' + link + '\n\nData: ' + citeOwner())}`; return; }
    const open = u => window.open(u, '_blank', 'noopener,width=640,height=560');
    if (kind === 'linkedin') return open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`);
    if (kind === 'x') return open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`);
    if (kind === 'whatsapp') return open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`);
    const file = `${D.country}-${S.year}-${title}`.replace(/[^\w-]+/g, '-').replace(/-+/g, '-').toLowerCase();
    if (kind === 'csv') {
      let csv = widgetCsv(el);
      if (!csv) { const v = S.view; S.view = 'table'; const tmp = document.createElement('div'); tmp.innerHTML = card({ id: wid + '-x', inds: [], kind: 'dist', title }); await fillWidget(currentWidget(wid), tmp.firstElementChild); csv = widgetCsv(tmp); S.view = v; }
      if (!csv) return toast('No table for this chart');
      csv = `"${text.replace(/"/g, '""')}"\r\n"Source: ${citeOwner()}"\r\n\r\n` + csv;
      return download(new Blob(['﻿' + csv], { type: 'text/csv' }), file + '.csv');
    }
    if (kind === 'png') {
      toast('Preparing the image…');
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        const tools = el.querySelector('.wtools'); tools.style.visibility = 'hidden';
        const stamp = document.createElement('p'); stamp.className = 'wstamp'; stamp.textContent = `${D.country} ${S.year} · ${label(S.s)} · Source: ${citeOwner()} · finmark.org.za`; el.appendChild(stamp);
        const canvas = await window.html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
        tools.style.visibility = ''; stamp.remove();
        canvas.toBlob(b => download(b, file + '.png'));
      } catch (e) { toast('The image could not be made. Try a screenshot instead.'); }
    }
  }
  const currentWidget = wid => { const sec = TABS[S.s].find(x => x.id === S.tab); return widgetsFor(sec).find(w => w.id === wid); };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  const SCRIPTS = {};
  function loadScript(src) { return SCRIPTS[src] || (SCRIPTS[src] = new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); })); }
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2400); }

  // ---------- events ----------
  $('tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; S.tab = b.dataset.tab; renderTabs(); renderPanel(); writeUrl(true); });
  $('tabs').addEventListener('keydown', e => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return; e.preventDefault(); const all = [...$('tabs').querySelectorAll('button')], i = all.findIndex(b => b.dataset.tab === S.tab), n = all[(i + d + all.length) % all.length]; S.tab = n.dataset.tab; renderTabs(); renderPanel(); writeUrl(true); $('tabs').querySelector(`[data-tab="${S.tab}"]`).focus(); });
  $('vChart').onclick = () => { S.view = 'chart'; $('vChart').setAttribute('aria-pressed', true); $('vTable').setAttribute('aria-pressed', false); renderPanel(); writeUrl(true); };
  $('vTable').onclick = () => { S.view = 'table'; $('vTable').setAttribute('aria-pressed', true); $('vChart').setAttribute('aria-pressed', false); renderPanel(); writeUrl(true); };
  $('pickSurvey').onchange = e => go({ s: e.target.value, iso: S.iso, year: 0 }, true);
  $('pickCountry').onchange = e => go({ s: S.s, iso: e.target.value, year: 0 }, true);
  $('pickYear').onchange = e => go({ s: S.s, iso: S.iso, year: +e.target.value }, true, { keepState: true });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.f) { const k = t.dataset.f, cur = new Set(S.f[k] || []); t.checked ? cur.add(t.value) : cur.delete(t.value); S.f[k] = [...cur]; if (!S.f[k].length) delete S.f[k]; renderAll(); return; }
    if (t.dataset.an !== undefined && t.name && t.name.startsWith('an-')) { const w = t.dataset.an; if (t.value) { S.a[w] = t.value; delete S.c[w]; } else delete S.a[w]; renderPanel(); writeUrl(true); return; }
    if (t.dataset.cmp) {
      const w = t.dataset.cmp, cur = S.c[w] || [];
      if (t.checked && cur.length >= 3) { t.checked = false; return toast('Compare up to 3 surveys at a time'); }
      S.c[w] = t.checked ? cur.concat(t.value) : cur.filter(x => x !== t.value); if (!S.c[w].length) delete S.c[w]; else delete S.a[w];
      renderPanel(); writeUrl(true);
    }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); const [s, iso, y] = a.dataset.go.split('-'); return go({ s, iso, year: +y }, true, { keepState: true }); }
    if (e.target.closest('#clearFilters')) { S.f = {}; renderAll(); return; }
    const cc = e.target.closest('[data-cmpclear]'); if (cc) { delete S.c[cc.dataset.cmpclear]; renderPanel(); writeUrl(true); return; }
    const sh = e.target.closest('[data-share]'); if (sh) { sh.closest('details').open = false; shareAction(sh.dataset.share, sh.dataset.w); return; }
    // close any open menu when clicking elsewhere
    document.querySelectorAll('details.wmenu[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('details.wmenu[open]').forEach(d => { d.open = false; d.querySelector('summary').focus(); }); });
  $('toRequest').addEventListener('click', e => { e.preventDefault(); $('request').scrollIntoView({ behavior: 'smooth' }); });
  window.addEventListener('popstate', () => { const w = readUrl(); if (w) go(w, false, { keepState: true }); });

  window.FMTRequest && window.FMTRequest({ get survey() { return S.s; }, ctx: () => ({ iso: S.iso, year: S.year, name: D ? D.country : '', label: label(S.s), cite: `${citeOwner()} (${S.year}). ${label(S.s)}, ${D ? D.country : ''} ${S.year}.` }) });
  fetch('surveys/index.json').then(r => r.json()).then(j => { INDEX = j.surveys; const w = readUrl(); go(w || { s: 'consumer', iso: 'ZAF', year: 0 }, false, { keepState: true }); })
    .catch(() => { $('panel').innerHTML = '<div class="card empty">The survey list could not load. Refresh the page to try again.</div>'; });
})();
