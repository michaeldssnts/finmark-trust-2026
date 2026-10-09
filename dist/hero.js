const hero = document.querySelector('.hero-router');
const pathwayTabs = [...document.querySelectorAll('.pathway-tab')];
const pathwayPanels = [...document.querySelectorAll('.pathway-panel')];

function activatePathway(name, focus = false) {
  pathwayTabs.forEach((tab) => {
    const selected = tab.dataset.pathway === name;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });

  pathwayPanels.forEach((panel) => {
    const selected = panel.dataset.panel === name;
    panel.hidden = !selected;
    panel.classList.remove('is-active');
    if (selected) {
      void panel.offsetWidth;
      panel.classList.add('is-active');
    }
  });
}

pathwayTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activatePathway(tab.dataset.pathway));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const next = pathwayTabs[(index + direction + pathwayTabs.length) % pathwayTabs.length];
    activatePathway(next.dataset.pathway, true);
  });
});

requestAnimationFrame(() => hero?.classList.add('hero-ready'));

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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    knowledgeRail?.scrollBy({
      left: Number(button.dataset.railDirection) * Math.min(knowledgeRail.clientWidth * 0.8, 720),
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  });
});

knowledgeRail?.addEventListener('scroll', updateRailButtons, { passive: true });
window.addEventListener('resize', updateRailButtons);
updateRailButtons();
