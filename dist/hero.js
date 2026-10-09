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
