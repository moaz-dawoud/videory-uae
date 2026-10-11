/* A silent background reel, loaded only while allowed and in view. */
(() => {
  'use strict';
  const video = document.querySelector('#hero-reel');
  if (!video) return;
  const hero = video.closest('.hero');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let visible = false;
  let unavailable = false;
  let pendingPlay = false;

  const canAutoplay = () => !reducedMotion.matches && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || '');
  const wantsPlayback = () => visible && !document.hidden && !unavailable && canAutoplay();
  const syncPlayback = () => {
    if (!wantsPlayback()) { video.pause(); return; }
    if (!video.paused || pendingPlay) return;
    if (!video.getAttribute('src')) {
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      video.muted = true;
      video.defaultMuted = true;
      video.src = mobile ? video.dataset.mobileSrc : video.dataset.desktopSrc;
    }
    pendingPlay = true;
    video.play().then(() => {
      if (!wantsPlayback()) video.pause();
    }).catch(() => {
      // Keep the poster if autoplay is blocked; retry on a later interaction or return.
    }).finally(() => { pendingPlay = false; });
  };

  video.addEventListener('playing', () => {
    if (wantsPlayback()) hero.dataset.reelReady = 'true';
    else video.pause();
  });
  video.addEventListener('error', () => {
    unavailable = true;
    video.pause();
    delete hero.dataset.reelReady;
  });
  const refreshVisibility = () => {
    const bounds = hero.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    syncPlayback();
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0 }).observe(hero);
  } else {
    window.addEventListener('scroll', refreshVisibility, { passive: true });
    window.addEventListener('resize', refreshVisibility, { passive: true });
  }
  document.addEventListener('visibilitychange', syncPlayback);
  document.addEventListener('pointerdown', syncPlayback, { passive: true });
  document.addEventListener('keydown', syncPlayback);
  reducedMotion.addEventListener('change', syncPlayback);
  connection?.addEventListener('change', syncPlayback);
  window.addEventListener('pageshow', refreshVisibility);
  refreshVisibility();
})();
