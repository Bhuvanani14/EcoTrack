/**
 * EcoTrack SPA Router
 * Hash-based client-side router with transitions.
 */

export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.container = null;
    this.beforeEach = null;
  }

  init(containerSelector) {
    this.container = document.querySelector(containerSelector);
    window.addEventListener('hashchange', () => this._handleRoute());
    // Handle initial load
    if (!window.location.hash) {
      window.location.hash = '#/';
    } else {
      this._handleRoute();
    }
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = '#' + path;
  }

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
        this.container.innerHTML = '';
        const content = handler();
        if (typeof content === 'string') {
          this.container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          this.container.appendChild(content);
        }

        // Update active nav
        document.querySelectorAll('.sidebar__link').forEach(link => {
          const href = link.getAttribute('data-route');
          link.classList.toggle('sidebar__link--active', href === path);
        });

        this.currentRoute = path;
        this.container.style.opacity = '1';
        this.container.style.transform = 'translateY(0)';
        this.container.scrollTop = 0;

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));
      }, 150);
    }
  }
}
