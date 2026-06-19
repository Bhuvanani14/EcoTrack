/**
 * EcoTrack Profile & Settings Page
 */
import { Storage } from '../core/storage.js';
import { ContextEngine } from '../core/context-engine.js';
import { QuizEngine } from '../core/quiz-engine.js';
import { AuthEngine } from '../core/auth-engine.js';

const storage = new Storage();
const ctx = new ContextEngine();
const quizEngine = new QuizEngine();
const auth = new AuthEngine();

export function renderProfile() {
  const profile = ctx.getUserProfile();
  const streak = ctx.getStreak();
  const history = ctx.getFootprintHistory();
  const quizHistory = quizEngine.getQuizHistory();
  const badges = quizEngine.getBadges();
  const challengeHistory = storage.get('challengeHistory') || [];

  const currentTheme = storage.get('theme') || 'auto';
  const activeClass = (t) => currentTheme === t ? 'btn--primary' : 'btn--secondary';

  const html = `
    <div class="page-header">
      <h1 class="page-header__title">⚙️ Profile & Settings</h1>
      <p class="page-header__subtitle">Manage your data and preferences</p>
    </div>

    <!-- Profile Summary -->
    <div class="card" style="margin-bottom:var(--space-6)">
      <h3 style="margin-bottom:var(--space-4)">📊 Your Journey</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-4);text-align:center">
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)">🔥 ${streak}</div><small style="color:var(--text-secondary)">Day Streak</small></div>
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-teal)">${history.length}</div><small style="color:var(--text-secondary)">Snapshots</small></div>
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-amber)">${quizHistory.length}</div><small style="color:var(--text-secondary)">Quizzes</small></div>
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-purple)">${challengeHistory.length}</div><small style="color:var(--text-secondary)">Challenges</small></div>
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)">${badges.length}</div><small style="color:var(--text-secondary)">Badges</small></div>
      </div>
    </div>

    <!-- Current Profile -->
    ${profile?.transport ? `
      <div class="card" style="margin-bottom:var(--space-6)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
          <h3>📝 Current Profile</h3>
          <button class="btn btn--secondary btn--sm" onclick="location.hash='#/calculator'">✏️ Edit</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);font-size:var(--text-sm)">
          <div><span style="color:var(--text-secondary)">🚗 Commute:</span> ${profile.transport.commuteMode || 'Not set'}</div>
          <div><span style="color:var(--text-secondary)">📏 Distance:</span> ${profile.transport.commuteDistance || 0} km</div>
          <div><span style="color:var(--text-secondary)">🥗 Diet:</span> ${profile.food?.dietType || 'Not set'}</div>
          <div><span style="color:var(--text-secondary)">🏠 Housing:</span> ${profile.energy?.housingType || 'Not set'}</div>
          <div><span style="color:var(--text-secondary)">☀️ Renewable:</span> ${profile.energy?.renewableEnergy || 'Not set'}</div>
          <div><span style="color:var(--text-secondary)">♻️ Recycling:</span> ${profile.lifestyle?.recycling || 'Not set'}</div>
        </div>
      </div>
    ` : ''}

    <!-- Appearance -->
    <div class="card" style="margin-bottom:var(--space-6)">
      <h3 style="margin-bottom:var(--space-4)">🎨 Appearance</h3>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">Choose your preferred theme style</p>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
        <button class="btn ${activeClass('auto')} theme-btn" data-theme="auto" style="flex:1">🌓 System</button>
        <button class="btn ${activeClass('light')} theme-btn" data-theme="light" style="flex:1">☀️ Light</button>
        <button class="btn ${activeClass('dark')} theme-btn" data-theme="dark" style="flex:1">🌙 Dark</button>
      </div>
    </div>

    <!-- Data Management & Account -->
    <div class="card" style="margin-bottom:var(--space-6)">
      <h3 style="margin-bottom:var(--space-4)">💾 Data & Account</h3>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-4)">All your data is stored locally in your browser. No data is sent to any server.</p>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
        <button class="btn btn--secondary" id="export-data">📤 Export Data</button>
        <label class="btn btn--secondary" style="cursor:pointer">📥 Import Data<input type="file" accept=".json" id="import-data" style="display:none" /></label>
        <button class="btn btn--danger" id="reset-data">🗑️ Reset All Data</button>
      </div>
      <div class="divider"></div>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
        <button class="btn btn--ghost" id="logout-btn">🚪 Log Out</button>
      </div>
    </div>

    <!-- Accessibility -->
    <div class="card" style="margin-bottom:var(--space-6)">
      <h3 style="margin-bottom:var(--space-4)">♿ Accessibility</h3>
      <div style="display:flex;flex-direction:column;gap:var(--space-3)">
        <label style="display:flex;align-items:center;gap:var(--space-3);cursor:pointer">
          <input type="checkbox" id="reduced-motion" ${document.documentElement.classList.contains('reduced-motion') ? 'checked' : ''} />
          <span>Reduce animations</span>
        </label>
        <label style="display:flex;align-items:center;gap:var(--space-3);cursor:pointer">
          <input type="checkbox" id="high-contrast" ${document.documentElement.classList.contains('high-contrast') ? 'checked' : ''} />
          <span>High contrast mode</span>
        </label>
      </div>
    </div>

    <!-- About -->
    <div class="card">
      <h3 style="margin-bottom:var(--space-4)">ℹ️ About EcoTrack</h3>
      <p style="font-size:var(--text-sm);color:var(--text-secondary)">
        EcoTrack is a carbon footprint awareness platform that helps individuals understand, track, and reduce their carbon footprint through personalized insights, interactive quizzes, and an AI-powered assistant.
      </p>
      <p style="font-size:var(--text-sm);color:var(--text-secondary)">
        Emission factors sourced from EPA, DEFRA, IEA, and IPCC public data. Built with privacy-first principles — all data stays in your browser.
      </p>
      <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin:0">Version 1.0.0 • Made with 💚 for the planet</p>
    </div>
  `;

  return html;
}

export function bindProfileEvents() {
  document.getElementById('export-data')?.addEventListener('click', () => {
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ecotrack-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  });

  document.getElementById('import-data')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (storage.importData(reader.result)) {
        alert('✅ Data imported successfully! Refreshing...');
        window.location.reload();
      } else { alert('❌ Invalid file format.'); }
    };
    reader.readAsText(file);
  });

  document.getElementById('reset-data')?.addEventListener('click', () => {
    if (confirm('⚠️ This will permanently delete all your EcoTrack data. Are you sure?')) {
      storage.clear();
      window.location.hash = '#/onboarding';
      window.location.reload();
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    auth.logout();
    window.location.hash = '#/login';
  });

  document.getElementById('reduced-motion')?.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('reduced-motion', e.target.checked);
  });

  document.getElementById('high-contrast')?.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('high-contrast', e.target.checked);
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      storage.set('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      // Update buttons style
      document.querySelectorAll('.theme-btn').forEach(b => {
        const isActive = b.dataset.theme === theme;
        b.className = `btn theme-btn ${isActive ? 'btn--primary' : 'btn--secondary'}`;
      });
    });
  });
}
