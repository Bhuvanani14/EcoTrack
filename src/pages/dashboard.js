/**
 * EcoTrack Dashboard Page v2
 * Adds: Carbon Avatar, Daily Budget Ring, Top 3 AI Actions, What-If shortcut.
 */
import { ctx } from '../core/context-engine.js';
import { calculateTotalFootprint } from '../core/calculator-engine.js';
import { getTopRecommendations } from '../core/recommendation-engine.js';
import { getDailyFact } from '../core/fun-facts.js';
import { BENCHMARKS } from '../core/emission-factors.js';
import { formatNumber, getEcoGradeColor, getCategoryIcon, getCategoryColor } from '../utils/format.js';
import { generateDailyInsights, isAIEnabled } from '../core/gemini-engine.js';

function getFootprint() {
  const profile = ctx.getUserProfile();
  if (!profile || !profile.transport) return null;
  return calculateTotalFootprint(profile);
}

// ---- Carbon Avatar Widget ---- //
function renderAvatarWidget(ecoScore) {
  const avatar = ctx.getAvatarState(ecoScore);
  const tiers = ctx.getAvatarTiers();
  const tierIndex = tiers.findIndex(t => t.key === avatar.key);
  const progressPct = Math.min(100, ecoScore);

  return `
    <div class="card" style="text-align:center;position:relative;overflow:hidden" id="avatar-card">
      <!-- Animated background glow -->
      <div style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:200px;height:200px;
                  background:radial-gradient(circle,${avatar.color}22 0%,transparent 70%);pointer-events:none;z-index:0"></div>

      <div style="position:relative;z-index:1">
        <small style="color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;font-size:var(--text-xs)">Your Carbon Avatar</small>

        <!-- 3D tilt avatar icon -->
        <div id="avatar-icon-wrap" style="perspective:600px;margin:var(--space-3) 0">
          <div id="avatar-icon" style="
            display:inline-block;font-size:4rem;
            width:90px;height:90px;border-radius:50%;
            background:radial-gradient(135deg,${avatar.color}33,${avatar.color}11);
            border:3px solid ${avatar.color}66;
            display:flex;align-items:center;justify-content:center;
            margin:0 auto;cursor:default;
            transition:transform 0.1s ease;
            box-shadow:0 0 20px ${avatar.color}44;
            animation:avatarPulse 3s ease-in-out infinite;
          ">${avatar.icon}</div>
        </div>

        <div style="font-size:var(--text-xl);font-weight:700;color:${avatar.color};margin-bottom:var(--space-1)">${avatar.label}</div>
        <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-4);max-width:200px;margin-left:auto;margin-right:auto">${avatar.description}</p>

        <!-- Tier progression -->
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:4px;margin-bottom:var(--space-1)">
          ${tiers.slice().reverse().map((t, i) => `
            <div title="${t.label}" style="flex:1;text-align:center">
              <div style="font-size:${t.key === avatar.key ? '1.2rem' : '0.9rem'};opacity:${t.key === avatar.key ? '1' : '0.4'};transition:all 0.3s">${t.icon}</div>
            </div>
          `).join('')}
        </div>
        <div class="progress-bar" style="height:6px">
          <div class="progress-bar__fill" style="width:${progressPct}%;background:linear-gradient(90deg,#38ef7d,${avatar.color});transition:width 1s ease"></div>
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-1)">${ecoScore}/100 points</div>
      </div>
    </div>

    <style>
      @keyframes avatarPulse {
        0%, 100% { box-shadow: 0 0 20px ${avatar.color}44; }
        50% { box-shadow: 0 0 40px ${avatar.color}88; }
      }
    </style>
  `;
}

// ---- Daily Carbon Budget Ring ---- //
function renderBudgetRing(dailyBudget) {
  const { budget, used, pct, status } = dailyBudget;
  const statusColor = status === 'great' ? 'var(--accent-green)' : status === 'ok' ? 'var(--accent-amber)' : 'var(--accent-coral)';
  const statusLabel = status === 'great' ? '✅ Under Budget' : status === 'ok' ? '⚠️ Near Limit' : '🔴 Over Budget';

  // SVG donut ring
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const filledDash = Math.min(1, pct / 100) * circumference;
  const remainingDash = circumference - filledDash;

  return `
    <div class="card" style="text-align:center">
      <small style="color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;font-size:var(--text-xs)">Daily Carbon Budget</small>
      <div style="margin:var(--space-3) 0;position:relative;display:inline-block">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Daily carbon budget ring">
          <!-- Background ring -->
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
          <!-- Used ring -->
          <circle cx="60" cy="60" r="${radius}" fill="none"
            stroke="${statusColor}" stroke-width="10"
            stroke-dasharray="${filledDash} ${remainingDash}"
            stroke-dashoffset="${circumference * 0.25}"
            stroke-linecap="round"
            style="transition:stroke-dasharray 1.2s ease;filter:drop-shadow(0 0 6px ${statusColor}88)"/>
          <!-- Center text -->
          <text x="60" y="54" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="700" font-family="Inter">${used}</text>
          <text x="60" y="68" text-anchor="middle" fill="var(--text-tertiary)" font-size="8" font-family="Inter">of ${budget} kg</text>
        </svg>
      </div>
      <div style="font-size:var(--text-sm);font-weight:600;color:${statusColor}">${statusLabel}</div>
      <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-1)">Your daily CO₂ target is <strong>${budget} kg</strong><br>(2050 climate goal)</p>
      <button class="btn btn--ghost" style="margin-top:var(--space-3);font-size:var(--text-xs)" onclick="location.hash='#/simulator'">
      <button class="btn btn--ghost" style="margin-top:var(--space-3);font-size:var(--text-xs)" data-nav="/simulator">
        🔁 Explore What-If Swaps
      </button>
    </div>
  `;
}

// ---- Top 3 Daily Actions ---- //
async function loadAndRenderDailyActions(fp, profile) {
  const container = document.getElementById('daily-actions-content');
  if (!container) return;

  // Check cache first
  let insights = ctx.getCachedDailyInsights();
  const completed = ctx.getTodayCompletedActions();

  if (!insights) {
    if (isAIEnabled()) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:var(--space-4)">✨ AI generating your personalized tips...</div>';
      insights = await generateDailyInsights(profile, fp);
      if (insights) ctx.cacheDailyInsights(insights);
    }

    if (!insights) {
      // Fallback to rule-based recommendations
      const recs = getTopRecommendations(profile, 3);
      insights = recs.map(r => `${r.icon} ${r.title} — ${r.description}`);
      ctx.cacheDailyInsights(insights);
    }
  }

  container.innerHTML = insights.map((tip, i) => {
    const isDone = completed.includes(i);
    return `
      <div class="card card--interactive daily-action-item" data-index="${i}"
           style="padding:var(--space-3) var(--space-4);display:flex;align-items:center;gap:var(--space-3);
                  opacity:${isDone ? '0.6' : '1'};transition:all 0.3s ease;cursor:pointer">
        <div style="width:24px;height:24px;border-radius:50%;border:2px solid ${isDone ? 'var(--accent-green)' : 'var(--border-default)'};
                    background:${isDone ? 'var(--accent-green)' : 'transparent'};
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.3s">
          ${isDone ? '<span style="color:#000;font-size:12px">✓</span>' : ''}
        </div>
        <span style="font-size:var(--text-sm);${isDone ? 'text-decoration:line-through;color:var(--text-tertiary)' : ''}">${tip}</span>
      </div>
    `;
  }).join('');

  // Attach click handlers
  container.querySelectorAll('.daily-action-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index);
      ctx.completeDailyAction(idx);
      loadAndRenderDailyActions(fp, profile);
    });
  });
}

export function renderDashboard() {
  const fp = getFootprint();
  const streak = ctx.updateStreak();
  const trend = ctx.getTrend();
  const fact = getDailyFact();
  const profile = ctx.getUserProfile();

  if (!fp) {
    return `
      <div class="page-header"><h1 class="page-header__title">Dashboard</h1></div>
      <div class="empty-state">
        <div class="empty-state__icon">📊</div>
        <div class="empty-state__title">No data yet</div>
        <div class="empty-state__text">Complete the setup wizard or chat with EcoBot to see your dashboard.</div>
        <div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap">
          <button class="btn btn--primary" data-nav="/assistant">🤖 Chat with EcoBot</button>
          <button class="btn btn--secondary" data-nav="/calculator">🧮 Open Calculator</button>
        </div>
      </div>
    `;
  }

  const gradeColor = getEcoGradeColor(fp.ecoScore.grade);
  const highestCat = ctx.getHighestImpactCategory(fp);
  const categories = ['transport', 'food', 'energy', 'lifestyle'];
  const trendIcon = trend.direction === 'improving' ? '📉' : trend.direction === 'increasing' ? '📈' : '➡️';
  const trendColor = trend.direction === 'improving' ? 'var(--accent-green)' : trend.direction === 'increasing' ? 'var(--accent-coral)' : 'var(--text-secondary)';
  const dailyBudget = ctx.getDailyBudget();

  return `
    <div class="page-header">
      <h1 class="page-header__title">Dashboard</h1>
      <p class="page-header__subtitle">Your carbon footprint at a glance</p>
    </div>

    <!-- Hero Stats Row -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
      <div class="card" style="text-align:center">
        <small style="color:var(--text-secondary)">Annual Footprint</small>
        <div style="font-size:var(--text-4xl);font-weight:700;font-family:var(--font-heading);color:${gradeColor};margin:var(--space-2) 0">${formatNumber(fp.annual.total)}t</div>
        <small style="color:var(--text-tertiary)">CO₂e per year</small>
      </div>
      <div class="card" style="text-align:center">
        <small style="color:var(--text-secondary)">Eco Score</small>
        <div style="font-size:var(--text-4xl);font-weight:700;font-family:var(--font-heading);color:${gradeColor};margin:var(--space-2) 0">${fp.ecoScore.grade}</div>
        <small style="color:var(--text-tertiary)">${fp.ecoScore.score}/100 points</small>
      </div>
      <div class="card" style="text-align:center">
        <small style="color:var(--text-secondary)">vs Global Avg</small>
        <div style="font-size:var(--text-4xl);font-weight:700;font-family:var(--font-heading);color:${fp.comparison.vs_global > 100 ? 'var(--accent-coral)' : 'var(--accent-green)'};margin:var(--space-2) 0">${fp.comparison.vs_global}%</div>
        <small style="color:var(--text-tertiary)">of ${BENCHMARKS.global_average}t avg</small>
      </div>
      <div class="card" style="text-align:center">
        <small style="color:var(--text-secondary)">Streak</small>
        <div style="font-size:var(--text-4xl);font-weight:700;font-family:var(--font-heading);color:var(--accent-amber);margin:var(--space-2) 0">🔥 ${streak}</div>
        <small style="color:var(--text-tertiary)">day${streak !== 1 ? 's' : ''}</small>
      </div>
    </div>

    <!-- Avatar + Budget Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-6)">
      ${renderAvatarWidget(fp.ecoScore.score)}
      ${renderBudgetRing(dailyBudget)}
    </div>

    <!-- Today's Top 3 Actions -->
    <div class="card" style="margin-bottom:var(--space-6)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
        <h3>✅ Today's Top 3 Actions</h3>
        ${isAIEnabled() ? '<span class="badge badge--green" style="font-size:var(--text-xs)">✨ AI-Powered</span>' : ''}
      </div>
      <div id="daily-actions-content">
        <div style="text-align:center;color:var(--text-tertiary);padding:var(--space-4)">Loading your personalized actions...</div>
      </div>
    </div>

    <!-- Category Breakdown + Monthly Emissions -->
    <div class="dashboard-grid" style="margin-bottom:var(--space-6)">
      <div class="card">
        <h3 style="margin-bottom:var(--space-4)">Category Breakdown</h3>
        <canvas id="dashboard-doughnut" width="300" height="300" aria-label="Carbon footprint breakdown by category" role="img"></canvas>
      </div>
      <div class="card">
        <h3 style="margin-bottom:var(--space-4)">Monthly Emissions</h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">
          ${categories.map(cat => {
            const val = fp.monthly[cat];
            const pct = Math.round((val / fp.monthly.total) * 100);
            return `
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1)">
                  <span>${getCategoryIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                  <span style="font-weight:600;color:${getCategoryColor(cat)}">${formatNumber(val, 0)} kg</span>
                </div>
                <div class="progress-bar"><div class="progress-bar__fill" style="width:${pct}%;background:${getCategoryColor(cat)}"></div></div>
              </div>`;
          }).join('')}
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;font-weight:600">
            <span>Total Monthly</span><span>${formatNumber(fp.monthly.total, 0)} kg CO₂e</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Equivalents Row -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
      <div class="card card--accent" style="text-align:center">
        <div style="font-size:1.5rem">🌳</div>
        <div style="font-size:var(--text-2xl);font-weight:700;margin:var(--space-1) 0">${fp.equivalents.trees}</div>
        <small style="color:var(--text-secondary)">trees to offset</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:1.5rem">${trendIcon}</div>
        <div style="font-size:var(--text-2xl);font-weight:700;color:${trendColor};margin:var(--space-1) 0">${trend.direction}</div>
        <small style="color:var(--text-secondary)">${trend.change > 0 ? '+' : ''}${trend.change} kg/mo</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:1.5rem">🎯</div>
        <div style="font-size:var(--text-2xl);font-weight:700;color:${fp.comparison.vs_target > 100 ? 'var(--accent-coral)' : 'var(--accent-green)'};margin:var(--space-1) 0">${fp.comparison.vs_target}%</div>
        <small style="color:var(--text-secondary)">of 2050 target (2t)</small>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:1.5rem">🔁</div>
        <div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-teal);margin:var(--space-1) 0">Sim</div>
        <button class="btn btn--ghost" style="font-size:var(--text-xs);padding:4px 12px;margin-top:4px" data-nav="/simulator">What-If?</button>
      </div>
    </div>

    <!-- Fun Fact -->
    <div class="card" style="border-color:var(--accent-teal-dim)">
      <small style="color:var(--accent-teal)">💡 Fun Fact of the Day</small>
      <p style="margin:var(--space-2) 0 0;font-size:var(--text-sm)">${fact.icon} ${fact.text}</p>
      <small style="color:var(--text-tertiary)">Source: ${fact.source}</small>
    </div>
  `;
}

export function initDashboardCharts() {
  bindNavButtons();
  
  const fp = getFootprint();
  if (!fp) return;

  // Init avatar 3D tilt
  const icon = document.getElementById('avatar-icon');
  const wrap = document.getElementById('avatar-icon-wrap');
  if (icon && wrap) {
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      icon.style.transform = `rotateY(${x * 30}deg) rotateX(${-y * 30}deg) scale(1.05)`;
    });
    wrap.addEventListener('mouseleave', () => {
      icon.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
    });
  }

  // Load daily actions
  const profile = ctx.getUserProfile();
  loadAndRenderDailyActions(fp, profile);

  // Chart
  const canvas = document.getElementById('dashboard-doughnut');
  if (!canvas) return;

  import('chart.js').then(({ Chart, DoughnutController, ArcElement, Tooltip, Legend }) => {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Transport', 'Food', 'Energy', 'Lifestyle'],
        datasets: [{
          data: [fp.monthly.transport, fp.monthly.food, fp.monthly.energy, fp.monthly.lifestyle],
          backgroundColor: ['#00b4d8', '#00d68f', '#f5a623', '#a78bfa'],
          borderColor: 'rgba(10,15,26,0.8)',
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8892a4', padding: 16, font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: '#121d38',
            titleColor: '#e8ecf1',
            bodyColor: '#8892a4',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: { label: (c) => ` ${c.label}: ${c.parsed} kg CO₂e/mo` }
          }
        }
      }
    });
  });
}

function bindNavButtons() {
  document.querySelectorAll('button[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = '#' + btn.getAttribute('data-nav');
    });
  });
}
