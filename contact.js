/* Native POST keeps delivery and verification with FormSubmit, even without JS. */
(() => {
  'use strict';
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('span');
  const status = form.querySelector('#message-status');
  const textFields = [form.elements.namedItem('name'), form.elements.namedItem('message')];
  const restore = () => {
    button.disabled = false;
    label.textContent = 'Send message';
    status.textContent = '';
    form.removeAttribute('aria-busy');
  };
  textFields.forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  form.addEventListener('submit', event => {
    textFields.forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Please enter your ' + (field.name === 'name' ? 'name.' : 'message.')));
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    button.disabled = true;
    label.textContent = 'Continue to verification';
    status.textContent = 'Opening secure verification…';
    form.setAttribute('aria-busy', 'true');
  });
  // Restore the controls when returning from verification with the browser Back button.
  window.addEventListener('pageshow', restore);
})();
