/**
 * EcoTrack Login Page v2
 * With canvas particle animation and async auth.
 */
import { AuthEngine } from '../core/auth-engine.js';

const auth = new AuthEngine();

function startParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 3 + 1,
    dx: (Math.random() - 0.5) * 0.4,
    dy: -(Math.random() * 0.5 + 0.2),
    alpha: Math.random() * 0.5 + 0.2,
    color: ['#00d68f', '#00b4d8', '#38ef7d', '#a78bfa'][Math.floor(Math.random() * 4)],
  }));

  let animFrame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    });
    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(draw);
  }
  draw();
  return () => cancelAnimationFrame(animFrame);
}

export function renderLogin() {
  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;min-height:90vh;overflow:hidden">
      <canvas id="login-particles" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0"></canvas>

      <div class="card" style="position:relative;z-index:1;width:100%;max-width:420px;text-align:center;padding:var(--space-10) var(--space-8);backdrop-filter:blur(20px)">
        <!-- Logo -->
        <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#00d68f,#00b4d8);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto var(--space-4);box-shadow:0 0 30px rgba(0,214,143,0.3)">🌱</div>
        <h1 style="font-size:var(--text-2xl);margin-bottom:var(--space-1)">EcoTrack</h1>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-8)">Your personal carbon footprint companion</p>

        <!-- Error -->
        <div id="login-error" role="alert" style="color:var(--accent-coral);font-size:var(--text-sm);margin-bottom:var(--space-3);min-height:20px;display:none;background:rgba(255,95,87,0.1);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm)"></div>

        <!-- Form -->
        <form id="login-form" style="text-align:left" novalidate>
          <div class="input-group" style="margin-bottom:var(--space-4)">
            <label class="input-group__label" for="username">Username</label>
            <input type="text" id="username" class="input-group__field" placeholder="Enter username" autocomplete="username" required />
          </div>
          <div class="input-group" style="margin-bottom:var(--space-6)">
            <label class="input-group__label" for="password">Password</label>
            <div style="position:relative">
              <input type="password" id="password" class="input-group__field" placeholder="Enter password" autocomplete="current-password" required style="padding-right:44px" />
              <button type="button" id="toggle-pw" aria-label="Toggle password visibility"
                style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-tertiary);font-size:1rem">👁</button>
            </div>
          </div>
          <button type="submit" id="login-btn" class="btn btn--primary" style="width:100%;position:relative">
            <span id="login-btn-text">Sign In</span>
            <span id="login-spinner" style="display:none">⏳ Verifying...</span>
          </button>
        </form>

        <!-- Demo credentials -->
        <div style="margin-top:var(--space-6);padding:var(--space-4);background:rgba(0,214,143,0.05);border-radius:var(--radius-sm);border:1px dashed rgba(0,214,143,0.3)">
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-2);text-transform:uppercase;letter-spacing:1px">🔑 Demo Access</div>
          <div style="display:flex;gap:var(--space-4);justify-content:center;flex-wrap:wrap">
            <span style="font-size:var(--text-sm);color:var(--text-secondary)">Username: <strong style="color:var(--accent-green)">demo</strong></span>
            <span style="font-size:var(--text-sm);color:var(--text-secondary)">Password: <strong style="color:var(--accent-green)">password123</strong></span>
          </div>
          <button type="button" id="autofill-btn" class="btn btn--ghost" style="margin-top:var(--space-3);font-size:var(--text-xs);padding:6px 16px">
            ⚡ Auto-fill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  `;

  return html;
}

let cancelParticles = null;

export function cleanupLogin() {
  if (cancelParticles) {
    cancelParticles();
    cancelParticles = null;
  }
}

export function bindLoginEvents() {
  cleanupLogin();
  cancelParticles = startParticles('login-particles');

  // Toggle password visibility
  document.getElementById('toggle-pw')?.addEventListener('click', () => {
    const pw = document.getElementById('password');
    if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // Auto-fill demo credentials
  document.getElementById('autofill-btn')?.addEventListener('click', () => {
    const u = document.getElementById('username');
    const p = document.getElementById('password');
    if (u) u.value = 'demo';
    if (p) p.value = 'password123';
  });

  // Login form
  const form = document.getElementById('login-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const username = usernameEl ? usernameEl.value.trim() : '';
    const password = passwordEl ? passwordEl.value : '';
    const errorEl = document.getElementById('login-error');
    const btnText = document.getElementById('login-btn-text');
    const spinner = document.getElementById('login-spinner');
    const btn = document.getElementById('login-btn');

    // Show loading state
    if (btnText) btnText.style.display = 'none';
    if (spinner) spinner.style.display = 'inline';
    if (btn) btn.disabled = true;
    if (errorEl) errorEl.style.display = 'none';

    const result = await auth.login(username, password);

    if (btnText) btnText.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
    if (btn) btn.disabled = false;

    if (result.success) {
      cleanupLogin();
      window.location.hash = '#/dashboard';
    } else {
      if (errorEl) {
        errorEl.textContent = result.error;
        errorEl.style.display = 'block';
      }
      if (passwordEl) {
        passwordEl.value = '';
        passwordEl.focus();
      }
    }
  });
}
