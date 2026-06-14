/**
 * Input sanitization utilities for XSS prevention.
 */
const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };

export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'/]/g, ch => HTML_ENTITIES[ch] || ch);
}

export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}
