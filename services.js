/* Native scrolling, with a progressive, reversible stack when panels fit. */
(() => {
  'use strict';
  const section = document.querySelector('.services-showcase');
  const { gsap, ScrollTrigger } = window;
  if (!section || !gsap || !ScrollTrigger) return;
  const steps = [...section.querySelectorAll('.service-step')];
  const markers = [...section.querySelectorAll('.service-marker')];
  const header = document.querySelector('.header');
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    let stackContext, resizeTimer;
    const rebuild = () => {
      stackContext?.revert();
      section.classList.remove('has-service-stack');
      const top = Math.ceil(header.getBoundingClientRect().height) + 20;
      section.style.setProperty('--stack-top', `${top}px`);
      const fits = steps.every(step => step.getBoundingClientRect().height <= window.innerHeight - top - 24);
      if (fits) section.classList.add('has-service-stack');
      stackContext = gsap.context(() => {
        steps.forEach((step, index) => {
          const panel = step.querySelector('.service-panel');
          const artwork = step.querySelector('.service-visual');
          // Each original layer moves at a different depth as its panel approaches.
          gsap.fromTo(artwork.children, { y: i => 28 + i * 14 }, {
            y: 0, stagger: .05, ease: 'none',
            scrollTrigger: { trigger: markers[index], start: 'top bottom', end: `top ${top}`, scrub: .45, invalidateOnRefresh: true }
          });
          if (fits && index < steps.length - 1) {
            gsap.to(panel, { scale: .82, opacity: 0, ease: 'none',
              scrollTrigger: { trigger: markers[index + 1], start: `top ${top + panel.offsetHeight * .85}`, end: `top ${top}`, scrub: .35, invalidateOnRefresh: true }
            });
          }
        });
        gsap.fromTo('.services-direction', { rotation: -45 }, { rotation: 0, ease: 'none', scrollTrigger: { trigger: '.services-intro', start: 'top bottom', end: 'bottom 35%', scrub: .4 } });
      }, section);
      ScrollTrigger.refresh();
    };
    // Wait for font metrics once, then rebuild only for a real viewport change.
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(rebuild, 180); };
    gsap.from('.services-title-line', { y: 45, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.services-intro', start: 'top 92%', once: true } });
    rebuild();
    let active = true;
    document.fonts?.ready.then(() => { if (active) rebuild(); });
    window.addEventListener('resize', resize);
    return () => {
      active = false;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      stackContext?.revert();
      section.classList.remove('has-service-stack');
    };
  });
})();
