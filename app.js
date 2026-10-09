'use strict';
document.querySelector('#year').textContent = new Date().getFullYear();
const tabs = Array.from(document.querySelectorAll('[role="tab"][data-category]'));
const panels = Array.from(document.querySelectorAll('.work-panel'));
const videos = Array.from(document.querySelectorAll('.portfolio-video'));
function selectCategory(tab, { moveFocus = false, writeHistory = false } = {}) {
  const changed = tab.getAttribute('aria-selected') !== 'true';
  if (changed) videos.forEach(video => video.pause());
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  if (writeHistory) {
    const hash = `#work-${tab.dataset.category}`;
    if (location.hash !== hash) history.pushState(null, '', hash);
  }
  if (moveFocus) tab.focus({ preventScroll: true });
  if (changed) document.dispatchEvent(new CustomEvent('videory:categorychange', {
    detail: { panel: document.getElementById(tab.getAttribute('aria-controls')) }
  }));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCategory(tab, { writeHistory: true }));
  tab.addEventListener('keydown', event => {
    const positions = {ArrowRight:(index+1)%tabs.length, ArrowLeft:(index-1+tabs.length)%tabs.length, Home:0, End:tabs.length-1};
    if (event.key in positions) {
      event.preventDefault();
      selectCategory(tabs[positions[event.key]], { moveFocus: true, writeHistory: true });
    }
  });
});
videos.forEach(video => {
  video.addEventListener('play', () => videos.forEach(other => { if (other !== video) other.pause(); }));
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach(video => video.pause());
});
function openLinkedCategory() {
  const category = location.hash.replace(/^#work-/, '').replace(/^ai-content$/, 'ai-creative');
  const tab = tabs.find(item => item.dataset.category === category);
  if (tab) {
    selectCategory(tab);
    document.querySelector('#work').scrollIntoView({ block: 'start' });
  } else if (location.hash === '#work' || !location.hash) {
    selectCategory(tabs.find(item => item.dataset.category === 'automotive'));
  }
}
window.addEventListener('hashchange', openLinkedCategory);
window.addEventListener('popstate', openLinkedCategory);
openLinkedCategory();
// Account for an expanded/zoomed header, including mobile Safari safe areas.
const header = document.querySelector('.header');
if ('ResizeObserver' in window) {
  new ResizeObserver(() => {
    document.documentElement.style.scrollPaddingTop = `${Math.ceil(header.getBoundingClientRect().height) + 20}px`;
  }).observe(header);
}
