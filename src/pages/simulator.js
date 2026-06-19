/**
 * EcoTrack What-If Simulator
 * Compare habit swaps and see real CO₂ impact before committing.
 */
import { EMISSION_FACTORS } from '../core/emission-factors.js';
import { calculateTotalFootprint } from '../core/calculator-engine.js';
import { ContextEngine } from '../core/context-engine.js';
import { formatNumber } from '../utils/format.js';

const ctx = new ContextEngine();

// Swap scenarios: [label, category, currentKey, swapKey, description, icon]
const SWAP_SCENARIOS = [
  {
    id: 'car_to_bike',
    title: 'Car → Bicycle',
    icon: '🚴',
    category: 'transport',
    description: 'Replace your daily commute by car with cycling',
    currentMode: 'car_petrol', swapMode: 'bicycle',
    compute: (profile) => {
      const dist = (profile.transport?.commuteDistance || 15);
      const days = 22;
      const saved = (EMISSION_FACTORS.transport.car_petrol.factor - 0) * dist * 2 * days;
      return { savedKgMonth: Math.round(saved), savedTYear: Math.round(saved * 12 / 100) / 10 };
    }
  },
  {
    id: 'car_to_transit',
    title: 'Car → Public Transit',
    icon: '🚌',
    category: 'transport',
    description: 'Switch from driving to bus/train for commuting',
    currentMode: 'car_petrol', swapMode: 'bus',
    compute: (profile) => {
      const dist = (profile.transport?.commuteDistance || 15);
      const days = 22;
      const saved = (EMISSION_FACTORS.transport.car_petrol.factor - EMISSION_FACTORS.transport.bus.factor) * dist * 2 * days;
      return { savedKgMonth: Math.round(saved), savedTYear: Math.round(saved * 12 / 100) / 10 };
    }
  },
  {
    id: 'car_to_ev',
    title: 'Petrol Car → Electric',
    icon: '⚡',
    category: 'transport',
    description: 'Switch from a petrol vehicle to an electric car',
    currentMode: 'car_petrol', swapMode: 'car_electric',
    compute: (profile) => {
      const dist = (profile.transport?.commuteDistance || 15);
      const days = 22;
      const saved = (EMISSION_FACTORS.transport.car_petrol.factor - EMISSION_FACTORS.transport.car_electric.factor) * dist * 2 * days;
      return { savedKgMonth: Math.round(saved), savedTYear: Math.round(saved * 12 / 100) / 10 };
    }
  },
  {
    id: 'beef_to_chicken',
    title: 'Beef → Chicken',
    icon: '🥗',
    category: 'food',
    description: 'Replace beef with chicken in your weekly meals',
    compute: (profile) => {
      // Assume 2kg beef/week replaced by chicken
      const beefPerMonth = 2 * 4.3;
      const saved = (EMISSION_FACTORS.food.beef.factor - EMISSION_FACTORS.food.chicken.factor) * beefPerMonth;
      return { savedKgMonth: Math.round(saved), savedTYear: Math.round(saved * 12 / 100) / 10 };
    }
  },
  {
    id: 'meat_to_vegan',
    title: 'Mixed Diet → Vegan',
    icon: '🌱',
    category: 'food',
    description: 'Switch from a mixed diet to a fully plant-based diet',
    compute: (profile) => {
      const saved = EMISSION_FACTORS.diet_monthly.mixed.factor - EMISSION_FACTORS.diet_monthly.vegan.factor;
      return { savedKgMonth: Math.round(saved), savedTYear: Math.round(saved * 12 / 100) / 10 };
    }
  },
  {
    id: 'renewable_energy',
    title: 'Grid Power → Renewable',
    icon: '☀️',
    category: 'energy',
    description: 'Switch your home electricity to a renewable energy tariff',
    compute: (profile) => {
      const housingFactor = { apartment: 120, small_house: 200, large_house: 350 };
      const base = housingFactor[profile.energy?.housingType] || 150;
      const saved = base * 0.85; // ~85% reduction
      return { savedKgMonth: Math.round(saved), savedTYear: Math.round(saved * 12 / 100) / 10 };
    }
  },
  {
    id: 'short_showers',
    title: '10-min → 4-min Shower',
    icon: '🚿',
    category: 'lifestyle',
    description: 'Cut daily shower time in half',
    compute: () => {
      const saved = EMISSION_FACTORS.lifestyle.shower.factor * 2 * 30; // 2 fewer 5-min increments per day
      return { savedKgMonth: Math.round(saved), savedTYear: Math.round(saved * 12 / 100) / 10 };
    }
  },
  {
    id: 'no_flights',
    title: 'Fly Once → Stay Grounded',
    icon: '✈️',
    category: 'transport',
    description: 'Skip one long-haul flight this year',
    compute: () => {
      const saved = EMISSION_FACTORS.transport.flight_long.factor * EMISSION_FACTORS.flight_distances.long_haul * 2;
      return { savedKgMonth: Math.round(saved / 12), savedTYear: Math.round(saved / 100) / 10 };
    }
  }
];

function renderSimulatorCard(scenario, profile) {
  const result = scenario.compute(profile);
  const trees = Math.round(result.savedTYear * 45);
  const flights = Math.round(result.savedTYear * 0.6 * 10) / 10;
  const catColors = { transport: '#00b4d8', food: '#00d68f', energy: '#f5a623', lifestyle: '#a78bfa' };
  const color = catColors[scenario.category] || '#00b4d8';

  return `
    <div class="card card--interactive simulator-card" data-scenario="${scenario.id}"
         style="cursor:pointer;transition:all 0.3s ease;border:2px solid transparent"
         onclick="document.querySelectorAll('.simulator-card').forEach(c=>c.style.borderColor='transparent');
                  this.style.borderColor='${color}';
                  document.getElementById('sim-result').style.display='block';
                  document.getElementById('sim-title').textContent='${scenario.title}';
                  document.getElementById('sim-icon').textContent='${scenario.icon}';
                  document.getElementById('sim-desc').textContent='${scenario.description}';
                  document.getElementById('sim-kg').textContent='${result.savedKgMonth} kg';
                  document.getElementById('sim-t').textContent='${result.savedTYear}t';
                  document.getElementById('sim-trees').textContent='${trees}';
                  document.getElementById('sim-flights').textContent='${flights}';
                  document.getElementById('sim-bar-fill').style.width=Math.min(100,${result.savedTYear}/5*100)+'%';
                  document.getElementById('sim-bar-fill').style.background='${color}';">
      <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)">
        <span style="font-size:1.8rem">${scenario.icon}</span>
        <div>
          <div style="font-weight:600;font-size:var(--text-sm)">${scenario.title}</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${scenario.category}</div>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div style="font-size:var(--text-lg);font-weight:700;color:${color}">-${result.savedTYear}t</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary)">per year</div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width:${Math.min(100, result.savedTYear / 5 * 100)}%;background:${color}"></div>
      </div>
    </div>
  `;
}

export function renderSimulator() {
  const profile = ctx.getUserProfile();
  const hasProfile = !!profile?.transport;

  const categoryGroups = {
    transport: SWAP_SCENARIOS.filter(s => s.category === 'transport'),
    food: SWAP_SCENARIOS.filter(s => s.category === 'food'),
    energy: SWAP_SCENARIOS.filter(s => s.category === 'energy'),
    lifestyle: SWAP_SCENARIOS.filter(s => s.category === 'lifestyle'),
  };

  return `
    <div class="page-header">
      <h1 class="page-header__title">🔁 What-If Simulator</h1>
      <p class="page-header__subtitle">See the real impact of swapping habits before you commit</p>
    </div>

    ${!hasProfile ? `
      <div class="card card--accent" style="margin-bottom:var(--space-6);text-align:center">
        <div style="font-size:2rem;margin-bottom:var(--space-2)">📊</div>
        <p>For personalized estimates, complete your footprint profile first.</p>
        <button class="btn btn--primary" onclick="location.hash='#/assistant'">Calculate My Footprint</button>
      </div>
    ` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">
      <!-- Left: Scenario List -->
      <div>
        <h3 style="margin-bottom:var(--space-4)">🔄 Pick a Habit Swap</h3>

        ${Object.entries(categoryGroups).map(([cat, scenarios]) => `
          <div style="margin-bottom:var(--space-5)">
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;margin-bottom:var(--space-3)">${cat}</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-2)">
              ${scenarios.map(s => renderSimulatorCard(s, profile)).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Right: Result Panel -->
      <div>
        <div class="card" style="position:sticky;top:var(--space-6);text-align:center;min-height:400px;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div id="sim-placeholder" style="color:var(--text-tertiary)">
            <div style="font-size:4rem;margin-bottom:var(--space-4)">👈</div>
            <p>Select a habit swap on the left<br>to see its impact</p>
          </div>

          <div id="sim-result" style="display:none;width:100%">
            <span id="sim-icon" style="font-size:3rem"></span>
            <h3 id="sim-title" style="margin:var(--space-3) 0 var(--space-1)"></h3>
            <p id="sim-desc" style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-5)"></p>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-5)">
              <div class="card" style="padding:var(--space-4);background:var(--bg-glass)">
                <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Saved / Month</div>
                <div id="sim-kg" style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)"></div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary)">CO₂e</div>
              </div>
              <div class="card" style="padding:var(--space-4);background:var(--bg-glass)">
                <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Saved / Year</div>
                <div id="sim-t" style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)"></div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary)">tonnes CO₂e</div>
              </div>
            </div>

            <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:var(--space-4);margin-bottom:var(--space-4)">
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-2)">Equivalent to</div>
              <div style="display:flex;justify-content:space-around">
                <div style="text-align:center">
                  <div style="font-size:1.5rem">🌳</div>
                  <div id="sim-trees" style="font-weight:700"></div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary)">trees planted</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:1.5rem">✈️</div>
                  <div id="sim-flights" style="font-weight:700"></div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary)">fewer flights</div>
                </div>
              </div>
            </div>

            <div style="margin-bottom:var(--space-4)">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-1)">
                <span>Impact vs 5t reduction goal</span>
              </div>
              <div class="progress-bar" style="height:10px">
                <div id="sim-bar-fill" class="progress-bar__fill" style="height:10px;transition:width 0.5s ease"></div>
              </div>
            </div>

            <button class="btn btn--primary" style="width:100%" onclick="location.hash='#/challenges'">
              🏆 Start This Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
