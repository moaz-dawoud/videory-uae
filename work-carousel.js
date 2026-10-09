/* Rotate the existing players: no duplicate videos, libraries or media requests. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 600px)');
  const tablet = window.matchMedia('(max-width: 900px)');
  const allVideos = Array.from(document.querySelectorAll('.portfolio-video'));
  const instances = [];
  const icon = path => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

  document.querySelectorAll('.work-panel').forEach(panel => {
    const track = panel.querySelector('.inline-gallery');
    if (!track) return;
    const items = Array.from(track.children);
    if (!items.length) return;
    const category = document.getElementById(panel.getAttribute('aria-labelledby')).textContent.replace('Coming soon', '').trim();
    const mediaType = items.every(item => item.querySelector('video')) ? 'video' : 'item';
    const viewport = document.createElement('div');
    viewport.className = 'work-carousel-viewport';
    track.before(viewport);
    viewport.append(track);
    panel.classList.add('work-carousel');
    viewport.setAttribute('role', 'group');
    viewport.setAttribute('aria-roledescription', 'carousel');
    viewport.setAttribute('aria-label', `${category} ${mediaType}s`);
    track.id = `${panel.id}-track`;
    items.forEach((item, index) => {
      item.dataset.filmIndex = String(index);
      item.setAttribute('role', 'group');
      item.setAttribute('aria-roledescription', 'slide');
      item.setAttribute('aria-label', `${index + 1} of ${items.length}`);
    });
    const controls = document.createElement('div');
    controls.className = 'work-carousel-controls';
    controls.innerHTML = `<span class="work-carousel-counter" aria-hidden="true"></span>
      <button class="work-carousel-button work-carousel-toggle" type="button" aria-controls="${track.id}"><span class="carousel-pause">${icon('<path d="M9 5v14M15 5v14"/>')}</span><span class="carousel-play">${icon('<path d="m9 5 10 7-10 7Z"/>')}</span></button>
      <button class="work-carousel-button" type="button" data-step="-1" aria-label="Previous ${category} ${mediaType}" aria-controls="${track.id}">${icon('<path d="m14 6-6 6 6 6"/>')}</button>
      <button class="work-carousel-button" type="button" data-step="1" aria-label="Next ${category} ${mediaType}" aria-controls="${track.id}">${icon('<path d="m10 6 6 6-6 6"/>')}</button>
      <span class="carousel-announcement" aria-live="polite" aria-atomic="true"></span>`;
    viewport.before(controls);
    const counter = controls.querySelector('.work-carousel-counter');
    const toggle = controls.querySelector('.work-carousel-toggle');
    const announcement = controls.querySelector('.carousel-announcement');
    let visible = 3;
    let onScreen = false;
    let hovered = false;
    let focused = false;
    let userPaused = false;
    let focusRestarted = false;
    let pointerToggleIntent;
    let timer;
    let animationTimer;
    let animation;
    let pendingStep = 0;
    let announce = false;
    // Native inert is supported in modern Safari; tabindex also protects older versions.
    const originalTabIndexes = new Map();
    items.forEach(item => item.querySelectorAll('video, a, button, input, select, textarea, [tabindex]').forEach(control => {
      originalTabIndexes.set(control, control.getAttribute('tabindex'));
    }));
    const children = () => Array.from(track.children);
    const stop = () => clearTimeout(timer);
    const eligible = () => !panel.hidden && onScreen && !document.hidden && !hovered && (!focused || focusRestarted) &&
      !userPaused && !reduced.matches && items.length > visible && !allVideos.some(video => !video.paused && !video.ended);
    const syncToggle = () => {
      const paused = userPaused || reduced.matches;
      toggle.dataset.paused = String(paused);
      toggle.setAttribute('aria-label', `${paused ? 'Start' : 'Pause'} automatic ${category} scrolling`);
      toggle.hidden = reduced.matches;
    };
    const schedule = () => {
      stop();
      if (eligible() && !pendingStep) timer = setTimeout(() => move(1), 3000);
    };
    const update = () => {
      const ordered = children();
      ordered.forEach((item, index) => {
        const hidden = index >= visible;
        item.inert = hidden;
        item.setAttribute('aria-hidden', String(hidden));
        item.querySelectorAll('video, a, button, input, select, textarea, [tabindex]').forEach(control => {
          const original = originalTabIndexes.get(control);
          if (hidden) control.setAttribute('tabindex', '-1');
          else if (original == null) control.removeAttribute('tabindex');
          else control.setAttribute('tabindex', original);
        });
        if (hidden) item.querySelector('video')?.pause();
      });
      const first = Number(ordered[0].dataset.filmIndex) + 1;
      counter.textContent = `${String(first).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      if (announce) {
        const shown = ordered.slice(0, visible).map(item => Number(item.dataset.filmIndex) + 1).join(', ');
        announcement.textContent = `Showing ${category} ${mediaType}s ${shown} of ${items.length}.`;
        announce = false;
      }
      controls.hidden = items.length <= visible;
      syncToggle();
    };
    const finish = () => {
      if (!pendingStep) return;
      clearTimeout(animationTimer);
      if (pendingStep === 1) track.append(track.firstElementChild);
      pendingStep = 0;
      animation?.cancel();
      animation = null;
      update();
      schedule();
    };
    function move(step, manual = false) {
      if (manual) {
        userPaused = true;
        focusRestarted = false;
        finish();
        syncToggle();
      }
      if (pendingStep || items.length <= visible || panel.hidden || (!manual && !eligible())) return;
      stop();
      if (manual) allVideos.forEach(video => video.pause());
      const ordered = children();
      const distance = ordered[1].offsetLeft - ordered[0].offsetLeft;
      if (distance <= 0) return;
      pendingStep = step;
      announce = manual;
      // Prepend for left-to-right motion; the existing films slide right together.
      if (step === -1) track.prepend(track.lastElementChild);
      if (reduced.matches || !track.animate) { finish(); return; }
      animation = track.animate([
        { transform: `translateX(${step === -1 ? -distance : 0}px)` },
        { transform: `translateX(${step === -1 ? 0 : -distance}px)` }
      ], { duration: 600, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      animation.onfinish = finish;
      // A cancelled animation/background Safari tab must never lock the arrows.
      animationTimer = setTimeout(finish, 750);
    }
    const refresh = () => {
      finish();
      visible = Math.min(items.length, mobile.matches ? 1 : tablet.matches ? 2 : 3);
      panel.style.setProperty('--visible-films', visible);
      update();
      schedule();
    };
    controls.querySelectorAll('[data-step]').forEach(button => {
      button.addEventListener('click', () => move(Number(button.dataset.step), true));
    });
    toggle.addEventListener('click', () => {
      userPaused = pointerToggleIntent ?? !userPaused;
      pointerToggleIntent = undefined;
      focusRestarted = !userPaused;
      syncToggle();
      if (userPaused) finish();
      schedule();
    });
    toggle.addEventListener('pointerdown', () => { pointerToggleIntent = !userPaused; });
    toggle.addEventListener('pointercancel', () => { pointerToggleIntent = undefined; });
    toggle.addEventListener('keydown', () => { pointerToggleIntent = undefined; });
    // Safari does not focus buttons on a pointer click. Stop on touch explicitly,
    // and never intercept swipes/scrubbing inside native video controls.
    viewport.addEventListener('pointerdown', () => {
      userPaused = true; focusRestarted = false; stop(); finish(); syncToggle();
    });
    panel.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; stop(); } });
    panel.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    panel.addEventListener('focusin', () => {
      focused = true; userPaused = true; focusRestarted = false; stop(); finish(); syncToggle();
    });
    panel.addEventListener('focusout', event => { focused = panel.contains(event.relatedTarget); schedule(); });
    panel.addEventListener('keydown', event => {
      if (event.target !== panel || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1, true);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        onScreen = entries[0].isIntersecting && entries[0].intersectionRatio >= .15;
        if (!onScreen) finish();
        schedule();
      }, { threshold: [0, .15] }).observe(viewport);
    }
    if ('ResizeObserver' in window) new ResizeObserver(refresh).observe(viewport);
    instances.push({ refresh, schedule, stop, finish });
    refresh();
  });
  allVideos.forEach(video => {
    video.addEventListener('play', () => instances.forEach(instance => { instance.stop(); instance.finish(); }));
    ['pause', 'ended', 'error'].forEach(name => video.addEventListener(name, () => instances.forEach(instance => instance.schedule())));
  });
  document.addEventListener('visibilitychange', () => instances.forEach(instance => { instance.finish(); instance.schedule(); }));
  document.addEventListener('videory:categorychange', () => instances.forEach(instance => instance.refresh()));
  [mobile, tablet, reduced].forEach(query => query.addEventListener('change', () => instances.forEach(instance => instance.refresh())));
})();
