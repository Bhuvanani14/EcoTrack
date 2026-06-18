/**
 * EcoTrack Login Page
 * Provides a UI for the mock authentication system.
 */
import { AuthEngine } from '../core/auth-engine.js';

const auth = new AuthEngine();

export function renderLogin() {
  const html = `
    <div class="login-container" style="display:flex;align-items:center;justify-content:center;min-height:80vh">
      <div class="card" style="width:100%;max-width:400px;text-align:center;padding:var(--space-8)">
        <div style="font-size:3rem;margin-bottom:var(--space-4)">🌱</div>
        <h2 style="margin-bottom:var(--space-2)">Welcome to EcoTrack</h2>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-6)">Please sign in to continue.</p>

        <div id="login-error" style="color:var(--accent-coral);font-size:var(--text-sm);margin-bottom:var(--space-4);display:none"></div>

        <form id="login-form" style="text-align:left">
          <div class="input-group" style="margin-bottom:var(--space-4)">
            <label class="input-group__label" for="username">Username</label>
            <input type="text" id="username" class="input-group__field" placeholder="Enter username" required />
          </div>
          <div class="input-group" style="margin-bottom:var(--space-6)">
            <label class="input-group__label" for="password">Password</label>
            <input type="password" id="password" class="input-group__field" placeholder="Enter password" required />
          </div>
          <button type="submit" class="btn btn--primary" style="width:100%">Sign In</button>
        </form>

        <div style="margin-top:var(--space-6);padding:var(--space-4);background:var(--bg-surface);border-radius:var(--radius-sm);border:1px dashed var(--border-default)">
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-2);text-transform:uppercase;letter-spacing:1px">Demo Credentials</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary)">Username: <strong style="color:var(--text-primary)">demo</strong></div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary)">Password: <strong style="color:var(--text-primary)">password123</strong></div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        const result = auth.login(username, password);
        
        if (result.success) {
          window.location.hash = '#/dashboard';
        } else {
          const errorEl = document.getElementById('login-error');
          errorEl.textContent = result.error;
          errorEl.style.display = 'block';
        }
      });
    }
  }, 100);

  return html;
}
