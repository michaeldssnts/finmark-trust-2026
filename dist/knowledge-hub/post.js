/* Blog and article pages: knowledge-hub/post.html?id=<content id>
 * Reads posts/<id>.json (written by scripts/build-knowledge.mjs from the CMS "Full text") and knowledge.json
 * (theme names and related items). Blogs get a magazine layout; articles and media releases a newsroom layout. */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asset = p => (p && p.startsWith('/uploads/') ? '..' + p : p);
  const PLACES = { AGO: 'Angola', BWA: 'Botswana', COM: 'Comoros', COD: 'DR Congo', SWZ: 'Eswatini', LSO: 'Lesotho', MDG: 'Madagascar', MWI: 'Malawi', MUS: 'Mauritius', MOZ: 'Mozambique', NAM: 'Namibia', SYC: 'Seychelles', ZAF: 'South Africa', TZA: 'Tanzania', ZMB: 'Zambia', ZWE: 'Zimbabwe', SADC: 'SADC region' };
  const fmt = d => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  const slug = s => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const initials = n => n.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const id = new URLSearchParams(location.search).get('id');

  function fail(msg) {
    $('main').innerHTML = `<section class="container ps-missing"><p class="eyebrow">Knowledge Hub</p><h1>${esc(msg)}</h1><p><a class="primary-btn" href="index.html">Back to the Knowledge Hub</a></p></section>`;
  }
  if (!id) return fail('This page needs an item to show.');

  Promise.all([
    fetch('posts/' + encodeURIComponent(id) + '.json').then(r => { if (!r.ok) throw 0; return r.json(); }),
    fetch('knowledge.json').then(r => r.json()).catch(() => ({ themes: [], programmes: [], items: [] }))
  ]).then(([p, feed]) => render(p, feed)).catch(() => fail('Sorry, we couldn’t find that page.'));

  function render(p, feed) {
    const TH = Object.fromEntries((feed.themes || []).map(t => [t.slug, t]));
    const PG = Object.fromEntries((feed.programmes || []).map(t => [t.slug, t]));
    const isBlog = p.y === 'Blog';
    document.title = `${p.t} — FinMark Trust`;
    document.body.classList.add(isBlog ? 'ps-blog' : 'ps-news');

    // Body: give section headings anchors, mark the opening paragraph, and spot a media-contact paragraph
    const body = document.createElement('div');
    body.innerHTML = p.html;
    const toc = [];
    body.querySelectorAll('h2').forEach(h => { h.id = slug(h.textContent) || 'section-' + toc.length; toc.push([h.id, h.textContent]); });
    const first = body.querySelector('p');
    if (first) { first.classList.add('ps-lead'); }
    body.querySelectorAll('p').forEach(el => { if (/^(for more information|media (enquiries|contact)|contact:)/i.test(el.textContent.trim())) el.classList.add('ps-contact'); });

    // Staff authors (picked in the CMS) link to their profile; other authors are plain text
    const staff = (p.authors || []).map(a => ({ ...a, href: `../about/index.html?member=${encodeURIComponent(a.slug)}` }));
    const others = (p.a || '').split(/\s*(?:,|&|\band\b)\s*/).filter(Boolean).map(name => ({ name }));
    const people = [...staff, ...others];
    const authors = people.map(a => a.name);
    const joinNames = arr => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
    const nameHtml = joinNames(people.map(a => a.href ? `<a class="ps-author" href="${a.href}">${esc(a.name)}</a>` : esc(a.name)));
    const avatar = a => {
      const inner = a.photo ? `<img src="${esc(a.photo)}" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('${esc(initials(a.name))}'))">` : esc(initials(a.name));
      return a.href ? `<a href="${a.href}" tabindex="-1">${inner}</a>` : `<i>${inner}</i>`;
    };
    const tags = [
      ...(p.th || []).map(s => TH[s] && `<a class="ps-tag th" style="--tc:${TH[s].colour}" href="index.html?theme=${encodeURIComponent(s)}">${esc(TH[s].name)}</a>`),
      ...(p.pg || []).filter(s => PG[s] && !(p.th || []).some(t => TH[t] && TH[t].name === PG[s].name)).map(s => `<a class="ps-tag pg" href="index.html?programme=${encodeURIComponent(s)}">${esc(PG[s].name)}</a>`),
      ...(() => { const cs = (p.c || []).filter(c => c !== 'SADC'); return cs.length > 4 ? [`<span class="ps-tag place">SADC region · ${cs.length} countries</span>`] : cs.map(c => `<span class="ps-tag place">${esc(PLACES[c] || c)}</span>`); })()
    ].filter(Boolean).join('');
    const byline = `<div class="ps-byline">
        ${people.length ? `<span class="ps-avatars" aria-hidden="true">${people.map(avatar).join('')}</span>` : ''}
        <span>${people.length ? `<span class="ps-by">Written by <b>${nameHtml}</b></span>` : ''}
        <span class="ps-when"><time datetime="${esc(p.d)}">${fmt(p.d)}</time><span aria-hidden="true">·</span>${p.mins} min read</span></span>
      </div>`;
    const url = location.href;
    const share = `<div class="ps-share"><span>Share</span>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Share on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.02-3-1.83-3-1.83 0-2.12 1.43-2.12 2.9V21h-4V9Z"/></svg></a>
        <a href="https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.t)}" target="_blank" rel="noopener" aria-label="Share on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg></a>
        <a href="mailto:?subject=${encodeURIComponent(p.t)}&body=${encodeURIComponent(url)}" aria-label="Share by email"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm2 2v.5l7 4.6 7-4.6V7H5Zm14 2.9-7 4.6-7-4.6V17h14V9.9Z"/></svg></a>
        <button type="button" data-copy aria-label="Copy link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 1 1 4.2 4.2l-2 2-1.4-1.4 2-2a1 1 0 1 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0ZM13.4 10.6a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 1 1-4.2-4.2l2-2 1.4 1.4-2 2a1 1 0 1 0 1.4 1.4L12 10.6a1 1 0 0 1 1.4 0Z"/></svg></button>
        <em class="ps-copied" hidden>Link copied</em></div>`;
    const tocHtml = toc.length > 1 ? `<nav class="ps-toc" aria-label="On this page"><p>On this page</p><ol>${toc.map(([h, t]) => `<li><a href="#${h}">${esc(t)}</a></li>`).join('')}</ol></nav>` : '';
    const img = p.img ? asset(p.img) : '';
    const crumbs = `<div class="breadcrumbs"><a href="../index.html">Home</a><span>/</span><a href="index.html">Knowledge Hub</a><span>/</span><a href="index.html?type=${encodeURIComponent(p.y)}">${isBlog ? 'Blog' : esc(p.y) + 's'}</a></div>`;

    // Related: same programme or theme first, then same type
    const items = (feed.items || []).filter(i => i.id !== p.id);
    const score = i => (i.pg || []).filter(x => (p.pg || []).includes(x)).length * 3 + (i.th || []).filter(x => (p.th || []).includes(x)).length * 2 + (i.y === p.y ? 1 : 0) + (i.img ? 0.5 : 0);
    const related = items.map(i => [score(i), i]).filter(([s]) => s >= 2).sort((a, b) => b[0] - a[0] || (b[1].d || '').localeCompare(a[1].d || '')).slice(0, 3).map(x => x[1]);
    const relCard = i => {
      const href = i.p ? `post.html?id=${encodeURIComponent(i.id)}` : asset(i.u);
      const ext = !i.p && (/^https?:/.test(i.u) || /\.pdf$/i.test(i.u));
      const rt = (i.th || []).map(s => TH[s]).find(Boolean);
      return `<a class="ps-rel" style="--tc:${rt ? rt.colour : 'var(--teal)'}" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>
        <span class="ps-rel-img${i.img ? '' : ' none'}">${i.img ? `<img src="${esc(asset(i.img))}" alt="" loading="lazy">` : `<b>${esc(i.y)}</b>`}</span>
        <span class="ps-rel-meta">${esc(i.y)} · ${fmt(i.d)}${rt ? ` · <span>${esc(rt.name)}</span>` : ''}</span><strong>${esc(i.t)}</strong></a>`;
    };
    const relHtml = related.length ? `<section class="ps-related"><div class="container"><div class="ps-related-head"><h2>Related reading</h2><a href="index.html">Browse the Knowledge Hub →</a></div><div class="ps-related-grid">${related.map(relCard).join('')}</div></div></section>` : '';

    let html;
    if (isBlog) {
      html = `
      <header class="ps-hero">
        ${img ? `<div class="ps-banner"><img src="${esc(img)}" alt=""></div>` : '<div class="ps-banner none"></div>'}
        <div class="container"><div class="ps-titlecard">
          ${crumbs}
          <p class="eyebrow">Blog</p>
          <h1>${esc(p.t)}</h1>
          <div class="ps-meta-row">${byline}${share}</div>
          ${tags ? `<div class="ps-tags">${tags}</div>` : ''}
        </div></div>
      </header>
      <div class="container ps-layout wide">
        ${tocHtml}
        <article class="ps-body" id="psBody"></article>
      </div>`;
    } else {
      html = `
      <header class="ps-newshead">
        <div class="container">
          ${crumbs}
          <p class="eyebrow light">${esc(p.y)}</p>
          <h1>${esc(p.t)}</h1>
          ${byline}
        </div>
      </header>
      ${img ? `<div class="container ps-figure"><figure><img src="${esc(img)}" alt=""></figure></div>` : ''}
      <div class="container ps-layout news">
        <article class="ps-body" id="psBody"></article>
        <aside class="ps-facts">
          <dl>
            <div><dt>Published</dt><dd>${fmt(p.d)}</dd></div>
            ${people.length ? `<div><dt>Written by</dt><dd>${nameHtml}</dd></div>` : ''}
            <div><dt>Reading time</dt><dd>${p.mins} minutes</dd></div>
            ${tags ? `<div><dt>Topics</dt><dd class="ps-tags">${tags}</dd></div>` : ''}
          </dl>
          ${(p.sec === 'data' || p.sec === 'both') ? `<a class="ps-data" href="../data/index.html"><b>Explore the data</b><span>Charts and tables from FinScope and our other surveys</span></a>` : ''}
          ${share}
        </aside>
      </div>`;
    }
    html += `<div class="container ps-back"><a href="index.html">← Back to the Knowledge Hub</a></div>` + relHtml;
    $('main').innerHTML = html;
    const lead = (p.th || []).map(s => TH[s]).find(Boolean);
    if (lead) $('main').style.setProperty('--tc', lead.colour);
    $('psBody').appendChild(body);
    $('psBody').querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });

    // Copy link
    document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => {
        const n = b.parentElement.querySelector('.ps-copied'); n.hidden = false; setTimeout(() => (n.hidden = true), 2000);
      }).catch(() => {});
    }));
    // Reading progress and the active contents link
    const bar = $('psProgress'), art = $('psBody'), links = [...document.querySelectorAll('.ps-toc a')];
    const heads = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
    const onScroll = () => {
      const r = art.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
      bar.style.width = Math.max(0, Math.min(100, (-r.top / Math.max(1, total)) * 100)) + '%';
      let cur = -1; heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top < 140) cur = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === cur));
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
})();
