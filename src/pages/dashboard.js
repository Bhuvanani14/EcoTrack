/**
 * EcoTrack Dashboard Page
 * Personalized overview with charts, eco-score, and recommendations.
 */
import { ContextEngine } from '../core/context-engine.js';
import { calculateTotalFootprint } from '../core/calculator-engine.js';
import { getTopRecommendations } from '../core/recommendation-engine.js';
import { getDailyFact } from '../core/fun-facts.js';
import { BENCHMARKS } from '../core/emission-factors.js';
import { formatNumber, getEcoGradeColor, getCategoryIcon, getCategoryColor } from '../utils/format.js';

const ctx = new ContextEngine();

function getFootprint() {
  const profile = ctx.getUserProfile();
  if (!profile || !profile.transport) return null;
  return calculateTotalFootprint(profile);
}

export function renderDashboard() {
  const fp = getFootprint();
  const streak = ctx.updateStreak();
  const trend = ctx.getTrend();
  const fact = getDailyFact();

  if (!fp) {
    return `
      <div class="page-header"><h1 class="page-header__title">Dashboard</h1></div>
      <div class="empty-state">
        <div class="empty-state__icon">📊</div>
        <div class="empty-state__title">No data yet</div>
        <div class="empty-state__text">Complete the setup wizard or use the calculator to see your dashboard.</div>
        <button class="btn btn--primary" onclick="location.hash='#/calculator'">Open Calculator</button>
      </div>
    `;
  }

  const profile = ctx.getUserProfile();
  const recommendations = getTopRecommendations(profile, 3);
  const gradeColor = getEcoGradeColor(fp.ecoScore.grade);
  const highestCat = ctx.getHighestImpactCategory(fp);
  const categories = ['transport', 'food', 'energy', 'lifestyle'];

  const trendIcon = trend.direction === 'improving' ? '📉' : trend.direction === 'increasing' ? '📈' : '➡️';
  const trendColor = trend.direction === 'improving' ? 'var(--accent-green)' : trend.direction === 'increasing' ? 'var(--accent-coral)' : 'var(--text-secondary)';

  return `
    <div class="page-header">
      <h1 class="page-header__title">Dashboard</h1>
      <p class="page-header__subtitle">Your carbon footprint at a glance</p>
    </div>

    <!-- Hero Stats -->
    <div class="dashboard-grid--stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
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

    <!-- Category Breakdown + Comparisons -->
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

    <!-- Comparisons -->
    <div class="dashboard-grid--stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
      <div class="card card--accent" style="text-align:center">
        <div style="font-size:1.5rem">🌳</div>
        <div style="font-size:var(--text-2xl);font-weight:700;margin:var(--space-1) 0">${fp.equivalents.trees}</div>
        <small style="color:var(--text-secondary)">trees needed to offset</small>
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
    </div>

    <!-- Top Recommendations -->
    <div class="card" style="margin-bottom:var(--space-6)">
      <h3 style="margin-bottom:var(--space-4)">💡 Top Recommendations</h3>
      <div style="display:grid;gap:var(--space-3)">
        ${recommendations.map(r => `
          <div class="card card--interactive" style="padding:var(--space-4);display:flex;align-items:center;gap:var(--space-4)">
            <span style="font-size:1.8rem">${r.icon}</span>
            <div style="flex:1">
              <div style="font-weight:600;margin-bottom:2px">${r.title}</div>
              <small style="color:var(--text-secondary)">${r.description}</small>
            </div>
            <span class="badge badge--green">-${r.savingsKgPerMonth} kg/mo</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Fun Fact of the Day -->
    <div class="card" style="border-color:var(--accent-teal-dim)">
      <small style="color:var(--accent-teal)">💡 Fun Fact of the Day</small>
      <p style="margin:var(--space-2) 0 0;font-size:var(--text-sm)">${fact.icon} ${fact.text}</p>
      <small style="color:var(--text-tertiary)">Source: ${fact.source}</small>
    </div>
  `;
}

export function initDashboardCharts() {
  const fp = getFootprint();
  if (!fp) return;

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
