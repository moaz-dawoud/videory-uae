/* Progressive enhancement: every section works without the animation library. */
(() => {
  'use strict';
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const header = document.querySelector('.header');
  const media = gsap.matchMedia();
  let refreshFrame = 0;
  const refreshLayout = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  // A solid sticky header, native scrolling, no scroll hijacking.
  ScrollTrigger.create({
    start: 16, end: 'max',
    onUpdate: self => header.classList.toggle('is-scrolled', self.scroll() > 16)
  });
  header.classList.toggle('is-scrolled', window.scrollY > 16);
  document.addEventListener('videory:categorychange', refreshLayout);

  media.add('(prefers-reduced-motion: no-preference)', context => {
    const entranceTweens = new Map();
    const workTweens = [];
    const allWork = gsap.utils.toArray('.work-item, .empty-gallery');
    let workTransition;

    // One short, coordinated opening; the films provide the ongoing motion.
    if (window.scrollY < 100 && !location.hash.startsWith('#work')) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-visual', { scale: 1.035, duration: 1.6, clearProps: 'transform' }, 0)
        .from('.hero-top', { y: -12, opacity: 0, duration: .65, clearProps: 'transform,opacity' }, .05)
        .from('.title-line', { yPercent: 115, rotation: 2, duration: 1.15, stagger: .12, clearProps: 'transform' }, .12)
        .from('.hero-copy, .hero .button', { y: 22, opacity: 0, duration: .75, stagger: .1, clearProps: 'transform,opacity' }, .57)
        .from('.hero-bottom', { y: 12, opacity: 0, duration: .7, clearProps: 'transform,opacity' }, .78);
    }

    const reveal = (element, distance = 36) => {
      const tween = gsap.from(element, {
        y: distance, opacity: 0, duration: .85, ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: element, start: 'top 92%', once: true }
      });
      entranceTweens.set(element, tween);
      return tween;
    };
    gsap.utils.toArray('.compact-approach > *, .work-heading, .work-tabs').forEach(el => reveal(el));
    gsap.utils.toArray('.work-panel:not([hidden]) .work-item').forEach(el => workTweens.push(reveal(el, 30)));
    gsap.utils.toArray('.work-footnote, .contact-copy, .contact-method, .contact-brand').forEach(el => reveal(el, 42));

    // Masked typography and individually settling artwork create a shared rhythm.
    gsap.utils.toArray('.work-heading h2, .contact h2').forEach(heading => {
      gsap.from(heading.querySelectorAll('.heading-word'), {
        yPercent: 112, rotation: 3, duration: 1.15, stagger: .1, ease: 'power4.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: heading, start: 'top 92%', once: true }
      });
    });

    // Stagger only the entering category. Rapid switching safely cancels older motion.
    context.add('changeCategory', event => {
      workTransition?.kill();
      workTweens.forEach(tween => { tween.scrollTrigger?.kill(); tween.kill(); });
      gsap.set(allWork, { clearProps: 'transform,opacity' });
      const incoming = event.detail.panel.querySelectorAll('.work-item, .empty-gallery');
      workTransition = gsap.fromTo(incoming,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: .5, stagger: .065, ease: 'power3.out', clearProps: 'transform,opacity', overwrite: 'auto' }
      );
    });
    document.addEventListener('videory:categorychange', context.changeCategory);

    // Keyboard navigation must never land on a still-invisible animated control.
    const revealFocused = event => {
      entranceTweens.forEach((tween, element) => {
        if (element.contains(event.target)) tween.progress(1);
      });
      if (event.target.closest('.work-panel')) workTransition?.progress(1);
    };
    document.addEventListener('focusin', revealFocused);
    return () => {
      document.removeEventListener('videory:categorychange', context.changeCategory);
      document.removeEventListener('focusin', revealFocused);
    };
  });

  document.fonts?.ready.then(refreshLayout);
  if (document.readyState === 'complete') refreshLayout();
  else window.addEventListener('load', refreshLayout, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) refreshLayout(); });
})();
