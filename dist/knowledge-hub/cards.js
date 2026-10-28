/* Knowledge Hub content card: one design used everywhere a piece is listed
   (Knowledge Hub, country pages). Styles live in knowledge-hub/hub.css (.kh-card, .kh-tag, .kh-results). */
window.FMTCards = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PLACES = { AGO: 'Angola', BWA: 'Botswana', COD: 'DR Congo', SWZ: 'Eswatini', LSO: 'Lesotho', MDG: 'Madagascar', MWI: 'Malawi', MUS: 'Mauritius', MOZ: 'Mozambique', NAM: 'Namibia', SYC: 'Seychelles', ZAF: 'South Africa', TZA: 'Tanzania', ZMB: 'Zambia', ZWE: 'Zimbabwe', SADC: 'SADC region',
    BEN: 'Benin', BFA: 'Burkina Faso', KHM: 'Cambodia', CMR: 'Cameroon', GMB: 'Gambia', GHA: 'Ghana', HTI: 'Haiti', IND: 'India', KEN: 'Kenya', LAO: 'Laos', MEX: 'Mexico', MMR: 'Myanmar', NPL: 'Nepal', NGA: 'Nigeria', RWA: 'Rwanda', THA: 'Thailand', TGO: 'Togo', UGA: 'Uganda' };
  const LANGS = { en: 'English', pt: 'Portuguese', fr: 'French' };
  const TYPE_LOOK = {
    Report: ['#213265', '▤'], 'Pocket guide': ['#0098ae', '▭'], Presentation: ['#2b4a8a', '▷'], Dashboard: ['#00997b', '▥'],
    Article: ['#0d6f80', '¶'], Blog: ['#00806a', '✎'], 'Media release': ['#142044', '❝'], Video: ['#0a7f93', '▶'],
    Podcast: ['#1b5e74', '◉'], Interview: ['#00997b', '❞'], Infographic: ['#b9801a', '◔']
  };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = d => { const [y, m, dd] = (d || '').split('-'); return y ? `${dd ? +dd + ' ' : ''}${m ? MONTHS[+m - 1] + ' ' : ''}${y}` : 'Undated'; };
  const themeMap = themes => { const TH = {}; (themes || []).forEach(t => { TH[t.slug] = t; }); return TH; };

  // o.TH: themes by slug · o.root: path to the site root ('..' from a folder page) · o.base: path to knowledge-hub/ from the page
  // o.hl: optional highlighter for search terms · o.featured: large card · o.badge: extra label, e.g. 'Regional'
  function card(it, o = {}) {
    const TH = o.TH || {}, root = o.root ?? '..', base = o.base ?? '', hl = o.hl || esc;
    const asset = p => (p && p.startsWith('/uploads/') ? root + p : p);
    const year = it.year ?? (it.d ? it.d.slice(0, 4) : '');
    const arch = it.isArch ?? (!!it.ar || (it.th.length > 0 && it.th.every(s => TH[s] && TH[s].status === 'archived')));
    const [col, ic] = TYPE_LOOK[it.y] || TYPE_LOOK.Report;
    const ext = /^https?:/.test(it.u) && !/^https?:\/\/(www\.)?finmark\.org\.za/.test(it.u);
    const themes = it.th.slice(0, 2).map(s => TH[s] ? `<span class="kh-tag th ${TH[s].status === 'archived' ? 'archived' : TH[s].pathway}" style="--tc:${TH[s].colour}">${esc(TH[s].name)}</span>` : '').join('');
    const places = it.c.filter(c => c !== 'SADC').slice(0, 2).map(c => `<span class="kh-tag place">${esc(PLACES[c] || c)}</span>`).join('') + (it.c.length > 3 ? `<span class="kh-tag place">+${it.c.length - 2}</span>` : '');
    const badge = o.badge ? `<span class="kh-tag place">${esc(o.badge)}</span>` : '';
    // Blogs and articles with full text open their own page on this site
    const tag = it.p || it.u ? 'a' : 'div';
    const attrs = it.p ? ` href="${base}${typeof it.p === 'string' ? it.p + '/' : 'post.html?id=' + encodeURIComponent(it.id)}"` : it.u ? ` href="${esc(asset(it.u))}"${ext || /\.pdf/i.test(it.u) ? ' target="_blank" rel="noopener"' : ''}` : '';
    const tc = it.th.map(s => TH[s]).find(Boolean);
    return `<${tag} class="kh-card${o.featured ? ' kh-feat' : ''}${tc ? ' has-tc' : ''}"${tc ? ` style="--tc:${tc.colour}"` : ''}${attrs}>
      <span class="kh-cover${arch ? ' pt-arch' : ''}${it.img ? ' has-img' : ''}" style="--c:${col};background:${col}" aria-hidden="true">${it.img ? `<img class="bg" src="${esc(asset(it.img))}" alt="" loading="lazy"><img class="fg" src="${esc(asset(it.img))}" alt="" loading="lazy">` : ''}<span class="t">${esc(it.y)}</span><span class="ic">${ic}</span><span class="yr">${year}</span></span>
      <span class="kh-cbody"><span class="kh-meta"><span>${esc(it.y)}</span><span>${fmtDate(it.d)}</span>${it.l && it.l !== 'en' ? `<span class="lang">${LANGS[it.l]}</span>` : ''}${arch ? '<span>Archive</span>' : ''}</span>
      <h3>${hl(it.t)}</h3>${it.s ? `<p class="s">${hl(it.s)}</p>` : ''}<span class="kh-tags">${badge}${themes}${places}</span></span></${tag}>`;
  }
  return { card, themeMap, fmtDate, PLACES, TYPE_LOOK };
})();
