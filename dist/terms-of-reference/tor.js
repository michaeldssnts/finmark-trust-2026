/* Terms of Reference page — calls come from the content manager (Terms of Reference collection) via the Knowledge Hub feed.
   A call is open until the end of its closing date (South African time); calls without a closing date stay open. */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asset = p => (p && p.startsWith('/uploads/') ? '..' + p : p);
  const fmt = d => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  const TYPES = [['Expression of interest', 'Expressions of interest'], ['Terms of reference', 'Terms of reference'], ['Position', 'Available positions'], ['Consultancy', 'Consultant work']];
  const S = { type: '', status: 'open' };
  let CALLS = [], PG = {};
  const daysLeft = c => (c.closing ? Math.ceil((new Date(c.closing + 'T23:59:59+02:00') - Date.now()) / 86400000) : Infinity);
  const isOpen = c => daysLeft(c) >= 0;

  fetch('../knowledge-hub/knowledge.json').then(r => r.json()).then(feed => {
    PG = Object.fromEntries((feed.programmes || []).map(p => [p.slug, p]));
    // A call with a future published date stays hidden until that day
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' });
    CALLS = (feed.tors || []).filter(c => !c.published || c.published <= today).map(c => ({ ...c, open: isOpen(c), left: daysLeft(c) }));
    const p = new URLSearchParams(location.search);
    if (p.get('type')) S.type = p.get('type');
    if (['open', 'closed', 'all'].includes(p.get('status'))) S.status = p.get('status');
    if (!CALLS.some(c => c.open) && S.status === 'open' && !p.get('status')) S.status = CALLS.length ? 'all' : 'open';
    render();
  }).catch(() => { $('trList').innerHTML = '<li class="tr-empty">The list couldn’t load. Please refresh the page.</li>'; });

  function render() {
    const pool = CALLS.filter(c => S.status === 'all' || (S.status === 'open' ? c.open : !c.open));
    $('trTypes').innerHTML = [['', 'All types']].concat(TYPES).map(([v, l]) => {
      const n = v ? pool.filter(c => c.type === v).length : pool.length;
      return `<button type="button" data-type="${esc(v)}" aria-pressed="${S.type === v}"${n || !v ? '' : ' class="zero"'}>${esc(l)} <small>${n}</small></button>`;
    }).join('');
    document.querySelectorAll('[data-status]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.status === S.status)));
    const list = pool.filter(c => !S.type || c.type === S.type)
      .sort((a, b) => (a.open === b.open ? (a.open ? a.left - b.left : (b.closing || '').localeCompare(a.closing || '')) : a.open ? -1 : 1));
    $('trList').innerHTML = list.length ? list.map(card).join('') : `<li class="tr-empty"><b>${S.status === 'open' ? 'There are no open calls right now.' : 'Nothing to show here.'}</b>New expressions of interest, TORs and positions are posted here first. Check back soon, or <a href="#footer">sign up to our newsletter</a> to hear about new calls.${S.status === 'open' && CALLS.length ? ' <button type="button" class="tr-link" data-status="closed">See closed calls</button>' : ''}</li>`;
  }

  function card(c) {
    const pg = PG[c.programme];
    const status = !c.open ? '<span class="tr-pill closed">Closed</span>'
      : c.left === Infinity ? '<span class="tr-pill open">Open</span>'
      : c.left <= 7 ? `<span class="tr-pill soon">Closes ${c.left === 0 ? 'today' : `in ${c.left} day${c.left === 1 ? '' : 's'}`}</span>`
      : `<span class="tr-pill open">Open · ${c.left} days left</span>`;
    const doc = c.document ? asset(c.document) : '';
    const typeLabel = (TYPES.find(t => t[0] === c.type) || [c.type, c.type])[0];
    return `<li><article class="tr-card${c.open ? '' : ' is-closed'}">
      <div class="tr-thumb">${c.image ? `<img src="${esc(asset(c.image))}" alt="" loading="lazy" onerror="this.remove()">` : ''}<span>${esc(typeLabel)}</span></div>
      <div class="tr-main">
        <div class="tr-meta">${status}${pg ? `<a class="tr-prog" href="../knowledge-hub/index.html?programme=${encodeURIComponent(pg.slug)}">${esc(pg.name)}</a>` : ''}</div>
        <h2>${doc ? `<a href="${esc(doc)}" target="_blank" rel="noopener">${esc(c.title)}</a>` : esc(c.title)}</h2>
        ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}
        <dl class="tr-dates">${c.published ? `<div><dt>Published</dt><dd>${fmt(c.published)}</dd></div>` : ''}<div><dt>Closing date</dt><dd>${c.closing ? fmt(c.closing) : 'Open until filled'}</dd></div></dl>
        <div class="tr-actions">${doc ? `<a class="primary-btn" href="${esc(doc)}" target="_blank" rel="noopener">${/\.pdf(\?|$)/i.test(doc) ? 'Download the TOR (PDF)' : 'View the TOR'} <span aria-hidden="true">↓</span></a>` : ''}${c.contact && c.open ? `<a class="secondary-btn" data-m="${esc(c.contact)}" data-mk data-ms="${esc(c.title)}">Email your submission</a>` : ''}</div>
      </div>
    </article></li>`;
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-type]'); if (t) { S.type = t.dataset.type; render(); }
    const s = e.target.closest('[data-status]'); if (s) { S.status = s.dataset.status; render(); }
  });
})();
