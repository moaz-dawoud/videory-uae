/* Keep visitors on the page and confirm only submissions accepted by the service. */
(() => {
  'use strict';
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('span');
  const status = form.querySelector('#message-status');
  const fields = ['name', 'email', 'message'].map(name => form.elements.namedItem(name));
  const textFields = [fields[0], fields[2]];
  let sending = false;
  const showStatus = (state, message) => {
    status.dataset.state = state;
    status.textContent = message;
  };
  const failureMessage = 'We couldn’t confirm your message was sent. Please try again or email info@videory.net.';
  textFields.forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    textFields.forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Please enter your ' + (field.name === 'name' ? 'name.' : 'message.')));
    if (!form.reportValidity()) return;
    if (form.elements.namedItem('_honey').value.trim()) {
      showStatus('error', failureMessage);
      status.focus();
      return;
    }
    const payload = Object.fromEntries(new FormData(form));
    fields.forEach(field => { payload[field.name] = field.value.trim(); });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    sending = true;
    button.disabled = true;
    fields.forEach(field => { field.readOnly = true; });
    label.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    showStatus('sending', 'Sending your message…');
    try {
      const response = await fetch(form.dataset.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
        signal: controller.signal
      });
      const result = await response.json();
      const accepted = result && (result.success === true || result.success === 'true');
      const activationPending = result && /\b(?:activate|activation|confirmation|confirm your email|check your inbox)\b/i.test(String(result.message || ''));
      if (!response.ok || !accepted || activationPending) throw new Error('Submission not confirmed');
      form.reset();
      showStatus('success', 'Thank you! We’ve received your message and will get back to you as soon as possible.');
    } catch {
      showStatus('error', failureMessage);
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      fields.forEach(field => { field.readOnly = false; });
      label.textContent = 'Send message';
      form.removeAttribute('aria-busy');
      status.focus();
    }
  });
})();
