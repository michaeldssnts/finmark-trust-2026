/* FinMark Trust site guide — a small helper in the bottom corner that points visitors to relevant content.
   It runs entirely in the browser: it matches what the visitor types against the Knowledge Hub feed
   (items, themes, programmes, people) and the site's main pages. No data leaves the page.
   Loaded on every page by site.js (which defines `root`). */
(function () {
  if (window.__fmtGuide) return; window.__fmtGuide = true;
  const R = typeof root === 'string' ? root : './';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asset = p => (p && p.startsWith('/uploads/') ? R + p.slice(1) : p);
  const fmt = d => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '');
  const COUNTRIES = { AGO: 'Angola', BWA: 'Botswana', COD: 'DR Congo|Democratic Republic of the Congo|DRC', SWZ: 'Eswatini|Swaziland', LSO: 'Lesotho', MDG: 'Madagascar', MWI: 'Malawi', MUS: 'Mauritius', MOZ: 'Mozambique', NAM: 'Namibia', SYC: 'Seychelles', ZAF: 'South Africa|SA|RSA', TZA: 'Tanzania', ZMB: 'Zambia', ZWE: 'Zimbabwe',
    BEN: 'Benin', BFA: 'Burkina Faso', KHM: 'Cambodia', CMR: 'Cameroon', GMB: 'Gambia', GHA: 'Ghana', HTI: 'Haiti', IND: 'India', LAO: 'Laos|Lao PDR|Lao', MMR: 'Myanmar|Burma', NPL: 'Nepal', NGA: 'Nigeria', PAK: 'Pakistan', RWA: 'Rwanda', THA: 'Thailand', TGO: 'Togo', UGA: 'Uganda',
    SADC: 'SADC|Southern African Development Community|Southern Africa' };
  const STOP = new Set('a an the and or of in on for to with about is are be i me my we our you your do does can could would should how what where which who find show give get looking look want need any some there please hi hello hey information info tell more on latest new recent'.split(' '));
  const PAGES = [
    { k: /donat|give|fund|endow|patron|support (fmt|finmark)|contribut/, t: 'Donate', d: 'Fund a small business through GBL, or become a founding patron of the Impact Endowment.', u: 'donate/index.html' },
    { k: /terms of reference|\btors?\b|tender|expression of interest|\beoi\b|consultan|vacanc|job|position|career|work (for|with) (you|us|fmt|finmark)|procure|rfp|proposal/, t: 'Terms of Reference', d: 'Expressions of interest, TORs, positions and consultant work.', u: 'terms-of-reference/index.html' },
    { k: /contact|email|phone|call|address|office|reach/, t: 'Contact us', d: 'info\u0040finmark.org.za · +27 (0) 67 594 9291', u: 'contact/index.html' },
    { k: /team|staff|people|who works|trustee|board|ceo/, t: 'Our team and trustees', d: 'The people behind FinMark Trust’s work.', u: 'about/index.html#team' },
    { k: /about|mission|history|who (are|is) (you|finmark)|what is finmark|capabilit/, t: 'About FinMark Trust', d: 'Who we are, how we work and our Capability Statement.', u: 'about/index.html' },
    { k: /data|dataset|survey|finscope|statistic|numbers|indicator|dashboard|microdata/, t: 'Explore Data', d: 'FinScope Consumer and MSME results by country.', u: 'countries/index.html' },
    { k: /programme|program|project|initiative|work in/, t: 'Programmes', d: 'Our programmes in South Africa and across SADC, and their research.', u: 'programmes/index.html' },
    { k: /blog/, t: 'Blogs', d: 'Opinion and analysis from our team.', u: 'knowledge-hub/index.html?type=Blog' },
    { k: /article|news|media release|press/, t: 'Articles and news', d: 'News, articles and media releases.', u: 'knowledge-hub/index.html?type=Article,Media%20release' },
    { k: /video|webinar|recording|watch/, t: 'Videos and webinars', d: 'Recordings of launches, webinars and events.', u: 'knowledge-hub/index.html?type=Video' },
    { k: /newsletter|subscribe|sign ?up|mailing/, t: 'FI Snapshot newsletter', d: 'Sign up from the bottom of any page.', u: '#footer' }
  ];
  let FEED = null, loading = null;
  let SURVEYS = [];
  const load = () => loading || (loading = Promise.all([
    fetch(R + 'knowledge-hub/knowledge.json').then(r => r.json()).then(f => (FEED = f)).catch(() => (FEED = { items: [], themes: [], programmes: [], people: [], tors: [] })),
    fetch(R + 'data/surveys/index.json').then(r => r.json()).then(f => (SURVEYS = f.surveys || [])).catch(() => {})
  ]));

  // ---------- UI ----------
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = R + 'assistant.css'; document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend', `
    <div class="fg" id="fmtGuide">
      <section class="fg-panel" id="fgPanel" role="dialog" aria-modal="false" aria-labelledby="fgTitle" hidden>
        <header class="fg-head"><span class="fg-dot" aria-hidden="true"></span><div><strong id="fgTitle">Site guide</strong><small>Find research, data and pages</small></div><button type="button" class="fg-x" id="fgClose" aria-label="Close the site guide">×</button></header>
        <div class="fg-log" id="fgLog" aria-live="polite"></div>
        <div class="fg-chips" id="fgChips"></div>
        <form class="fg-form" id="fgForm"><label class="fg-sr" for="fgInput">Ask the site guide</label><input id="fgInput" type="text" autocomplete="off" placeholder="e.g. remittances in Lesotho"><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>
        <p class="fg-note">Answers come from this website’s content.</p>
      </section>
      <button type="button" class="fg-btn" id="fgBtn" aria-expanded="false" aria-controls="fgPanel" aria-label="Site guide: need help finding something?" title="Need help finding something?"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Need help finding something?</span></button>
    </div>`);
  const $ = id => document.getElementById(id);
  // Lift the button while the homepage slider's controls are on screen, so it never covers them
  const heroBar = document.querySelector('.hx-bar');
  if (heroBar && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => document.getElementById('fmtGuide').classList.toggle('lift', e.isIntersecting)).observe(heroBar);
  const panel = $('fgPanel'), btn = $('fgBtn'), log = $('fgLog'), input = $('fgInput'), chips = $('fgChips');
  const START = ['Latest research', 'FinScope data', 'Programmes', 'Blogs', 'Gender', 'Remittances', 'Terms of reference', 'How can I donate?'];
  let greeted = false;
  const say = (html, who) => { log.insertAdjacentHTML('beforeend', `<div class="fg-msg ${who}">${html}</div>`); log.scrollTop = log.scrollHeight; };
  const setChips = list => { chips.innerHTML = list.map(c => `<button type="button" data-q="${esc(c)}">${esc(c)}</button>`).join(''); };
  function open() {
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); document.getElementById('fmtGuide').classList.add('on');
    load();
    if (!greeted) { greeted = true; say('Hi! Tell me what you’re looking for — a topic, a country or a type of content — and I’ll point you to it.', 'bot'); setChips(START); }
    setTimeout(() => input.focus(), 30);
  }
  function close() { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); document.getElementById('fmtGuide').classList.remove('on'); btn.focus(); }
  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  $('fgClose').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  chips.addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) ask(b.dataset.q); });
  $('fgForm').addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ''; ask(q); } });

  // ---------- Matching ----------
  const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const words = s => norm(s).replace(/[^a-z0-9&]+/g, ' ').split(' ').filter(w => w.length > 1 && !STOP.has(w));
  const stem = w => w.replace(/(ies)$/, 'y').replace(/(es|s)$/, '');
  function ask(q) {
    say(esc(q), 'me');
    const typing = document.createElement('div'); typing.className = 'fg-msg bot fg-typing'; typing.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(typing); log.scrollTop = log.scrollHeight;
    load().then(() => setTimeout(() => { typing.remove(); answer(q); }, 350));
  }
  function answer(q) {
    const nq = norm(q), ws = words(q).map(stem);
    const out = [];
    // Pages
    const pages = PAGES.filter(p => p.k.test(nq));
    // Countries mentioned
    const cs = Object.entries(COUNTRIES).filter(([, n]) => n.split('|').some(x => new RegExp('\\b' + norm(x) + '\\b').test(nq))).map(([c]) => c);
    // Themes / programmes / people mentioned
    const themes = (FEED.themes || []).filter(t => t.status !== 'archived' && (nq.includes(norm(t.name)) || words(t.name).map(stem).some(w => w.length > 3 && ws.includes(w))));
    const progs = (FEED.programmes || []).filter(p => nq.includes(norm(p.name)) || (p.slug.length > 2 && ws.includes(p.slug)) || words(p.name).filter(w => w.length > 4).map(stem).some(w => ws.includes(w)));
    const people = (FEED.people || []).filter(p => { const n = words(p.name.replace(/^(Dr|Prof)\.?\s+/, '')); return n.some(w => w.length > 2 && ws.includes(stem(w))); }).slice(0, 2);
    const latest = /latest|new|recent/.test(nq);
    const TH = Object.fromEntries((FEED.themes || []).map(t => [t.slug, t]));
    // Score Knowledge Hub items
    const score = it => {
      const hay = norm(it.t + ' ' + (it.s || '') + ' ' + it.y + ' ' + (it.th || []).map(s => TH[s] ? TH[s].name : '').join(' '));
      let s = 0;
      ws.forEach(w => { if (w.length < 3) return; if (norm(it.t).includes(w)) s += 3; else if (hay.includes(w)) s += 1; });
      if (cs.length && (it.c || []).some(c => cs.includes(c))) s += 3;
      if (themes.length && (it.th || []).some(t => themes.some(x => x.slug === t))) s += 3;
      if (progs.length && (it.pg || []).some(p => progs.some(x => x.slug === p))) s += 3;
      if (people.length && (it.au || []).some(a => people.some(x => x.slug === a))) s += 6;
      if (/blog/.test(nq) && it.y === 'Blog') s += 2; if (/video|webinar/.test(nq) && it.y === 'Video') s += 2; if (/report/.test(nq) && it.y === 'Report') s += 2;
      if (s) s += Math.max(0, 1 - (2026 - +(it.d || '2000').slice(0, 4)) / 10);
      return s;
    };
    const onlyLatest = latest && !ws.filter(w => !/^(latest|new|recent|research|content|publication|piece)$/.test(w)).length;
    let items = onlyLatest ? (FEED.items || []).slice(0, 3).map(i => [1, i]) : (FEED.items || []).map(i => [score(i), i]).filter(x => x[0] > 0);
    if (!onlyLatest) items.sort((a, b) => b[0] - a[0] || (b[1].d || '').localeCompare(a[1].d || ''));
    items = items.slice(0, 3).map(x => x[1]);

    const link = (href, title, sub, ext) => `<a class="fg-link" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</a>`;
    const itemLink = i => {
      const href = i.p ? (typeof i.p === 'string' ? `${R}knowledge-hub/${i.p}/` : `${R}knowledge-hub/post.html?id=${encodeURIComponent(i.id)}`) : asset(i.u) || `${R}knowledge-hub/index.html`;
      return link(href, i.t, `${i.y} · ${fmt(i.d)}`, !i.p && /^https?:|\.pdf$/i.test(href));
    };
    people.forEach(p => out.push(link(`${R}about/index.html?member=${encodeURIComponent(p.slug)}`, p.name, p.role)));
    progs.slice(0, 2).forEach(p => out.push(link(p.site || `${R}knowledge-hub/index.html?programme=${encodeURIComponent(p.slug)}`, p.name, p.site ? 'Programme site' : 'Programme research', /^https?:/.test(p.site || ''))));
    // Survey results: a country plus a year ("FinScope Ghana 2021") goes straight to that survey's results
    const yr = (nq.match(/\b(19|20)\d{2}\b/) || [])[0];
    const kind = /msme|small business|enterprise|sme/.test(nq) ? 'msme' : 'consumer';
    cs.filter(c => c !== 'SADC').forEach(c => {
      const sv = SURVEYS.filter(x => x.iso === c && (x.s === kind || !SURVEYS.some(y => y.iso === c && y.s === kind)));
      const hit = yr && sv.find(x => String(x.year) === yr);
      if (hit) out.push(link(`${R}data/survey.html?d=${hit.s}-${c}-${hit.year}`, `${hit.country} ${hit.year} survey results`, (hit.s === 'msme' ? 'FinScope MSME' : hit.kind === 'smallholder' ? 'CGAP smallholder survey' : 'FinScope Consumer') + ' · filter, compare and download'));
    });
    cs.slice(0, 2).forEach(c => out.push(c === 'SADC'
      ? link(`${R}knowledge-hub/index.html?country=SADC`, 'SADC regional research', 'Reports, blogs and videos on the region')
      : link(`${R}data/country.html#${c}`, `${COUNTRIES[c].split('|')[0]} data`, 'FinScope results, surveys and publications')));
    // Open Terms of Reference that match
    const today = new Date().toISOString().slice(0, 10);
    const torPage = /terms of reference|\btors?\b|tender|expression of interest|\beoi\b|consultan|procure|rfp|proposal/.test(nq);
    (FEED.tors || []).filter(t => !t.closing || t.closing >= today).filter(t => torPage || ws.some(w => w.length > 3 && norm(t.title).includes(w)))
      .slice(0, 2).forEach(t => out.unshift(link(t.document || `${R}terms-of-reference/index.html`, t.title, `${t.type}${t.closing ? ' · closes ' + fmt(t.closing) : ''}`, /^https?:/.test(t.document || ''))));
    pages.slice(0, 2).forEach(p => out.push(link(p.u.startsWith('#') ? p.u : R + p.u, p.t, p.d)));
    const hubQ = new URLSearchParams();
    if (themes.length === 1) hubQ.set('theme', themes[0].slug); else if (ws.length) hubQ.set('q', q);
    if (cs.length === 1) hubQ.set('country', cs[0]);

    if (torPage) items = [];  // a ToR question gets the open calls and the ToR page, not loosely matching research
    let html = '';
    if (items.length) html += `<p>${pages.length || cs.length || progs.length || people.length ? 'Here’s where to look:' : 'These look relevant:'}</p>` + out.slice(0, 3).join('') + items.map(itemLink).join('')
      + `<a class="fg-more" href="${R}knowledge-hub/index.html?${hubQ}">See more in the Knowledge Hub →</a>`;
    else if (out.length) html += '<p>Try these:</p>' + out.slice(0, 4).join('');
    else html += `<p>I couldn’t find a close match. Try a topic like <em>gender</em>, <em>remittances</em> or <em>FinScope</em>, or a country name.</p><a class="fg-more" href="${R}knowledge-hub/index.html?q=${encodeURIComponent(q)}">Search the Knowledge Hub for “${esc(q)}” →</a>`;
    say(html, 'bot');
    const next = [...new Set([...(themes[0] ? [] : ['Gender', 'Remittances', 'Digital payments']), ...(cs[0] ? [] : ['South Africa', 'Malawi']), 'Latest research', 'Contact us'])].slice(0, 5);
    setChips(next);
  }
})();
