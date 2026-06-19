/**
 * EcoTrack Calculator Page
 * Detailed, tabbed carbon footprint calculator with real-time results.
 */
import { EMISSION_FACTORS, BENCHMARKS, EQUIVALENTS } from '../core/emission-factors.js';
import { calculateTotalFootprint } from '../core/calculator-engine.js';
import { ContextEngine } from '../core/context-engine.js';
import { Storage } from '../core/storage.js';
import { formatNumber, getCategoryColor, getCategoryIcon } from '../utils/format.js';

const ctx = new ContextEngine();
const storage = new Storage();

let formData = { transport: {}, food: {}, energy: {}, lifestyle: {} };

function loadSavedData() {
  const saved = ctx.getUserProfile();
  if (saved) formData = JSON.parse(JSON.stringify(saved));
}

function saveAndUpdate() {
  storage.set('userProfile', formData);
  const result = calculateTotalFootprint(formData);
  ctx.saveFootprintSnapshot(result);
  renderResults(result);
}

function renderResults(fp) {
  const el = document.getElementById('calc-results');
  if (!el || !fp) return;
  const gradeColor = fp.ecoScore.score >= 70 ? 'var(--accent-green)' : fp.ecoScore.score >= 40 ? 'var(--accent-amber)' : 'var(--accent-coral)';
  el.innerHTML = `
    <div style="text-align:center;padding:var(--space-4) 0">
      <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-1)">Your Annual Footprint</div>
      <div style="font-size:var(--text-5xl);font-weight:700;font-family:var(--font-heading);background:var(--gradient-hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${formatNumber(fp.annual.total)}t</div>
      <div style="font-size:var(--text-sm);color:var(--text-secondary)">CO₂e per year</div>
      <div style="margin-top:var(--space-3)">
        <span class="badge" style="background:${gradeColor}20;color:${gradeColor};font-size:var(--text-base);padding:var(--space-2) var(--space-4)">Grade: ${fp.ecoScore.grade} (${fp.ecoScore.score}/100)</span>
      </div>
    </div>
    <div class="divider"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
      ${['transport','food','energy','lifestyle'].map(c => `
        <div style="display:flex;align-items:center;gap:var(--space-2)">
          <span>${getCategoryIcon(c)}</span>
          <div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${c.charAt(0).toUpperCase()+c.slice(1)}</div>
            <div style="font-weight:600;color:${getCategoryColor(c)}">${formatNumber(fp.annual[c])}t</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-around;text-align:center">
      <div><div style="font-size:1.5rem">🌳</div><div style="font-weight:600">${fp.equivalents.trees}</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">trees to offset</div></div>
      <div><div style="font-size:1.5rem">🌍</div><div style="font-weight:600">${fp.comparison.vs_global}%</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">of global avg</div></div>
      <div><div style="font-size:1.5rem">🎯</div><div style="font-weight:600">${fp.comparison.vs_target}%</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">of 2050 target</div></div>
    </div>
  `;
}

export function renderCalculator() {
  loadSavedData();
  const page = `
    <div class="page-header">
      <h1 class="page-header__title">Calculator</h1>
      <p class="page-header__subtitle">Calculate your detailed carbon footprint</p>
    </div>

    <div class="dashboard-grid" style="grid-template-columns:1fr 340px;align-items:start">
      <div>
        <!-- Tabs -->
        <div class="tabs" id="calc-tabs" style="margin-bottom:var(--space-6)">
          <button class="tab tab--active" data-tab="transport">🚗 Transport</button>
          <button class="tab" data-tab="food">🥗 Food</button>
          <button class="tab" data-tab="energy">⚡ Energy</button>
          <button class="tab" data-tab="lifestyle">🛍️ Lifestyle</button>
        </div>

        <!-- Tab Contents -->
        <div class="card" id="calc-tab-content"></div>
      </div>

      <!-- Results Sidebar -->
      <div class="card card--accent" id="calc-results" style="position:sticky;top:var(--space-8)">
        <div class="empty-state" style="padding:var(--space-8)"><div class="empty-state__icon">📊</div><div class="empty-state__text">Fill in your details to see results</div></div>
      </div>
    </div>
  `;

  return page;
}

export function bindCalculatorEvents() {
  initTabs();
  const initial = calculateTotalFootprint(formData);
  if (initial.annual.total > 0) renderResults(initial);
}

function initTabs() {
  const tabs = document.getElementById('calc-tabs');
  if (!tabs) return;
  tabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
    tab.classList.add('tab--active');
    renderTabContent(tab.dataset.tab);
  });
  renderTabContent('transport');
}

function renderTabContent(tab) {
  const container = document.getElementById('calc-tab-content');
  if (!container) return;

  const templates = {
    transport: `
      <h3 style="margin-bottom:var(--space-4)">🚗 Transport</h3>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Primary commute mode</label>
        <select class="input-group__field" id="calc-commute-mode">
          <option value="">Select...</option>
          ${Object.entries(EMISSION_FACTORS.transport).filter(([k]) => !k.startsWith('flight')).map(([k, v]) =>
            `<option value="${k}" ${formData.transport?.commuteMode === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Daily one-way distance (km): <strong id="commute-dist-val">${formData.transport?.commuteDistance || 15}</strong></label>
        <input type="range" class="range-slider" id="calc-commute-dist" min="1" max="100" value="${formData.transport?.commuteDistance || 15}" />
      </div>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Short-haul flights per year</label>
        <input type="number" class="input-group__field" id="calc-short-flights" min="0" max="50" value="${formData.transport?.shortHaulFlights || 0}" />
      </div>
      <div class="input-group">
        <label class="input-group__label">Long-haul flights per year</label>
        <input type="number" class="input-group__field" id="calc-long-flights" min="0" max="20" value="${formData.transport?.longHaulFlights || 0}" />
      </div>
    `,
    food: `
      <h3 style="margin-bottom:var(--space-4)">🥗 Food & Diet</h3>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Diet type</label>
        <select class="input-group__field" id="calc-diet">
          ${Object.entries(EMISSION_FACTORS.diet_monthly).map(([k, v]) =>
            `<option value="${k}" ${formData.food?.dietType === k ? 'selected' : ''}>${v.label} (~${v.factor} kg/mo)</option>`
          ).join('')}
        </select>
      </div>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Red meat frequency</label>
        <select class="input-group__field" id="calc-red-meat">
          <option value="daily" ${formData.food?.redMeatFrequency==='daily'?'selected':''}>Daily</option>
          <option value="weekly" ${formData.food?.redMeatFrequency==='weekly'?'selected':''}>2-3 times/week</option>
          <option value="rarely" ${formData.food?.redMeatFrequency==='rarely'?'selected':''}>Rarely</option>
          <option value="never" ${formData.food?.redMeatFrequency==='never'?'selected':''}>Never</option>
        </select>
      </div>
      <div class="input-group">
        <label class="input-group__label">Food sourcing</label>
        <select class="input-group__field" id="calc-local-food">
          <option value="mostly_local" ${formData.food?.localFood==='mostly_local'?'selected':''}>Mostly local</option>
          <option value="mixed" ${formData.food?.localFood==='mixed'?'selected':''}>Mixed</option>
          <option value="mostly_imported" ${formData.food?.localFood==='mostly_imported'?'selected':''}>Mostly imported</option>
        </select>
      </div>
    `,
    energy: `
      <h3 style="margin-bottom:var(--space-4)">⚡ Home Energy</h3>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Housing type</label>
        <select class="input-group__field" id="calc-housing">
          ${Object.entries(EMISSION_FACTORS.housing).map(([k, v]) =>
            `<option value="${k}" ${formData.energy?.housingType === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Heating source</label>
        <select class="input-group__field" id="calc-heating">
          <option value="gas" ${formData.energy?.heatingSource==='gas'?'selected':''}>Natural Gas</option>
          <option value="electric" ${formData.energy?.heatingSource==='electric'?'selected':''}>Electric</option>
          <option value="heat_pump" ${formData.energy?.heatingSource==='heat_pump'?'selected':''}>Heat Pump</option>
          <option value="wood" ${formData.energy?.heatingSource==='wood'?'selected':''}>Wood/Biomass</option>
        </select>
      </div>
      <div class="input-group">
        <label class="input-group__label">Renewable energy</label>
        <select class="input-group__field" id="calc-renewable">
          <option value="yes" ${formData.energy?.renewableEnergy==='yes'?'selected':''}>Yes, 100%</option>
          <option value="partial" ${formData.energy?.renewableEnergy==='partial'?'selected':''}>Partially</option>
          <option value="no" ${formData.energy?.renewableEnergy==='no'?'selected':''}>No</option>
        </select>
      </div>
    `,
    lifestyle: `
      <h3 style="margin-bottom:var(--space-4)">🛍️ Lifestyle</h3>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">New clothing purchases</label>
        <select class="input-group__field" id="calc-clothing">
          <option value="monthly" ${formData.lifestyle?.clothingFrequency==='monthly'?'selected':''}>Monthly (4+ items)</option>
          <option value="quarterly" ${formData.lifestyle?.clothingFrequency==='quarterly'?'selected':''}>Every few months</option>
          <option value="rarely" ${formData.lifestyle?.clothingFrequency==='rarely'?'selected':''}>Rarely</option>
        </select>
      </div>
      <div class="input-group" style="margin-bottom:var(--space-4)">
        <label class="input-group__label">Daily streaming hours: <strong id="streaming-val">${formData.lifestyle?.streamingHours || 2}</strong></label>
        <input type="range" class="range-slider" id="calc-streaming" min="0" max="10" step="0.5" value="${formData.lifestyle?.streamingHours || 2}" />
      </div>
      <div class="input-group">
        <label class="input-group__label">Recycling habits</label>
        <select class="input-group__field" id="calc-recycling">
          <option value="always" ${formData.lifestyle?.recycling==='always'?'selected':''}>Always</option>
          <option value="sometimes" ${formData.lifestyle?.recycling==='sometimes'?'selected':''}>Sometimes</option>
          <option value="rarely" ${formData.lifestyle?.recycling==='rarely'?'selected':''}>Rarely</option>
        </select>
      </div>
    `,
  };

  container.innerHTML = templates[tab] + `<button class="btn btn--primary" style="margin-top:var(--space-6);width:100%" id="calc-save">💾 Save & Calculate</button>`;

  // Slider live update
  const distSlider = document.getElementById('calc-commute-dist');
  const distVal = document.getElementById('commute-dist-val');
  if (distSlider && distVal) distSlider.addEventListener('input', () => { distVal.textContent = distSlider.value; });
  const streamSlider = document.getElementById('calc-streaming');
  const streamVal = document.getElementById('streaming-val');
  if (streamSlider && streamVal) streamSlider.addEventListener('input', () => { streamVal.textContent = streamSlider.value; });

  document.getElementById('calc-save')?.addEventListener('click', () => {
    // Collect data from current tab
    if (tab === 'transport') {
      formData.transport.commuteMode = document.getElementById('calc-commute-mode')?.value || '';
      formData.transport.commuteDistance = Number(document.getElementById('calc-commute-dist')?.value || 15);
      formData.transport.shortHaulFlights = Number(document.getElementById('calc-short-flights')?.value || 0);
      formData.transport.longHaulFlights = Number(document.getElementById('calc-long-flights')?.value || 0);
    } else if (tab === 'food') {
      formData.food.dietType = document.getElementById('calc-diet')?.value || 'mixed';
      formData.food.redMeatFrequency = document.getElementById('calc-red-meat')?.value || 'weekly';
      formData.food.localFood = document.getElementById('calc-local-food')?.value || 'mixed';
    } else if (tab === 'energy') {
      formData.energy.housingType = document.getElementById('calc-housing')?.value || 'apartment';
      formData.energy.heatingSource = document.getElementById('calc-heating')?.value || 'gas';
      formData.energy.renewableEnergy = document.getElementById('calc-renewable')?.value || 'no';
    } else if (tab === 'lifestyle') {
      formData.lifestyle.clothingFrequency = document.getElementById('calc-clothing')?.value || 'quarterly';
      formData.lifestyle.streamingHours = Number(document.getElementById('calc-streaming')?.value || 2);
      formData.lifestyle.recycling = document.getElementById('calc-recycling')?.value || 'sometimes';
    }
    saveAndUpdate();
    showToast('✅ Saved! Your footprint has been updated.');
  });
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast--success';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
