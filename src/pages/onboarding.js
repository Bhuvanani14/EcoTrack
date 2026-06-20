/**
 * EcoTrack Onboarding Page
 * Guided wizard to collect baseline footprint data.
 */
import { ctx } from '../core/context-engine.js';
import { calculateTotalFootprint } from '../core/calculator-engine.js';
import { storage } from '../core/storage.js';
import { getRandomFact } from '../core/fun-facts.js';

const STEPS = [
  {
    title: 'Welcome to EcoTrack 🌍',
    subtitle: 'Understand, track, and reduce your carbon footprint with personalized insights.',
    type: 'welcome',
  },
  {
    title: 'How do you commute? 🚗',
    subtitle: 'Tell us about your primary mode of transport.',
    type: 'select',
    field: 'transport.commuteMode',
    options: [
      { value: 'car_petrol', label: '🚗 Car (Petrol)', icon: '🚗' },
      { value: 'car_electric', label: '⚡ Car (Electric)', icon: '⚡' },
      { value: 'bus', label: '🚌 Bus', icon: '🚌' },
      { value: 'train', label: '🚆 Train/Metro', icon: '🚆' },
      { value: 'bicycle', label: '🚲 Bicycle', icon: '🚲' },
      { value: 'walking', label: '🚶 Walking', icon: '🚶' },
    ]
  },
  {
    title: 'Daily commute distance? 📏',
    subtitle: 'Approximate one-way distance.',
    type: 'select',
    field: 'transport.commuteDistance',
    options: [
      { value: 3, label: 'Under 5 km' },
      { value: 10, label: '5-15 km' },
      { value: 22, label: '15-30 km' },
      { value: 40, label: '30-50 km' },
      { value: 65, label: '50+ km' },
    ]
  },
  {
    title: 'What\'s your diet like? 🥗',
    subtitle: 'Your eating habits have a big impact on your footprint.',
    type: 'select',
    field: 'food.dietType',
    options: [
      { value: 'vegan', label: '🌱 Vegan' },
      { value: 'vegetarian', label: '🥚 Vegetarian' },
      { value: 'mixed', label: '🍽️ Mixed / Average' },
      { value: 'heavy_meat', label: '🥩 Heavy Meat' },
    ]
  },
  {
    title: 'Your home 🏠',
    subtitle: 'Tell us about your living situation.',
    type: 'select',
    field: 'energy.housingType',
    options: [
      { value: 'apartment', label: '🏢 Apartment' },
      { value: 'small_house', label: '🏡 Small House' },
      { value: 'large_house', label: '🏘️ Large House' },
    ]
  },
  {
    title: 'Energy source ☀️',
    subtitle: 'Do you use renewable energy?',
    type: 'select',
    field: 'energy.renewableEnergy',
    options: [
      { value: 'yes', label: '✅ Yes, renewable' },
      { value: 'partial', label: '⚡ Partially' },
      { value: 'no', label: '❌ Standard grid' },
    ]
  },
];

let currentStep = 0;
let userData = { transport: {}, food: {}, energy: {}, lifestyle: {} };

function setNestedValue(path, value) {
  const keys = path.split('.');
  let obj = userData;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
}

function renderStep() {
  const container = document.getElementById('onboarding-content');
  if (!container) return;
  const step = STEPS[currentStep];
  const fact = getRandomFact();

  if (step.type === 'welcome') {
    container.innerHTML = `
      <div class="onboarding__step animate-fade-in">
        <div style="font-size:4rem;margin-bottom:var(--space-6)">🌱</div>
        <h1 style="font-size:var(--text-3xl);margin-bottom:var(--space-4)">${step.title}</h1>
        <p style="color:var(--text-secondary);font-size:var(--text-lg);margin-bottom:var(--space-8);max-width:440px">${step.subtitle}</p>
        <div class="card" style="padding:var(--space-4);margin-bottom:var(--space-8);text-align:left;max-width:400px">
          <small style="color:var(--text-tertiary)">💡 Fun Fact</small>
          <p style="font-size:var(--text-sm);margin:var(--space-2) 0 0">${fact.icon} ${fact.text}</p>
        </div>
        <button class="btn btn--primary btn--lg" id="onboarding-start">Get Started →</button>
        <br><button class="btn btn--ghost" style="margin-top:var(--space-4)" id="onboarding-skip">Skip Setup</button>
      </div>
    `;
    document.getElementById('onboarding-start')?.addEventListener('click', () => { currentStep++; renderStep(); });
    document.getElementById('onboarding-skip')?.addEventListener('click', finishOnboarding);
  } else if (step.type === 'select') {
    const optionsHTML = step.options.map(opt => `
      <button class="quiz-option onboarding-option" data-value="${opt.value}">${opt.label}</button>
    `).join('');
    container.innerHTML = `
      <div class="onboarding__step animate-fade-in">
        <h2 style="margin-bottom:var(--space-2)">${step.title}</h2>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-6)">${step.subtitle}</p>
        <div class="quiz-options" style="max-width:400px;margin:0 auto">${optionsHTML}</div>
        <button class="btn btn--ghost" style="margin-top:var(--space-6)" id="onboarding-back">← Back</button>
      </div>
    `;
    container.querySelectorAll('.onboarding-option').forEach(btn => {
      btn.addEventListener('click', () => {
        let val = btn.dataset.value;
        if (!isNaN(val)) val = Number(val);
        setNestedValue(step.field, val);
        if (currentStep < STEPS.length - 1) { currentStep++; renderStep(); }
        else finishOnboarding();
      });
    });
    document.getElementById('onboarding-back')?.addEventListener('click', () => { currentStep--; renderStep(); });
  }

  renderDots();
}

function renderDots() {
  const dotsContainer = document.getElementById('onboarding-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = STEPS.map((_, i) =>
    `<div class="onboarding__dot ${i === currentStep ? 'onboarding__dot--active' : i < currentStep ? 'onboarding__dot--done' : ''}"></div>`
  ).join('');
}

function finishOnboarding() {
  userData.lifestyle = { clothingFrequency: 'quarterly', streamingHours: 2, recycling: 'sometimes' };
  const result = calculateTotalFootprint(userData);
  storage.set('userProfile', userData);
  ctx.saveFootprintSnapshot(result);
  ctx.completeOnboarding();
  window.location.hash = '#/dashboard';
}

export function renderOnboarding() {
  currentStep = 0;
  userData = { transport: {}, food: {}, energy: {}, lifestyle: {} };

  const page = document.createElement('div');
  page.className = 'onboarding';
  page.innerHTML = `
    <div class="onboarding__card card">
      <div class="onboarding__progress" id="onboarding-dots"></div>
      <div id="onboarding-content"></div>
    </div>
  `;

  setTimeout(() => renderStep(), 50);
  return page;
}
