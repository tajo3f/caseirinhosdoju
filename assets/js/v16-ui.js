/* V16: progressively enhanced microinteractions. All purchase rules live in app.js/availability.js. */
(() => {
  'use strict';
  const live = document.getElementById('liveAvailability');
  if (live) live.setAttribute('aria-atomic','true');

  // Decorative reveal only; cards stay fully visible when JS/observer is unavailable.
  const grid = document.querySelector('.combo-grid');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!grid || reduced || !('IntersectionObserver' in window)) return;
  const cards = Array.from(grid.querySelectorAll('.combo-card'));
  grid.classList.add('v16-motion-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('v16-entered');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -16px 0px' });
  cards.forEach((card, index) => {
    card.style.setProperty('--v16-stagger', `${Math.min(index,3)*65}ms`);
    observer.observe(card);
  });
})();
