const heroExplorer = document.querySelector('.hero-explorer');
const heroChoices = [...document.querySelectorAll('.hero-path-choice')];
const heroStories = [...document.querySelectorAll('.hero-story')];
const motionToggle = document.querySelector('.hero-motion-toggle');
const motionLabel = document.querySelector('.motion-label');
const motionIcon = document.querySelector('.motion-icon');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroPathways = new Set(['data', 'programmes']);
let activePathway = 'data';
let rotationPaused = reducedMotion;
let rotationTimer;

function activateHeroPathway(name, focus = false) {
  if (!heroPathways.has(name)) return;
  activePathway = name;
  heroExplorer.dataset.activePathway = name;

  heroChoices.forEach((choice) => {
    const selected = choice.dataset.heroPath === name;
    choice.classList.toggle('is-active', selected);
    choice.setAttribute('aria-selected', String(selected));
    choice.tabIndex = selected ? 0 : -1;
    if (selected && focus) choice.focus();
  });

  heroStories.forEach((story) => {
    const selected = story.dataset.heroPanel === name;
    story.hidden = !selected;
    story.classList.remove('is-active');
    if (selected) {
      void story.offsetWidth;
      story.classList.add('is-active');
    }
  });

}

function startRotation() {
  clearInterval(rotationTimer);
  if (rotationPaused) return;
  rotationTimer = setInterval(() => {
    activateHeroPathway(activePathway === 'data' ? 'programmes' : 'data');
  }, 7000);
}

heroChoices.forEach((choice, index) => {
  choice.addEventListener('click', () => {
    activateHeroPathway(choice.dataset.heroPath);
    startRotation();
  });
  choice.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') activateHeroPathway(choice.dataset.heroPath);
  });
  choice.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const next = heroChoices[(index + direction + heroChoices.length) % heroChoices.length];
    activateHeroPathway(next.dataset.heroPath, true);
    startRotation();
  });
});

motionToggle?.addEventListener('click', () => {
  rotationPaused = !rotationPaused;
  motionToggle.setAttribute('aria-pressed', String(rotationPaused));
  motionLabel.textContent = rotationPaused ? 'Resume rotation' : 'Pause rotation';
  motionIcon.textContent = rotationPaused ? '▶' : 'Ⅱ';
  startRotation();
});

heroExplorer?.addEventListener('focusin', () => clearInterval(rotationTimer));
heroExplorer?.addEventListener('focusout', () => startRotation());
heroExplorer?.addEventListener('mouseenter', () => clearInterval(rotationTimer));
heroExplorer?.addEventListener('mouseleave', () => startRotation());

requestAnimationFrame(() => heroExplorer?.classList.add('hero-ready'));
startRotation();

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
