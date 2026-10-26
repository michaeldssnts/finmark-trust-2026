/* About page: team and trustee cards come from the content manager (People), via the Knowledge Hub feed.
   The cards already in the HTML stay as a fallback if the feed cannot load.
   Clicking a card opens that person's biography in a popup (no separate page).
   The address changes to about/index.html?member=<name> while it is open — the same format as the old website,
   so old links and shared links open the right popup. */
(function () {
  const team = document.querySelector('.team-grid'), trustees = document.querySelector('.trustee-cards');
  if (!team) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asset = p => (p && p.startsWith('/uploads/') ? '..' + p : p);
  const fmt = d => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const OLD = { 'robert-michael-berkowitz': 'bobby-berkowitz' };   // old website names that changed
  const plain = n => n.replace(/^(Dr|Prof)\.?\s+/, '');
  const initials = n => plain(n).split(/\s+/).map(w => w[0]).slice(0, 2).join('');
  let PEOPLE = [], ITEMS = [], TH = {}, lastFocus = null;

  // ---------- popup ----------
  document.body.insertAdjacentHTML('beforeend', `<dialog class="bio-modal" id="bioModal" aria-labelledby="bioName"><div class="bio-inner"></div></dialog>`);
  const dlg = document.getElementById('bioModal'), inner = dlg.querySelector('.bio-inner');
  const urlFor = slug => `${location.pathname}?member=${encodeURIComponent(slug)}`;

  function open(slug, push) {
    const p = PEOPLE.find(x => x.slug === (OLD[slug] || slug));
    if (!p) return false;
    const first = plain(p.name).split(' ')[0];
    const work = ITEMS.filter(i => (i.au || []).includes(p.slug));
    const piece = i => {
      const t = (i.th || []).map(s => TH[s]).find(Boolean);
      const href = i.p ? (typeof i.p === 'string' ? `../knowledge-hub/${i.p}/` : `../knowledge-hub/post.html?id=${encodeURIComponent(i.id)}`) : asset(i.u) || '../knowledge-hub/index.html';
      const ext = !i.p && (/^https?:/.test(href) || /\.pdf$/i.test(href));
      return `<li><a href="${esc(href)}"${t ? ` style="--tc:${t.colour}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>
        <span class="bio-th">${i.img ? `<img src="${esc(asset(i.img))}" alt="" loading="lazy">` : ''}</span>
        <span><small>${esc(i.y)} · ${fmt(i.d)}</small><strong>${esc(i.t)}</strong></span></a></li>`;
    };
    inner.innerHTML = `
      <button type="button" class="bio-close" aria-label="Close biography">×</button>
      <div class="bio-head">
        <div class="bio-photo">${p.photo ? `<img src="${esc(asset(p.photo))}" alt="${esc(p.name)}" onerror="this.replaceWith(document.createTextNode('${esc(initials(p.name))}'))">` : esc(initials(p.name))}</div>
        <div><p class="bio-kicker">${p.group === 'trustee' ? 'Trustee' : 'FinMark Trust team'}</p><h2 id="bioName">${esc(p.name)}</h2><p class="bio-role">${esc(p.role)}</p>
          ${p.email || p.linkedin ? `<div class="bio-links">${p.email ? `<a data-m="${esc(p.email)}" data-mk>Email ${esc(first)}</a>` : ''}${p.linkedin ? `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ''}</div>` : ''}</div>
      </div>
      <div class="bio-text">${p.bioHtml || (p.bio ? '<p>' + esc(p.bio).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>' : '<p class="none">Biography coming soon.</p>')}</div>
      ${work.length ? `<div class="bio-work"><h3>Written by ${esc(first)} <span>${work.length}</span></h3><ul>${work.map(piece).join('')}</ul></div>` : ''}`;
    if (!dlg.open) { lastFocus = document.activeElement; dlg.showModal(); document.body.classList.add('lock'); }
    inner.scrollTop = 0;
    if (push) history.pushState({ member: p.slug }, '', urlFor(p.slug));
    document.title = `${p.name} — FinMark Trust`;
    return true;
  }
  const baseTitle = document.title;
  function close(fromHistory) {
    if (!dlg.open) return;
    dlg.close();
  }
  dlg.addEventListener('close', () => {
    document.body.classList.remove('lock');
    document.title = baseTitle;
    if (new URLSearchParams(location.search).get('member')) history.replaceState({}, '', location.pathname + location.hash);
    if (lastFocus) lastFocus.focus();
  });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.bio-close')) close(); });
  window.addEventListener('popstate', () => {
    const m = new URLSearchParams(location.search).get('member');
    if (m) open(m, false); else if (dlg.open) { dlg.close(); }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-member]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open(a.dataset.member, true);
  });

  // ---------- cards ----------
  fetch('../knowledge-hub/knowledge.json').then(r => r.json()).then(feed => {
    PEOPLE = (feed.people || []).filter(p => !p.hidden);
    ITEMS = feed.items || [];
    TH = Object.fromEntries((feed.themes || []).map(t => [t.slug, t]));
    if (!PEOPLE.length) return;
    const n = {};
    ITEMS.forEach(i => (i.au || []).forEach(s => (n[s] = (n[s] || 0) + 1)));
    const card = (p, trustee) => {
      const href = urlFor(p.slug), count = n[p.slug] || 0;
      return `<article class="person-card${trustee ? ' trustee-card' : ''}" id="person-${esc(p.slug)}">`
        + `<a class="person-photo" href="${href}" data-member="${esc(p.slug)}" tabindex="-1" aria-hidden="true">${p.photo ? `<img src="${esc(asset(p.photo))}" alt="" loading="lazy">` : '<span class="person-noimg"></span>'}</a>`
        + `<div class="person-card-body"><h3><a href="${href}" data-member="${esc(p.slug)}">${esc(p.name)}</a></h3><p class="person-role">${esc(p.role)}</p>`
        + `<a class="person-link" href="${href}" data-member="${esc(p.slug)}">Read biography${count ? ` <span class="person-count">${count} piece${count === 1 ? '' : 's'}</span>` : ''} <span aria-hidden="true">→</span></a>`
        + `</div></article>`;
    };
    team.innerHTML = PEOPLE.filter(p => p.group !== 'trustee').map(p => card(p, false)).join('');
    if (trustees) trustees.innerHTML = PEOPLE.filter(p => p.group === 'trustee').map(p => card(p, true)).join('');
    const m = new URLSearchParams(location.search).get('member');
    if (m && !open(m, false)) history.replaceState({}, '', location.pathname + '#team');
  }).catch(() => {});
})();
