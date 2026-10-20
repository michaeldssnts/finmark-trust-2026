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
