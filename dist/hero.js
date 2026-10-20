const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Homepage hero — pathway slider */
(() => {
  const hero = document.querySelector('.hx');
  if (!hero) return;
  const viewport = hero.querySelector('.hx-viewport');
  const track = hero.querySelector('.hx-track');
  const slides = [...hero.querySelectorAll('.hx-slide')];
  const tabs = [...hero.querySelectorAll('.hx-tab')];
  const steps = [...hero.querySelectorAll('[data-hx-step]')];
  const pauseBtn = hero.querySelector('.hx-pause');
  let index = 0;
  let userPaused = reducedMotion;
  let hovering = false;
  let focusWithin = false;

  function syncPaused() {
    hero.classList.toggle('is-user-paused', userPaused);
    hero.classList.toggle('is-paused', userPaused || hovering || focusWithin);
    viewport.setAttribute('aria-live', userPaused ? 'polite' : 'off');
    pauseBtn.setAttribute('aria-label', userPaused ? 'Start automatic rotation' : 'Pause automatic rotation');
  }

  function go(next, { focusTab = false } = {}) {
    index = (next + slides.length) % slides.length;
    hero.dataset.active = String(index);
    track.style.transform = `translateX(${-100 * index}%)`;
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-active', on);
      slide.inert = !on;
      slide.setAttribute('aria-hidden', String(!on));
    });
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      const bar = tab.querySelector('.hx-tab-progress i');
      bar.style.animation = 'none';
      void bar.offsetWidth; // restart the progress animation
      bar.style.animation = '';
      if (on && focusTab) tab.focus();
    });
  }

  // Auto-advance when the active tab's progress bar completes
  tabs.forEach((tab) => {
    tab.querySelector('.hx-tab-progress i').addEventListener('animationend', () => {
      if (tab.classList.contains('is-active') && !userPaused) go(index + 1);
    });
    tab.addEventListener('click', () => go(Number(tab.dataset.index)));
    tab.addEventListener('keydown', (event) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        go(event.key === 'Home' ? 0 : slides.length - 1, { focusTab: true });
      } else if (keys[event.key]) {
        event.preventDefault();
        go(index + keys[event.key], { focusTab: true });
      }
    });
  });

  steps.forEach((btn) => btn.addEventListener('click', () => go(index + Number(btn.dataset.hxStep))));

  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    syncPaused();
    if (!userPaused) go(index); // restart timer from zero
  });

  // Pause while the visitor is reading or interacting
  hero.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; syncPaused(); } });
  hero.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hovering = false; syncPaused(); } });
  hero.addEventListener('focusin', () => { focusWithin = true; syncPaused(); });
  hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) { focusWithin = false; syncPaused(); } });

  // Swipe between pathways on touch screens
  let startX = null;
  let startY = 0;
  let swiped = false;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    startX = e.clientX; startY = e.clientY; swiped = false;
  });
  viewport.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      swiped = true;
      go(index + (dx < 0 ? 1 : -1));
    }
  });
  viewport.addEventListener('pointercancel', () => { startX = null; });
  viewport.addEventListener('click', (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true);

  // Pause when the hero is off-screen or the tab is hidden
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      hero.classList.toggle('is-offscreen', !entry.isIntersecting);
    }, { threshold: 0.25 }).observe(hero);
  }

  syncPaused();
  go(0);
})();

const knowledgeRail = document.querySelector('#knowledge-rail');
const railButtons = [...document.querySelectorAll('[data-rail-direction]')];

function updateRailButtons() {
  if (!knowledgeRail) return;
  const maxScroll = knowledgeRail.scrollWidth - knowledgeRail.clientWidth;
  railButtons.forEach((button) => {
    const direction = Number(button.dataset.railDirection);
    button.disabled = direction < 0 ? knowledgeRail.scrollLeft <= 4 : knowledgeRail.scrollLeft >= maxScroll - 4;
  });
}

railButtons.forEach((button) => {
  button.addEventListener('click', () => {
    knowledgeRail?.scrollBy({
      left: Number(button.dataset.railDirection) * Math.min(knowledgeRail.clientWidth * 0.8, 720),
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  });
});

knowledgeRail?.addEventListener('scroll', updateRailButtons, { passive: true });
window.addEventListener('resize', updateRailButtons);
updateRailButtons();

/* ---- Latest content on each slide: chosen in the content manager (Featured content), else the newest ----
   The cards in the HTML stay as a fallback if the feed cannot load. */
(function fillSlideCards() {
  const asides = { gbl: document.querySelector('#hx-panel-gbl .hx-latest'), data: document.querySelector('#hx-panel-data .hx-latest'), programmes: document.querySelector('#hx-panel-programmes .hx-latest') };
  if (!asides.gbl && !asides.data && !asides.programmes) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (d) => { const [y, m, dd] = (d || '').split('-'); return y ? `${dd ? String(+dd).padStart(2, '0') + ' ' : ''}${m ? M[+m - 1] + ' ' : ''}${y}` : ''; };
  const asset = (p) => (p && p.startsWith('/uploads/') ? p.slice(1) : p);
  const THUMB = { Video: 'thumb-video', Podcast: 'thumb-video', Interview: 'thumb-video', Blog: 'thumb-blog', Article: 'thumb-article', 'Media release': 'thumb-article', Report: 'thumb-report' };
  const CTA = { Video: 'Watch video', Podcast: 'Listen', Interview: 'Watch interview', Article: 'Read article', Blog: 'Read blog', Report: 'View report', Presentation: 'View slides', 'Pocket guide': 'View guide', Infographic: 'View infographic' };
  const TH = {};
  const card = (i) => {
    const t = (i.th || []).map((s) => TH[s]).find(Boolean);
    const url = i.p ? `knowledge-hub/post.html?id=${encodeURIComponent(i.id)}` : asset(i.u) || 'knowledge-hub/index.html';
    const ext = /^https?:/.test(url) || /\.pdf/i.test(url);
    const thumb = i.img
      ? `<span class="hx-thumb has-img" aria-hidden="true"><img class="bg" src="${esc(asset(i.img))}" alt=""><img class="fg" src="${esc(asset(i.img))}" alt=""></span>`
      : `<span class="hx-thumb ${THUMB[i.y] || 'thumb-publication'}" aria-hidden="true">${/Video|Podcast|Interview/.test(i.y) ? '<i></i>' : ''}</span>`;
    return `<a class="hx-card${t ? ' has-tc' : ''}" href="${esc(url)}"${t ? ` style="--tc:${t.colour}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>${thumb}<span class="hx-card-body">`
      + (t ? `<span class="hx-theme">${esc(t.name)}</span>` : '')
      + `<small>${esc(i.y)} <b aria-hidden="true">·</b> ${esc(fmt(i.d))}</small><strong>${esc(i.t)}</strong>`
      + (i.s ? `<span class="hx-card-text">${esc(i.s)}</span>` : '')
      + `<span class="hx-card-cta">${CTA[i.y] || 'Read more'} <span aria-hidden="true">&#8594;</span></span></span></a>`;
  };
  fetch('knowledge-hub/knowledge.json').then((r) => r.json()).then((feed) => {
    const byId = new Map(feed.items.map((i) => [i.id, i]));
    (feed.themes || []).forEach((t) => { TH[t.slug] = t; });
    const f = feed.featured || {};
    const pickFor = (key, sec) => {
      const chosen = (f[key] || []).map((id) => byId.get(id)).filter(Boolean);
      const fill = feed.items.filter((i) => (i.sec === sec || i.sec === 'both') && !chosen.includes(i));
      return chosen.concat(fill).slice(0, 1);
    };
    // GBL slide: the newest GBL piece with a thumbnail
    if (asides.gbl) {
      const g = feed.items.filter((i) => (i.pg || []).includes('gbl'));
      const picks = g.filter((i) => i.img).concat(g.filter((i) => !i.img)).slice(0, 1);
      const label = asides.gbl.querySelector('.hx-latest-label');
      if (picks.length) asides.gbl.innerHTML = (label ? label.outerHTML : '') + picks.map(card).join('');
    }
    [['data', 'home_data'], ['programmes', 'home_programmes']].forEach(([sec, key]) => {
      const aside = asides[sec]; if (!aside) return;
      const label = aside.querySelector('.hx-latest-label');
      aside.innerHTML = (label ? label.outerHTML : '') + pickFor(key, sec).map(card).join('');
    });
  }).catch(() => {});
})();

/* ---- "New in the Knowledge Hub" rail: the newest pieces from the feed, with their banner thumbnails ----
   The cards in the HTML stay as a fallback if the feed cannot load. */
(function fillKnowledgeRail() {
  const rail = document.querySelector('#knowledge-rail');
  if (!rail) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const asset = (p) => (p && p.startsWith('/uploads/') ? p.slice(1) : p);
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (d) => { const [y, m, dd] = (d || '').split('-'); return y ? `${dd ? +dd + ' ' : ''}${m ? M[+m - 1] + ' ' : ''}${y}` : ''; };
  const CTA = { Video: 'Watch video', Podcast: 'Listen', Interview: 'Watch interview', Article: 'Read article', Blog: 'Read blog', Report: 'View report', Presentation: 'View slides', 'Pocket guide': 'View guide' };
  const THUMB = { Video: 'thumb-video', Podcast: 'thumb-video', Interview: 'thumb-video', Blog: 'thumb-blog', Article: 'thumb-article', 'Media release': 'thumb-article', Report: 'thumb-report' };
  fetch('knowledge-hub/knowledge.json').then((r) => r.json()).then((feed) => {
    const TH = Object.fromEntries((feed.themes || []).map((t) => [t.slug, t]));
    const list = (feed.items || []).slice(0, 8);
    if (!list.length) return;
    rail.innerHTML = list.map((i, n) => {
      const t = (i.th || []).map((s) => TH[s]).find(Boolean);
      const url = i.p ? `knowledge-hub/post.html?id=${encodeURIComponent(i.id)}` : asset(i.u) || 'knowledge-hub/index.html';
      const ext = !i.p && (/^https?:/.test(url) || /\.pdf/i.test(url));
      const thumb = i.img
        ? `<div class="content-thumb has-img" aria-hidden="true"><img src="${esc(asset(i.img))}" alt="" loading="lazy"><span>${esc(i.y)}</span></div>`
        : `<div class="content-thumb ${THUMB[i.y] || 'thumb-publication'}" aria-hidden="true"><span>${esc(i.y)}</span>${/Video|Podcast|Interview/.test(i.y) ? '<i></i>' : ''}</div>`;
      return `<article class="content-card${n === 0 ? ' featured' : ''}${t ? ' has-tc' : ''}"${t ? ` style="--tc:${t.colour}"` : ''}>${thumb}`
        + `<div class="meta"><span>${esc(i.y)}</span><span>${esc(fmt(i.d))}</span></div>`
        + (t ? `<span class="rail-theme">${esc(t.name)}</span>` : '')
        + `<h3>${esc(i.t)}</h3>${i.s ? `<p>${esc(i.s)}</p>` : ''}`
        + `<a href="${esc(url)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${CTA[i.y] || 'Read more'}</a></article>`;
    }).join('');
    rail.scrollLeft = 0;
    if (typeof updateRailButtons === 'function') updateRailButtons();
  }).catch(() => {});
})();
