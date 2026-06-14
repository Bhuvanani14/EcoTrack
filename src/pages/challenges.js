/**
 * EcoTrack Challenges Page
 * Eco-challenges with progress tracking and badges.
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

function getActiveChallenge() { return storage.get('activeChallenge'); }
function getChallengeHistory() { return storage.get('challengeHistory') || []; }

function joinChallenge(id) {
  const challenge = CHALLENGES.find(c => c.id === id);
  if (!challenge) return;
  storage.set('activeChallenge', { ...challenge, startDate: new Date().toISOString(), progress: 0 });
}

function updateProgress(days) {
  const active = getActiveChallenge();
  if (!active) return;
  active.progress = Math.min(days, active.duration);
  if (active.progress >= active.duration) {
    completeChallenge(active);
  } else {
    storage.set('activeChallenge', active);
  }
}

function completeChallenge(challenge) {
  const history = getChallengeHistory();
  history.push({ ...challenge, completedDate: new Date().toISOString() });
  storage.set('challengeHistory', history);
  storage.remove('activeChallenge');
}

export function renderChallenges() {
  const active = getActiveChallenge();
  const history = getChallengeHistory();
  const completedIds = history.map(h => h.id);
  const totalImpact = history.reduce((sum, h) => sum + h.impactKg, 0);

  let activeHTML = '';
  if (active) {
    const elapsed = Math.floor((Date.now() - new Date(active.startDate).getTime()) / 86400000);
    const progress = Math.min(elapsed, active.duration);
    const pct = Math.round((progress / active.duration) * 100);
    activeHTML = `
      <div class="card card--accent" style="margin-bottom:var(--space-6)">
        <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
          <span style="font-size:2.5rem">${active.icon}</span>
          <div>
            <h3>${active.title}</h3>
            <p style="color:var(--text-secondary);font-size:var(--text-sm);margin:0">${active.description}</p>
          </div>
        </div>
        <div style="margin-bottom:var(--space-2);display:flex;justify-content:space-between;font-size:var(--text-sm)">
          <span>Day ${progress} of ${active.duration}</span><span style="color:var(--accent-green)">${pct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-bar__fill" style="width:${pct}%"></div></div>
        <div style="margin-top:var(--space-4);display:flex;gap:var(--space-3)">
          <button class="btn btn--primary btn--sm" id="challenge-log">📝 Log Progress</button>
          <button class="btn btn--ghost btn--sm" id="challenge-complete">✅ Complete</button>
        </div>
        <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-3)">💡 Tip: ${active.tips}</p>
      </div>
    `;
  }

  const html = `
    <div class="page-header">
      <h1 class="page-header__title">🏆 Eco Challenges</h1>
      <p class="page-header__subtitle">Take on challenges to reduce your footprint</p>
    </div>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
      <div class="card" style="text-align:center">
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)">${history.length}</div>
        <small style="color:var(--text-secondary)">Completed</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-teal)">${totalImpact} kg</div>
        <small style="color:var(--text-secondary)">CO₂ Saved</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-amber)">${active ? '🔥' : '—'}</div>
        <small style="color:var(--text-secondary)">${active ? 'In Progress' : 'No Active'}</small>
      </div>
    </div>

    ${activeHTML}

    <h3 style="margin-bottom:var(--space-4)">Available Challenges</h3>
    <div class="dashboard-grid">
      ${CHALLENGES.map(c => {
        const done = completedIds.includes(c.id);
        const isActive = active?.id === c.id;
        return `
          <div class="card ${done ? '' : 'card--interactive'}" style="opacity:${isActive ? '0.5' : '1'}">
            <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
              <span style="font-size:2rem">${c.icon}</span>
              <div>
                <h4 style="margin-bottom:2px">${c.title}</h4>
                <span class="badge badge--${c.difficulty === 'easy' ? 'green' : c.difficulty === 'medium' ? 'amber' : 'coral'}">${c.difficulty}</span>
              </div>
            </div>
            <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">${c.description}</p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:var(--text-xs);color:var(--text-tertiary)">${c.duration} days • Saves ~${c.impactKg} kg CO₂</span>
              ${done ? '<span class="badge badge--green">✅ Done</span>' : isActive ? '<span class="badge badge--amber">Active</span>' : `<button class="btn btn--sm btn--secondary join-challenge" data-id="${c.id}" ${active ? 'disabled' : ''}>Join</button>`}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  setTimeout(() => {
    document.querySelectorAll('.join-challenge').forEach(btn => {
      btn.addEventListener('click', () => { joinChallenge(btn.dataset.id); document.getElementById('main-content').innerHTML = renderChallenges(); });
    });
    document.getElementById('challenge-log')?.addEventListener('click', () => {
      const active = getActiveChallenge();
      if (active) { updateProgress(active.progress + 1); document.getElementById('main-content').innerHTML = renderChallenges(); }
    });
    document.getElementById('challenge-complete')?.addEventListener('click', () => {
      const active = getActiveChallenge();
      if (active) { completeChallenge(active); document.getElementById('main-content').innerHTML = renderChallenges(); }
    });
  }, 100);

  return html;
}
