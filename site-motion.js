/* Page and map transitions. Project playback has its own visibility lifecycle. */
(() => {
  'use strict';

  const library = window.Motion;
  if (!library) return;
  const { animate, inView } = library;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const ease = [.19, .72, .25, 1];

  function reveal(element, { distance = 14, duration = .46, delay = 0, opacity = .45 } = {}) {
    if (preference.matches) return;
    const effect = animate(element, {
      transform: [`translateY(${distance}px)`, 'translateY(0px)'],
      opacity: [opacity, 1]
    }, {
      duration,
      delay,
      ease,
      onComplete: () => active.delete(effect)
    });
    active.add(effect);
  }

  const intro = document.querySelectorAll('.hero-about .section-kicker, .hero-about h1 span, .hero-lead, .hero-actions, .projects-intro > *');
  if (!location.hash) {
    intro.forEach((element, index) => reveal(element, { distance: 18, delay: index * .055 }));
  }

  const sections = document.querySelectorAll('.map-heading, .content-section > *, .project-heading, .project-media, .projects-end > *');
  if (sections.length && 'IntersectionObserver' in window) {
    inView(sections, element => {
      if (!element.closest(':target')) reveal(element, { distance: 12, opacity: .6 });
    }, { amount: .18 });
  }

  document.addEventListener('portfolio:previews', event => {
    [...event.target.querySelectorAll('.preview-card')].forEach((card, index) => {
      reveal(card, { distance: 9, duration: .26, delay: index * .04, opacity: .55 });
    });
  });

  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    for (const effect of active) effect.cancel();
    active.clear();
  });
})();
