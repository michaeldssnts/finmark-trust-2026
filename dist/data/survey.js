/* FinScope survey summary page (data/survey.html).
   Figures come from data/surveys/<survey>-<ISO>-<year>.json, migrated from the old data portal.
   Address: survey.html?d=consumer-ZAF-2019 (or #consumer-ZAF-2019). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pct = (v, d = 1) => (v > 0 && v < 0.05 ? '<0.1' : (+v).toFixed(d)) + '%';
  const people = w => { if (!w) return '–'; if (w >= 1e6) return (w / 1e6).toFixed(w >= 1e7 ? 1 : 2) + ' million'; if (w >= 1e3) return Math.round(w / 1e3).toLocaleString('en-GB') + 'k'; return Math.round(w).toLocaleString('en-GB'); };
  const SADC = ['AGO', 'BWA', 'COM', 'COD', 'SWZ', 'LSO', 'MDG', 'MWI', 'MUS', 'MOZ', 'NAM', 'SYC', 'ZAF', 'TZA', 'ZMB', 'ZWE'];
  const EXPLORER = { 'consumer-MWI-2023': 'finscope-consumer.html#MWI-2023' };   // surveys with the full explorer (respondent-level data)
  const STRAND = ['--s1', '--s2', '--s3', '--s4', '--c5', '--c6', '--c7', '--c8'], LIGHT = new Set(['--s4', '--c5', '--none']);
  const LOW_N = 50;

  const TABS = {
    consumer: [
      { id: 'access', tab: 'Access', title: 'Access to financial services', strand: 'total_fas_strand', usage: ['fas_strand'], extra: ['mobile_money'], sub: 'Each adult is placed in the most formal category they use: banked first, then other formal (non-bank), then informal only. Excluded adults use no financial products or services.' },
      { id: 'savings', tab: 'Savings', title: 'Savings', strand: 'total_saving_strand', usage: ['savings_strand'], sub: 'Where adults keep their savings, placed in the most formal channel they use.' },
      { id: 'credit', tab: 'Credit', title: 'Credit', strand: 'total_credit_strand', usage: ['credit_strand'], sub: 'Where adults borrow, placed in the most formal source they use.' },
      { id: 'remittances', tab: 'Remittances', title: 'Sending and receiving money', strand: 'total_remittances_strand', usage: ['remittances_strand'], sub: 'How adults send or receive money, placed in the most formal channel they use.' },
      { id: 'insurance', tab: 'Insurance', title: 'Insurance', strand: 'total_insurance_strand', usage: ['insurance_strand'], sub: 'Insurance cover, placed in the most formal source adults use.' },
      { id: 'trend', tab: 'Over time', title: 'Change over time', trend: ['total_fas_strand', 'total_saving_strand', 'total_credit_strand', 'total_remittances_strand', 'total_insurance_strand'], sub: 'The same strands for each FinScope survey in this country.' },
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
      { id: 'business', tab: 'The businesses', title: 'About the businesses', dists: ['business_sector', 'business_size', 'n_of_employees', 'business_age', 'licensed_registered', 'financial_records', 'business_coaching', 'business_development_measure'], sub: 'Size, sector and formality of the businesses.' },
      { id: 'owners', tab: 'The owners', title: 'Who runs them', dists: ['gender', 'age', 'geographic_area'], sub: 'The owners of the businesses.' },
      { id: 'growth', tab: 'Growth and barriers', title: 'Growth, barriers and start-up', dists: ['total_barrier_strand', 'obstacle_to_growth', 'total_motive_strand', 'total_capital_source_strand', 'total_source_of_skills_strand'], usage: ['infrastructure_strand'], sub: 'What holds businesses back, why they started and how they were funded.' }
    ]
  };

  let INDEX = [], D = null, SAME = [], S = { s: 'consumer', iso: '', year: 0, tab: 'access', view: 'chart' };
  const fileOf = x => `surveys/${x.s}-${x.iso}-${x.year}.json`;
  const keyOf = x => `${x.s}-${x.iso}-${x.year}`;
  const label = s => s === 'msme' ? 'FinScope MSME' : 'FinScope Consumer';
  const unit = () => S.s === 'msme' ? 'businesses' : 'adults';

  function parse() {
    const q = new URLSearchParams(location.search).get('d') || location.hash.slice(1);
    const m = (q || '').match(/^(?:(consumer|msme)-)?([A-Za-z]{3})(?:-(\d{4}))?$/i);
    if (!m) return null;
    return { s: (m[1] || 'consumer').toLowerCase(), iso: m[2].toUpperCase(), year: m[3] ? +m[3] : 0 };
  }
  function pick(want) {
    const list = INDEX.filter(x => x.data);
    let c = list.filter(x => x.s === want.s && x.iso === want.iso);
    if (!c.length) c = list.filter(x => x.iso === want.iso);
    if (!c.length) c = list.filter(x => x.s === 'consumer' && x.iso === 'ZAF');
    c.sort((a, b) => b.year - a.year);
    return c.find(x => x.year === want.year) || c[0];
  }

  // ---------- data helpers ----------
  const ind = k => D && D.ind[k];
  const row = (k, l) => { const i = ind(k); return i ? i.r.find(r => r[0] === l) : null; };
  const segs = r => r.map((x, i) => ({ l: x[0], v: x[1], n: x[2], w: x[3], c: /^(not |excluded|no )/i.test(x[0]) ? '--none' : STRAND[i % STRAND.length] }));

  function stackRow(lab, sublab, rows, big) {
    const parts = segs(rows).map(x => `<div class="seg-bar${LIGHT.has(x.c) ? ' light' : ''}" style="flex-basis:${x.v}%;background:var(${x.c})" title="${esc(x.l)}: ${pct(x.v)}${x.w ? ' · ' + people(x.w) + ' ' + unit() : ''}">${x.v >= 6 ? pct(x.v, 0) : ''}</div>`).join('');
    return `<div class="srow"><div class="lab">${esc(lab)}${sublab ? `<small>${sublab}</small>` : ''}</div><div class="stack${big ? ' big' : ''}">${parts}</div></div>`;
  }
  const legend = rows => `<div class="legend static">${segs(rows).map(x => `<span><i style="background:var(${x.c})"></i>${esc(x.l)}</span>`).join('')}</div>`;
  const axis = `<div class="axis"><div></div><div class="num"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div></div>`;
  function bars(rows, fill) {
    return `<div class="ind">${rows.map(r => `<div class="irow${r[2] && r[2] < LOW_N ? ' low' : ''}"><div class="lab">${esc(r[0])}${r[2] && r[2] < LOW_N ? '<small>small sample</small>' : ''}</div><div class="ibars"><div class="ibar"><div class="track"><div class="fill" style="width:${Math.min(100, r[1])}%;background:var(${fill || '--s2'})"></div></div><div class="val num">${pct(r[1])} <small>${r[3] ? people(r[3]) : ''}</small></div></div></div></div>`).join('')}</div>`;
  }
  function table(rows, head = 'Category') {
    return `<div class="tablewrap"><table data-csv><thead><tr><th>${esc(head)}</th><th>Share</th><th>${unit()[0].toUpperCase() + unit().slice(1)} ('000)</th><th>n</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td class="num">${pct(r[1])}</td><td class="num">${r[3] ? Math.round(r[3] / 1000).toLocaleString('en-GB') : '–'}</td><td class="num">${r[2] ? r[2].toLocaleString('en-GB') : '–'}</td></tr>`).join('')}</tbody></table></div>`;
  }
  const copyBtn = `<button type="button" class="linkbtn" data-copy>Copy table</button>`;

  // ---------- rendering ----------
  function sections() { return TABS[S.s].filter(sec => sec.trend ? SAME.length > 1 : [sec.strand, ...(sec.usage || []), ...(sec.dists || [])].some(k => k && ind(k))); }
  function renderTabs() {
    const list = sections();
    if (!list.some(x => x.id === S.tab)) S.tab = list[0] ? list[0].id : '';
    $('tabs').innerHTML = list.map(x => `<button role="tab" aria-selected="${x.id === S.tab}" tabindex="${x.id === S.tab ? 0 : -1}" data-tab="${x.id}">${x.tab}<small class="num">${x.strand && ind(x.strand) ? headline(x.strand) : ''}</small></button>`).join('');
  }
  function headline(k) { const r = ind(k).r, none = r.find(x => /^(not |excluded)/i.test(x[0])); return none ? pct(100 - none[1], 0) : ''; }
  function renderTop() {
    const fas = ind('total_fas_strand'), g = l => { const r = row('total_fas_strand', l); return r ? r[1] : 0; };
    const ex = fas ? g('Excluded') : null, formal = fas ? g('Banked') + g('Other formal (non-bank)') : null;
    const mm = ind('mobile_money') && ind('mobile_money').r.length === 1 ? ind('mobile_money').r[0] : null;
    const k = [[people(D.adults), `${unit()} represented`, D.n ? `weighted from ${D.n.toLocaleString('en-GB')} interviews` : '']];
    if (fas) k.push([pct(100 - ex), 'financially included', 'use any formal or informal product'], [pct(formal), 'formally served', 'banked or other formal (non-bank)'], [pct(g('Banked')), 'banked', 'have a bank product'], [pct(ex), 'financially excluded', 'use no financial products']);
    if (mm && k.length < 6) k.splice(4, 0, [pct(mm[1]), 'use mobile money', '']);
    $('kpis').innerHTML = k.slice(0, 5).map(([v, l, s]) => `<div class="kpi"><b class="num">${v}</b><span>${l}</span><small class="num">${s}</small></div>`).join('');
    $('scope').innerHTML = `<b>${esc(D.country)}</b> · ${label(S.s)} ${S.year} · all ${unit()}${SAME.length > 1 ? ` · also surveyed in ${SAME.filter(x => x.year !== S.year).map(x => `<a href="?d=${keyOf(x)}" data-go="${keyOf(x)}">${x.year}</a>`).join(', ')}` : ''}`;
  }
  async function renderPanel() {
    const sec = TABS[S.s].find(x => x.id === S.tab), tbl = S.view === 'table';
    if (!sec) { $('panel').innerHTML = '<div class="card empty">No figures are online for this survey yet. The report in the Knowledge Hub has the results.</div>'; return; }
    let html = '';
    if (sec.trend) {
      const all = await Promise.all(SAME.slice().sort((a, b) => a.year - b.year).map(x => x.year === S.year ? D : fetch(fileOf(x)).then(r => r.json()).catch(() => null)));
      html = sec.trend.map(k => {
        const ys = all.filter(d => d && d.ind[k]); if (ys.length < 2) return '';
        const t = ys[ys.length - 1].ind[k].t;
        return `<div class="card"><div class="card-head"><div><h2>${esc(t)}</h2><p class="sub">${esc(sec.sub)}</p></div>${tbl ? copyBtn : ''}</div>`
          + (tbl ? `<div class="tablewrap"><table data-csv><thead><tr><th>Year</th>${ys[ys.length - 1].ind[k].r.map(r => `<th>${esc(r[0])}</th>`).join('')}</tr></thead><tbody>${ys.map(d => `<tr><td>${d.year}</td>${ys[ys.length - 1].ind[k].r.map((r, i) => { const m = d.ind[k].r.find(x => x[0] === r[0]) || d.ind[k].r[i]; return `<td class="num">${m ? pct(m[1]) : '–'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`
            : `<div class="stack-rows">${ys.map(d => stackRow(String(d.year), `${people(d.adults)} ${unit()}`, d.ind[k].r)).join('')}</div>${axis}${legend(ys[ys.length - 1].ind[k].r)}`)
          + `<p class="note2">Category names can differ slightly between survey rounds.</p></div>`;
      }).join('');
    } else {
      if (sec.strand && ind(sec.strand)) {
        const r = ind(sec.strand).r;
        html += `<div class="card"><div class="card-head"><div><h2>${esc(sec.title)}</h2><p class="sub">${esc(sec.sub)}</p></div>${tbl ? copyBtn : ''}</div>`
          + (tbl ? table(r) : `${legend(r)}<div class="stack-rows" style="margin-top:14px">${stackRow(`All ${unit()}`, people(D.adults), r, true)}</div>${axis}`) + '</div>';
      }
      const use = (sec.usage || []).filter(k => ind(k)).concat((sec.extra || []).filter(k => ind(k) && ind(k).r.length === 1));
      const urows = use.flatMap(k => ind(k).r);
      if (urows.length) html += `<div class="card"><div class="card-head"><div><h2>${sec.strand ? 'Usage of each channel' : esc(sec.title)}</h2><p class="sub">${sec.strand ? `Share of ${unit()} using each channel. A person can use more than one, so these can add up to more than 100%.` : esc(sec.sub)}</p></div>${tbl ? copyBtn : ''}</div>${tbl ? table(urows, 'Channel') : bars(urows, '--s2')}</div>`;
      const ds = (sec.dists || []).filter(k => ind(k));
      if (ds.length) html += `${!sec.strand && !urows.length ? `<div><h2 style="color:var(--navy);font-size:1.35rem">${esc(sec.title)}</h2><p class="sub" style="color:var(--muted);margin:4px 0 0">${esc(sec.sub)}</p></div>` : ''}<div class="dists">${ds.map(k => `<div class="card mini"><div class="card-head" style="margin-bottom:10px"><h3>${esc(ind(k).t)}</h3>${tbl ? copyBtn : ''}</div>${tbl ? table(ind(k).r) : bars(ind(k).r, '--s1')}</div>`).join('')}</div>`;
    }
    $('panel').innerHTML = html || '<div class="card empty">No figures for this topic in this survey.</div>';
  }
  function renderHead() {
    const name = D.country, sadc = SADC.includes(S.iso), k = keyOf(S);
    $('countryName').textContent = name; $('crumbCountry').textContent = name; $('crumbSurvey').textContent = label(S.s);
    $('surveyEyebrow').textContent = label(S.s); $('yearEyebrow').textContent = S.year;
    $('crumbCountryLink').href = sadc ? `country.html?country=${S.iso}` : '../countries/index.html';
    $('backLink').hidden = !sadc; $('backLink').href = `country.html?country=${S.iso}`; $('backName').textContent = name;
    $('lede').textContent = S.s === 'msme'
      ? `Headline results from the FinScope MSME survey of micro, small and medium enterprises in ${name}, ${S.year}. Figures are weighted to all businesses in the survey's scope.`
      : `Headline results from the FinScope Consumer survey of adults in ${name}, ${S.year}. Every figure is weighted, so it describes the adult population rather than only the people interviewed.`;
    const ex = EXPLORER[k];
    $('explorerLink').hidden = !ex;
    if (ex) $('explorerLink').innerHTML = `<span><b>Go deeper:</b> filter by gender, area, age and district, and compare groups, in the full explorer.</span><a class="btn" href="${ex}">Open the explorer</a>`;
    document.title = `${name} ${S.year} — ${label(S.s)} — FinMark Trust`;
    // pickers
    const list = INDEX.filter(x => x.data && x.s === S.s);
    const countries = [...new Map(list.map(x => [x.iso, x.country])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
    $('pickSurvey').value = S.s;
    $('pickCountry').innerHTML = countries.map(([iso, n]) => `<option value="${iso}"${iso === S.iso ? ' selected' : ''}>${esc(n)}</option>`).join('');
    $('pickYear').innerHTML = SAME.slice().sort((a, b) => b.year - a.year).map(x => `<option${x.year === S.year ? ' selected' : ''}>${x.year}</option>`).join('');
    // dataset request
    const entry = INDEX.find(x => keyOf(x) === k), dl = !!(entry && entry.dl);
    $('request').hidden = !dl; $('toRequest').hidden = !dl;
    $('reqTitle').textContent = `${name} ${S.year}`; $('reqSurvey').textContent = S.s === 'msme' ? 'MSME' : 'Consumer';
    document.querySelectorAll('.yr').forEach(e => (e.textContent = S.year));
  }

  async function go(want, push) {
    const x = pick(want); if (!x) return;
    S.s = x.s; S.iso = x.iso; S.year = x.year;
    SAME = INDEX.filter(y => y.data && y.s === x.s && y.iso === x.iso);
    try { D = await fetch(fileOf(x)).then(r => r.json()); } catch (e) { $('panel').innerHTML = '<div class="card empty">These figures could not load. Refresh the page to try again.</div>'; return; }
    try { history[push ? 'pushState' : 'replaceState'](null, '', `?d=${keyOf(x)}` + (!push && location.hash === '#request' ? '#request' : '')); } catch (e) {}
    renderHead(); renderTop(); renderTabs(); renderPanel();
    if (want.year && want.year !== x.year) $('scope').insertAdjacentHTML('beforeend', ` · <span class="warn">Figures for ${want.year} aren't online yet, so this shows ${x.year}. The ${want.year} report is in the Knowledge Hub.</span>`);
    if (!push && location.hash === '#request' && !$('request').hidden) setTimeout(() => $('request').scrollIntoView({ behavior: 'smooth' }), 300);
  }

  // ---------- events ----------
  $('tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; S.tab = b.dataset.tab; renderTabs(); renderPanel(); });
  $('tabs').addEventListener('keydown', e => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return; e.preventDefault(); const all = [...$('tabs').querySelectorAll('button')], i = all.findIndex(b => b.dataset.tab === S.tab), n = all[(i + d + all.length) % all.length]; S.tab = n.dataset.tab; renderTabs(); renderPanel(); $('tabs').querySelector(`[data-tab="${S.tab}"]`).focus(); });
  $('vChart').onclick = () => { S.view = 'chart'; $('vChart').setAttribute('aria-pressed', true); $('vTable').setAttribute('aria-pressed', false); renderPanel(); };
  $('vTable').onclick = () => { S.view = 'table'; $('vTable').setAttribute('aria-pressed', true); $('vChart').setAttribute('aria-pressed', false); renderPanel(); };
  $('pickSurvey').onchange = e => go({ s: e.target.value, iso: S.iso, year: 0 }, true);
  $('pickCountry').onchange = e => go({ s: S.s, iso: e.target.value, year: 0 }, true);
  $('pickYear').onchange = e => go({ s: S.s, iso: S.iso, year: +e.target.value }, true);
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); const [s, iso, y] = a.dataset.go.split('-'); return go({ s, iso, year: +y }, true); }
    const c = e.target.closest('[data-copy]'); if (c) {
      const t = c.closest('.card').querySelector('table'); if (!t) return;
      const csv = [...t.rows].map(r => [...r.cells].map(x => `"${x.textContent.trim().replace(/"/g, '""')}"`).join(',')).join('\n');
      navigator.clipboard && navigator.clipboard.writeText(csv).then(() => toast('Table copied as CSV'), () => toast('Select the table and copy it'));
    }
  });
  $('toRequest').addEventListener('click', e => { e.preventDefault(); $('request').scrollIntoView({ behavior: 'smooth' }); });
  window.addEventListener('popstate', () => { const w = parse(); if (w) go(w, false); });
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2400); }

  window.FMTRequest && window.FMTRequest({ get survey() { return S.s; }, ctx: () => ({ iso: S.iso, year: S.year, name: D ? D.country : '' }) });
  fetch('surveys/index.json').then(r => r.json()).then(j => { INDEX = j.surveys; go(parse() || { s: 'consumer', iso: 'ZAF', year: 0 }, false); })
    .catch(() => { $('panel').innerHTML = '<div class="card empty">The survey list could not load. Refresh the page to try again.</div>'; });
})();
