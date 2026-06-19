/**
 * EcoTrack Main Entry Point
 * Initializes router, navigation, and global state.
 */
import './styles/global.css';
import './styles/components.css';
import './styles/layouts.css';
import { Router } from './router/router.js';
import { ContextEngine } from './core/context-engine.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderDashboard, initDashboardCharts } from './pages/dashboard.js';
import { renderCalculator, bindCalculatorEvents } from './pages/calculator.js';
import { renderAssistant, bindAssistantEvents } from './pages/assistant.js';
import { renderQuizzes, bindQuizEvents } from './pages/quizzes.js';
import { renderChallenges, bindChallengeEvents } from './pages/challenges.js';
import { renderEducation, bindEducationEvents } from './pages/education.js';
import { renderProfile, bindProfileEvents } from './pages/profile.js';
import { renderLogin, bindLoginEvents, cleanupLogin } from './pages/login.js';
import { renderSimulator } from './pages/simulator.js';
import { AuthEngine } from './core/auth-engine.js';

const router = new Router();
const ctx = new ContextEngine();
const auth = new AuthEngine();

// ---- Sidebar Navigation ---- //
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <a class="sidebar__logo" href="#/dashboard">
      <div class="sidebar__logo-icon">🌱</div>
      <span class="sidebar__logo-text">EcoTrack</span>
    </a>

    <div class="sidebar__section-title">Main</div>
    <ul class="sidebar__nav">
      <li><button class="sidebar__link" data-route="/dashboard" aria-label="Dashboard">
        <span class="sidebar__link-icon">📊</span> Dashboard
      </button></li>
      <li><button class="sidebar__link" data-route="/calculator" aria-label="Calculator">
        <span class="sidebar__link-icon">🧮</span> Calculator
      </button></li>
      <li><button class="sidebar__link" data-route="/assistant" aria-label="EcoBot Assistant">
        <span class="sidebar__link-icon">🤖</span> EcoBot
      </button></li>
    </ul>

    <div class="sidebar__section-title">Engage</div>
    <ul class="sidebar__nav">
      <li><button class="sidebar__link" data-route="/quizzes" aria-label="Quizzes">
        <span class="sidebar__link-icon">🧠</span> Quizzes
      </button></li>
      <li><button class="sidebar__link" data-route="/challenges" aria-label="Challenges">
        <span class="sidebar__link-icon">🏆</span> Challenges
      </button></li>
      <li><button class="sidebar__link" data-route="/simulator" aria-label="What-If Simulator">
        <span class="sidebar__link-icon">🔁</span> Simulator
      </button></li>
      <li><button class="sidebar__link" data-route="/education" aria-label="Learn">
        <span class="sidebar__link-icon">📚</span> Learn
      </button></li>
    </ul>

    <div class="sidebar__footer">
      <button class="sidebar__link" data-route="/profile" aria-label="Profile and Settings">
        <span class="sidebar__link-icon">⚙️</span> Settings
      </button>
    </div>
  `;

  // Sidebar link clicks
  sidebar.querySelectorAll('.sidebar__link').forEach(link => {
    link.addEventListener('click', () => {
      router.navigate(link.dataset.route);
      // Close mobile sidebar
      sidebar.classList.remove('sidebar--open');
      document.getElementById('sidebar-backdrop')?.remove();
    });
  });
}

// ---- Mobile Header ---- //
function renderMobileHeader() {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Check if already exists
  if (document.querySelector('.mobile-header')) return;

  const header = document.createElement('div');
  header.className = 'mobile-header';
  header.innerHTML = `
    <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open navigation menu">☰</button>
    <span class="sidebar__logo-text" style="font-size:var(--text-lg)">🌱 EcoTrack</span>
    <div style="width:36px"></div>
  `;

  main.parentElement.insertBefore(header, main);

  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('sidebar--open');

    // Backdrop
    if (sidebar.classList.contains('sidebar--open')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:' + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--z-sidebar')) - 1);
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('sidebar--open');
        backdrop.remove();
      });
      document.body.appendChild(backdrop);
    } else {
      document.getElementById('sidebar-backdrop')?.remove();
    }
  });
}

// ---- Routes ---- //
function setupRoutes() {
  router.addRoute('/onboarding', () => renderOnboarding());
  router.addRoute('/dashboard', () => renderDashboard());
  router.addRoute('/calculator', () => renderCalculator());
  router.addRoute('/assistant', () => renderAssistant());
  router.addRoute('/quizzes', () => renderQuizzes());
  router.addRoute('/challenges', () => renderChallenges());
  router.addRoute('/education', () => renderEducation());
  router.addRoute('/profile', () => renderProfile());
  router.addRoute('/simulator', () => renderSimulator());
  router.addRoute('/login', () => renderLogin());
  router.addRoute('/', () => renderDashboard());
  router.addRoute('/404', () => `
    <div class="empty-state">
      <div class="empty-state__icon">🔍</div>
      <div class="empty-state__title">Page Not Found</div>
      <div class="empty-state__text">The page you're looking for doesn't exist.</div>
      <button class="btn btn--primary" onclick="location.hash='#/dashboard'">Go to Dashboard</button>
    </div>
  `);

  // Route guard: auth check -> onboarding check
  router.setGuard((path) => {
    const isAuth = auth.isAuthenticated();
    if (!isAuth && path !== '/login') return '/login';
    if (isAuth && path === '/login') return '/dashboard';
    if (isAuth && ctx.isFirstRun() && path !== '/onboarding') return '/onboarding';
    return null;
  });

  // Post-route hooks
  window.addEventListener('routechange', (e) => {
    const path = e.detail.path;

    // Clean up login resources (like canvas animations) when leaving the login page
    if (path !== '/login') {
      cleanupLogin();
    }

    if (path === '/dashboard' || path === '/') {
      setTimeout(() => initDashboardCharts(), 200);
    } else if (path === '/calculator') {
      bindCalculatorEvents();
    } else if (path === '/assistant') {
      bindAssistantEvents();
    } else if (path === '/quizzes') {
      bindQuizEvents();
    } else if (path === '/challenges') {
      bindChallengeEvents();
    } else if (path === '/education') {
      bindEducationEvents();
    } else if (path === '/profile') {
      bindProfileEvents();
    } else if (path === '/login') {
      bindLoginEvents();
    }

    // Show/hide sidebar for onboarding and login
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.style.display = (path === '/onboarding' || path === '/login') ? 'none' : '';
    }
    const main = document.getElementById('main-content');
    if (main) {
      main.style.marginLeft = (path === '/onboarding' || path === '/login') ? '0' : '';
    }
  });
}

// ---- Initialize ---- //
function init() {
  // Apply persisted theme on load
  const savedTheme = ctx.storage.get('theme') || 'auto';
  document.documentElement.setAttribute('data-theme', savedTheme);

  renderSidebar();
  renderMobileHeader();
  setupRoutes();
  router.init('#main-content');

  // Add transition styles to main content
  const main = document.getElementById('main-content');
  if (main) {
    main.style.transition = 'opacity 150ms ease, transform 150ms ease';
  }

  console.log('🌱 EcoTrack initialized');
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
