/**
 * DOM and UI utility functions.
 * @module dom-helpers
 */

/**
 * Shows a temporary toast notification.
 * @param {string} message - The message to display.
 * @param {string} [type='success'] - 'success', 'warning', or 'info'.
 */
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'assertive');
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/**
 * Re-renders the current page content and re-binds events.
 * Useful for state updates (e.g., after logging a challenge).
 * @param {Function} renderFn - Function that returns HTML string for the page.
 * @param {Function} bindFn - Function to bind events for the page.
 */
export function reRenderPage(renderFn, bindFn) {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = renderFn();
    if (bindFn) bindFn();
  }
}
