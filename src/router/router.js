/**
 * EcoTrack SPA Router
 * Hash-based client-side router with transitions.
 * @module router
 */

/**
 * Handles client-side routing, view transitions, and route guards.
 */
export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.container = null;
    this.beforeEach = null;
  }

  /**
   * Initializes the router and sets up event listeners.
   * @param {string} containerSelector - CSS selector for the main view container.
   */
  init(containerSelector) {
    this.container = document.querySelector(containerSelector);
    window.addEventListener('hashchange', () => this._handleRoute());
    if (!window.location.hash) {
      window.location.hash = '#/';
    } else {
      this._handleRoute();
    }
  }

  /**
   * Registers a route handler.
   * @param {string} path - The hash path (e.g., '/dashboard').
   * @param {Function} handler - Function returning HTML string or DOM node.
   */
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * Programmatically navigates to a new path.
   * @param {string} path - The path to navigate to.
   */
  navigate(path) {
    window.location.hash = '#' + path;
  }

  /**
   * Sets a global before-route guard.
   * @param {Function} fn - Guard function that can return a redirect path.
   */
  setGuard(fn) {
    this.beforeEach = fn;
  }

  getCurrentPath() {
    return window.location.hash.replace('#', '') || '/';
  }

  _handleRoute() {
    const path = this.getCurrentPath();

    // Guard
    if (this.beforeEach) {
      const redirectPath = this.beforeEach(path);
      if (redirectPath && redirectPath !== path) {
        this.navigate(redirectPath);
        return;
      }
    }

    const handler = this.routes[path] || this.routes['/404'];

    if (handler && this.container) {
      // Fade transition
      this.container.style.opacity = '0';
      this.container.style.transform = 'translateY(8px)';

      setTimeout(() => {
        try {
          this.container.innerHTML = '';
          const content = handler();
          if (typeof content === 'string') {
            this.container.innerHTML = content;
          } else if (content instanceof HTMLElement) {
            this.container.appendChild(content);
          }

          document.querySelectorAll('.sidebar__link').forEach(link => {
            const href = link.getAttribute('data-route');
            link.classList.toggle('sidebar__link--active', href === path);
          });

          this.currentRoute = path;
          this.container.style.opacity = '1';
          this.container.style.transform = 'translateY(0)';
          this.container.scrollTop = 0;

          window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));
        } catch (error) {
          console.error('Route rendering error:', error);
          this.container.innerHTML = `
            <div class="empty-state">
              <div class="empty-state__icon" style="color:var(--accent-coral)">⚠️</div>
              <div class="empty-state__title">Something went wrong</div>
              <div class="empty-state__text">We encountered an error loading this page.</div>
              <button class="btn btn--primary" onclick="location.reload()">Reload Page</button>
            </div>
          `;
          this.container.style.opacity = '1';
          this.container.style.transform = 'translateY(0)';
        }
      }, 150);
    }
  }
}
