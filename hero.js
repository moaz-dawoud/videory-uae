/* A silent, small reel. It loads only when playback is allowed and in view. */
(() => {
  'use strict';
  const video = document.querySelector('#hero-reel');
  const button = document.querySelector('#hero-motion-toggle');
  if (!video || !button) return;
  const hero = video.closest('.hero');
  const label = button.querySelector('span');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let visible = false;
  let userPaused = false;
  let explicitlyPlaying = false;
  let unavailable = false;
  let pendingPlay = false;

  const canAutoplay = () => !reducedMotion.matches && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || '');
  const wantsPlayback = () => visible && !document.hidden && !userPaused && !unavailable && (explicitlyPlaying || canAutoplay());
  const updateButton = () => {
    const playing = !video.paused && !video.ended;
    button.dataset.playing = String(playing);
    label.textContent = playing ? 'Pause motion' : 'Play motion';
  };
  const syncPlayback = () => {
    if (!wantsPlayback()) { video.pause(); return; }
    if (!video.paused || pendingPlay) return;
    if (!video.getAttribute('src')) {
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      video.src = mobile ? video.dataset.mobileSrc : video.dataset.desktopSrc;
      video.muted = true;
      video.defaultMuted = true;
    }
    pendingPlay = true;
    video.play().then(() => {
      if (!wantsPlayback()) video.pause();
    }).catch(error => {
      // Autoplay policies can reject playback; the manual Play button remains usable.
      // Safari may abort playback while changing visibility. If still visible,
      // offer manual retry instead of spinning through rejected play promises.
      if (wantsPlayback()) userPaused = true;
      updateButton();
    }).finally(() => {
      pendingPlay = false;
      if (wantsPlayback() && video.paused) syncPlayback();
    });
  };

  button.hidden = false;
  button.addEventListener('click', () => {
    if (!video.paused || pendingPlay) {
      userPaused = true;
      explicitlyPlaying = false;
    } else {
      userPaused = false;
      explicitlyPlaying = true;
    }
    syncPlayback();
  });
  video.addEventListener('playing', () => {
    hero.dataset.reelReady = 'true';
    updateButton();
  });
  video.addEventListener('pause', updateButton);
  video.addEventListener('timeupdate', () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      hero.style.setProperty('--reel-progress', String(video.currentTime / video.duration));
    }
  });
  video.addEventListener('error', () => {
    unavailable = true;
    video.pause();
    delete hero.dataset.reelReady;
    button.hidden = true;
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
  reducedMotion.addEventListener('change', () => { explicitlyPlaying = false; syncPlayback(); });
  connection?.addEventListener('change', syncPlayback);
  window.addEventListener('pageshow', refreshVisibility);
  refreshVisibility();
})();
