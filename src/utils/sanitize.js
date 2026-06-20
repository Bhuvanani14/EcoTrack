/**
 * Input sanitization utilities for XSS prevention.
 * @module sanitize
 */
const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };

/**
 * Escapes HTML characters in a string to prevent XSS.
 * @param {string|any} str - The string to sanitize. Returns non-strings as-is.
 * @returns {string|any} Sanitized string.
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'/]/g, ch => HTML_ENTITIES[ch] || ch);
}

/**
 * Strips HTML tags from a string by leveraging the browser's textContent property.
 * @param {string} html - The HTML string to sanitize.
 * @returns {string} Plain text string safely escaped.
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}
