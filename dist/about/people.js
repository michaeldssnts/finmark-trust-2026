/* About page: team and trustee cards come from the content manager (People), via the Knowledge Hub feed.
   The cards already in the HTML stay as a fallback if the feed cannot load.
   Each card links to the person's profile (person.html?id=…) and shows how many Knowledge Hub pieces they wrote. */
(function () {
  const team = document.querySelector('.team-grid'), trustees = document.querySelector('.trustee-cards');
  if (!team) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asset = p => (p && p.startsWith('/uploads/') ? '..' + p : p);
  fetch('../knowledge-hub/knowledge.json').then(r => r.json()).then(feed => {
    const people = (feed.people || []).filter(p => !p.hidden);
    if (!people.length) return;
    const n = {};
    (feed.items || []).forEach(i => (i.au || []).forEach(s => (n[s] = (n[s] || 0) + 1)));
    const card = (p, trustee) => {
      const href = `person.html?id=${encodeURIComponent(p.slug)}`;
      const count = n[p.slug] || 0;
      return `<article class="person-card${trustee ? ' trustee-card' : ''}" id="person-${esc(p.slug)}">`
        + `<a class="person-photo" href="${href}" tabindex="-1" aria-hidden="true">${p.photo ? `<img src="${esc(asset(p.photo))}" alt="" loading="lazy">` : '<span class="person-noimg"></span>'}</a>`
        + `<div class="person-card-body"><h3><a href="${href}">${esc(p.name)}</a></h3><p class="person-role">${esc(p.role)}</p>`
        + (p.bio ? `<details><summary>Read biography</summary><p>${esc(p.bio).replace(/\n\n/g, '</p><p>')}</p></details>` : '')
        + `<a class="person-link" href="${href}">${count ? `View profile <span class="person-count">${count} piece${count === 1 ? '' : 's'}</span>` : 'View profile'} <span aria-hidden="true">→</span></a>`
        + `</div></article>`;
    };
    team.innerHTML = people.filter(p => p.group !== 'trustee').map(p => card(p, false)).join('');
    if (trustees) trustees.innerHTML = people.filter(p => p.group === 'trustee').map(p => card(p, true)).join('');
  }).catch(() => {});
})();
