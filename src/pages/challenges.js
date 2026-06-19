/**
 * EcoTrack Challenges Page v2
 * Fixed: Log Progress with modal, daily check-ins, progress history, proper persistence.
 */
import { Storage } from '../core/storage.js';

const storage = new Storage();

const CHALLENGES = [
  { id: 'car_free', title: 'Car-Free Week', icon: '🚲', category: 'Transport', description: 'Use only public transport, cycling, or walking for one full week.', duration: 7, impactKg: 15, difficulty: 'medium', tips: 'Plan routes in advance, try combining errands.' },
  { id: 'meatless_monday', title: 'Meatless Monday ×4', icon: '🥬', category: 'Food', description: 'Go meat-free every Monday for a month.', duration: 28, impactKg: 12, difficulty: 'easy', tips: 'Explore bean curries, lentil soups, and veggie stir-fries.' },
  { id: 'unplug', title: 'Unplug Challenge', icon: '🔌', category: 'Energy', description: 'Unplug all idle devices and electronics for 2 weeks.', duration: 14, impactKg: 5, difficulty: 'easy', tips: 'Use power strips for easy switching. Check chargers, TVs, and appliances.' },
  { id: 'zero_waste', title: 'Zero Waste Weekend', icon: '♻️', category: 'Lifestyle', description: 'Produce zero landfill waste for an entire weekend.', duration: 2, impactKg: 3, difficulty: 'hard', tips: 'Bring reusable bags, avoid packaging, and compost food scraps.' },
  { id: 'cold_shower', title: 'Cold Shower Week', icon: '🚿', category: 'Energy', description: 'Take cold showers for one week to save water heating energy.', duration: 7, impactKg: 2, difficulty: 'hard', tips: 'Start with warm then switch to cold for the last 2 minutes.' },
  { id: 'local_food', title: 'Eat Local for a Week', icon: '🌽', category: 'Food', description: 'Only eat locally sourced food for 7 days.', duration: 7, impactKg: 8, difficulty: 'medium', tips: 'Visit farmers markets, check labels for origin, grow herbs at home.' },
  { id: 'digital_detox', title: 'Screen Time Diet', icon: '📵', category: 'Lifestyle', description: 'Cut daily screen time by 2 hours for a week.', duration: 7, impactKg: 1, difficulty: 'medium', tips: 'Replace streaming with reading, walking, or board games.' },
  { id: 'reuse', title: '30-Day Reuse Challenge', icon: '🔄', category: 'Lifestyle', description: 'Find a reuse alternative for one new item each day.', duration: 30, impactKg: 20, difficulty: 'medium', tips: 'Repurpose containers, mend clothes, borrow tools instead of buying.' },
];

// ---- Storage Helpers ---- //
function getActiveChallenge() { return storage.get('activeChallenge'); }
function getChallengeHistory() { return storage.get('challengeHistory') || []; }

function joinChallenge(id) {
  const challenge = CHALLENGES.find(c => c.id === id);
  if (!challenge) return;
  storage.set('activeChallenge', {
    ...challenge,
    startDate: new Date().toISOString(),
    progress: 0,
    logs: [], // Daily check-in log entries
  });
}

/**
 * Log a day's progress with an optional note.
 * Prevents logging the same calendar day twice.
 */
function logProgress(note = '') {
  const active = getActiveChallenge();
  if (!active) return { success: false, message: 'No active challenge.' };

  const today = new Date().toDateString();
  const alreadyLoggedToday = (active.logs || []).some(l => new Date(l.date).toDateString() === today);
  if (alreadyLoggedToday) {
    return { success: false, message: 'You\'ve already logged today. Come back tomorrow!' };
  }

  active.logs = active.logs || [];
  active.logs.push({ date: new Date().toISOString(), note: note.trim() });
  active.progress = active.logs.length;

  if (active.progress >= active.duration) {
    completeChallenge(active);
    return { success: true, completed: true };
  }

  storage.set('activeChallenge', active);
  return { success: true, completed: false };
}

function logSimulatedProgress(note = 'Simulated progress') {
  const active = getActiveChallenge();
  if (!active) return { success: false, message: 'No active challenge.' };

  active.logs = active.logs || [];
  
  // Calculate next simulated date: last log date + 1 day, or today + 1 day
  let nextDate = new Date();
  if (active.logs.length > 0) {
    const lastDate = new Date(active.logs[active.logs.length - 1].date);
    nextDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
  }
  
  active.logs.push({ date: nextDate.toISOString(), note: note.trim() });
  active.progress = active.logs.length;

  if (active.progress >= active.duration) {
    completeChallenge(active);
    return { success: true, completed: true };
  }

  storage.set('activeChallenge', active);
  return { success: true, completed: false };
}

function abandonChallenge() {
  storage.remove('activeChallenge');
}

function completeChallenge(challenge) {
  const history = getChallengeHistory();
  history.push({ ...challenge, completedDate: new Date().toISOString() });
  storage.set('challengeHistory', history);
  storage.remove('activeChallenge');
}

// ---- Toast Notification ---- //
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- Log Progress Modal ---- //
function showLogModal() {
  const existing = document.getElementById('log-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'log-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'log-modal-title');

  overlay.innerHTML = `
    <div class="modal" style="max-width:420px">
      <div class="modal__header">
        <h3 id="log-modal-title">📝 Log Today's Progress</h3>
        <button class="modal__close" id="modal-close-btn" aria-label="Close dialog">✕</button>
      </div>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-4)">
        How did it go today? Add an optional note about your experience.
      </p>
      <div class="input-group" style="margin-bottom:var(--space-6)">
        <label class="input-group__label" for="log-note">Note (optional)</label>
        <input type="text" id="log-note" class="input-group__field"
               placeholder="e.g. Cycled to work, felt great!"
               maxlength="120" autocomplete="off" />
        <small id="log-note-count" style="text-align:right;color:var(--text-tertiary)">0 / 120</small>
      </div>
      <div style="display:flex;gap:var(--space-3)">
        <button class="btn btn--primary" style="flex:1" id="modal-confirm-btn">✅ Log This Day</button>
        <button class="btn btn--ghost" id="modal-cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const noteInput = document.getElementById('log-note');
  const countEl = document.getElementById('log-note-count');

  noteInput?.addEventListener('input', () => {
    countEl.textContent = `${noteInput.value.length} / 120`;
  });

  const close = () => overlay.remove();

  document.getElementById('modal-close-btn')?.addEventListener('click', close);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.getElementById('modal-confirm-btn')?.addEventListener('click', () => {
    const note = noteInput?.value || '';
    const result = logProgress(note);
    close();
    if (result.completed) {
      showToast('🎉 Challenge completed! Congratulations!', 'success');
    } else if (result.success) {
      showToast('📝 Progress logged for today!', 'success');
    } else {
      showToast(result.message, 'warning');
    }
    // Re-render page
    const main = document.getElementById('main-content');
    if (main) main.innerHTML = renderChallenges();
    bindChallengeEvents();
  });

  noteInput?.focus();
}

// ---- Render ---- //
function renderActiveChallenge(active) {
  const logs = active.logs || [];
  const progress = logs.length;
  const pct = Math.round((progress / active.duration) * 100);
  const today = new Date().toDateString();
  const loggedToday = logs.some(l => new Date(l.date).toDateString() === today);
  const daysLeft = active.duration - progress;

  return `
    <div class="card card--accent" style="margin-bottom:var(--space-6)" id="active-challenge-card">
      <div style="display:flex;align-items:flex-start;gap:var(--space-4);margin-bottom:var(--space-4)">
        <span style="font-size:2.5rem;flex-shrink:0">${active.icon}</span>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">
            <h3 style="margin-bottom:2px">${active.title}</h3>
            <span class="badge badge--green">🔥 Active</span>
            ${loggedToday ? '<span class="badge badge--teal">✅ Logged Today</span>' : '<span class="badge badge--amber">📅 Not Logged Yet</span>'}
          </div>
          <p style="color:var(--text-secondary);font-size:var(--text-sm);margin:var(--space-1) 0 0">${active.description}</p>
        </div>
      </div>

      <!-- Progress Ring + Stats -->
      <div style="display:grid;grid-template-columns:auto 1fr;gap:var(--space-6);align-items:center;margin-bottom:var(--space-4)">
        <!-- SVG Ring -->
        <div style="text-align:center">
          <svg width="90" height="90" viewBox="0 0 90 90" aria-label="${pct}% complete">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
            <circle cx="45" cy="45" r="38" fill="none" stroke="var(--accent-green)" stroke-width="8"
              stroke-dasharray="${Math.round(2 * Math.PI * 38 * pct / 100)} ${Math.round(2 * Math.PI * 38)}"
              stroke-dashoffset="${Math.round(2 * Math.PI * 38 * 0.25)}"
              stroke-linecap="round"
              style="filter:drop-shadow(0 0 6px var(--accent-green));transition:stroke-dasharray 0.8s ease"/>
            <text x="45" y="40" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="700" font-family="Inter">${pct}%</text>
            <text x="45" y="56" text-anchor="middle" fill="var(--text-tertiary)" font-size="8" font-family="Inter">complete</text>
          </svg>
        </div>
        <!-- Stats -->
        <div style="display:flex;flex-direction:column;gap:var(--space-3)">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
            <span style="color:var(--text-secondary)">Progress</span>
            <strong>${progress} / ${active.duration} days</strong>
          </div>
          <div class="progress-bar"><div class="progress-bar__fill" style="width:${pct}%"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
            <span style="color:var(--text-secondary)">Days left</span>
            <strong style="color:var(--accent-amber)">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
            <span style="color:var(--text-secondary)">CO₂ to save</span>
            <strong style="color:var(--accent-teal)">${active.impactKg} kg</strong>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-4)">
        <button class="btn btn--primary" id="challenge-log" ${loggedToday ? 'disabled' : ''}>
          📝 ${loggedToday ? 'Logged Today ✓' : 'Log Today\'s Progress'}
        </button>
        <button class="btn btn--secondary" id="challenge-log-demo">
          🧪 Simulate Day (Demo)
        </button>
        <button class="btn btn--ghost btn--sm" id="challenge-abandon" style="color:var(--accent-coral)">🗑 Abandon</button>
      </div>

      <!-- Daily Log History -->
      ${logs.length > 0 ? `
        <details style="margin-top:var(--space-2)">
          <summary style="cursor:pointer;font-size:var(--text-sm);color:var(--text-secondary);user-select:none;padding:var(--space-2) 0">
            📜 View check-in history (${logs.length} day${logs.length !== 1 ? 's' : ''})
          </summary>
          <div style="margin-top:var(--space-3);display:flex;flex-direction:column;gap:var(--space-2)">
            ${logs.map((l, i) => `
              <div style="display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) var(--space-3);background:var(--bg-surface);border-radius:var(--radius-sm)">
                <span style="color:var(--accent-green);font-size:var(--text-sm);flex-shrink:0">Day ${i + 1}</span>
                <span style="font-size:var(--text-xs);color:var(--text-tertiary);flex-shrink:0">${new Date(l.date).toLocaleDateString()}</span>
                ${l.note ? `<span style="font-size:var(--text-sm);color:var(--text-secondary);flex:1">"${l.note}"</span>` : ''}
              </div>
            `).join('')}
          </div>
        </details>
      ` : ''}

      <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-3)">💡 Tip: ${active.tips}</p>
    </div>
  `;
}

export function renderChallenges() {
  const active = getActiveChallenge();
  const history = getChallengeHistory();
  const completedIds = history.map(h => h.id);
  const totalImpact = history.reduce((sum, h) => sum + h.impactKg, 0);

  const html = `
    <div class="page-header">
      <h1 class="page-header__title">🏆 Eco Challenges</h1>
      <p class="page-header__subtitle">Take on challenges to reduce your footprint</p>
    </div>

    <!-- Stats Row -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
      <div class="card" style="text-align:center">
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)">${history.length}</div>
        <small>Completed</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-teal)">${totalImpact} kg</div>
        <small>CO₂ Saved</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-amber)">${active ? active.logs?.length || 0 : '—'}</div>
        <small>${active ? 'Days Logged' : 'No Active'}</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-purple)">${CHALLENGES.length}</div>
        <small>Available</small>
      </div>
    </div>

    <!-- Active Challenge -->
    ${active ? renderActiveChallenge(active) : ''}

    <!-- Challenge Grid -->
    <h3 style="margin-bottom:var(--space-4)">${active ? 'Other Challenges' : 'Available Challenges'}</h3>
    <div class="dashboard-grid">
      ${CHALLENGES.map(c => {
        const done = completedIds.includes(c.id);
        const isActive = active?.id === c.id;
        if (isActive) return ''; // already shown above
        return `
          <div class="card ${done ? '' : 'card--interactive'}" style="opacity:${done ? '0.7' : '1'}">
            <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
              <span style="font-size:2rem">${c.icon}</span>
              <div style="flex:1">
                <h4 style="margin-bottom:4px">${c.title}</h4>
                <div style="display:flex;gap:var(--space-2)">
                  <span class="badge badge--${c.difficulty === 'easy' ? 'green' : c.difficulty === 'medium' ? 'amber' : 'coral'}">${c.difficulty}</span>
                  <span class="badge badge--teal">${c.category}</span>
                </div>
              </div>
            </div>
            <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">${c.description}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2)">
              <span style="font-size:var(--text-xs);color:var(--text-tertiary)">📅 ${c.duration} days · 🌿 ~${c.impactKg} kg CO₂</span>
              ${done
                ? '<span class="badge badge--green">✅ Completed</span>'
                : active
                  ? '<button class="btn btn--sm btn--ghost" disabled title="Finish your active challenge first">Locked</button>'
                  : `<button class="btn btn--sm btn--secondary join-challenge" data-id="${c.id}">Join →</button>`
              }
            </div>
          </div>
        `;
      }).filter(Boolean).join('')}
    </div>

    <!-- History -->
    ${history.length > 0 ? `
      <h3 style="margin:var(--space-8) 0 var(--space-4)">🏅 Completed Challenges</h3>
      <div style="display:flex;flex-direction:column;gap:var(--space-3)">
        ${history.map(h => `
          <div class="card" style="display:flex;align-items:center;gap:var(--space-4)">
            <span style="font-size:1.5rem">${h.icon}</span>
            <div style="flex:1">
              <div style="font-weight:600">${h.title}</div>
              <small>Completed ${new Date(h.completedDate).toLocaleDateString()} · Saved ~${h.impactKg} kg CO₂</small>
            </div>
            <span class="badge badge--green">✅ Done</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  return html;
}

export function bindChallengeEvents() {
  document.querySelectorAll('.join-challenge').forEach(btn => {
    btn.addEventListener('click', () => {
      joinChallenge(btn.dataset.id);
      const main = document.getElementById('main-content');
      if (main) main.innerHTML = renderChallenges();
      bindChallengeEvents();
      showToast('🏆 Challenge started! Log your first day of progress.', 'success');
    });
  });

  document.getElementById('challenge-log')?.addEventListener('click', showLogModal);

  document.getElementById('challenge-log-demo')?.addEventListener('click', () => {
    const result = logSimulatedProgress('Logged via Demo Mode');
    if (result.completed) {
      showToast('🎉 Challenge completed! Congratulations!', 'success');
    } else if (result.success) {
      showToast('🧪 Simulated progress logged for next day!', 'success');
    }
    // Re-render page
    const main = document.getElementById('main-content');
    if (main) main.innerHTML = renderChallenges();
    bindChallengeEvents();
  });

  document.getElementById('challenge-abandon')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to abandon this challenge? Progress will be lost.')) {
      abandonChallenge();
      const main = document.getElementById('main-content');
      if (main) main.innerHTML = renderChallenges();
      bindChallengeEvents();
      showToast('Challenge abandoned.', 'warning');
    }
  });
}
