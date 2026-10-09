/* A clipped wordmark reveal; no media request or animation library required. */
(() => {
  'use strict';
  const logo = document.querySelector('.brand-signature');
  if (!logo) return;
  const reel = document.querySelector('#hero-reel');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let suspended = false;
  const eligible = () => !document.hidden && !reducedMotion.matches && !suspended;
  const halt = () => {
    clearTimeout(timer);
    logo.classList.remove('is-animating');
  };
  const play = () => {
    if (!eligible() || logo.classList.contains('is-animating')) return;
    clearTimeout(timer);
    logo.classList.add('is-animating');
  };
  const schedule = delay => {
    clearTimeout(timer);
    if (eligible()) timer = setTimeout(play, delay);
  };
  logo.addEventListener('animationend', event => {
    if (event.animationName !== 'videory-wordmark') return;
    logo.classList.remove('is-animating');
    // The 2.8-second reveal + 9.2-second rest gives a calm 12-second cycle.
    // Repeating motion shares the existing video pause control.
    if (reel && !reel.paused) schedule(9200);
  });
  logo.addEventListener('pointerenter', play);
  logo.addEventListener('focus', play);
  const refresh = () => { halt(); schedule(650); };
  document.addEventListener('visibilitychange', refresh);
  reducedMotion.addEventListener('change', refresh);
  window.addEventListener('pageshow', refresh);
  if (reel) {
    reel.addEventListener('playing', () => {
      suspended = false;
      if (!logo.classList.contains('is-animating')) schedule(500);
    });
    const suspend = () => { suspended = true; halt(); };
    reel.addEventListener('pause', suspend);
    reel.addEventListener('error', suspend);
  }
  schedule(650);
})();
