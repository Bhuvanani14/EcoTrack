/**
 * EcoTrack Survey Engine
 * Conversational survey flow for the chat agent to calculate individual footprint.
 */
import { calculateTotalFootprint } from './calculator-engine.js';

const SURVEY_STEPS = [
  {
    id: 'intro',
    section: null,
    message: "🌍 Let's find out your carbon footprint! I'll ask you a few simple questions about your daily habits. It takes about 2 minutes. Ready?",
    options: [{ label: "Let's go! 🚀", value: 'start' }, { label: 'Maybe later', value: 'cancel' }],
    field: null
  },
  {
    id: 'commute_mode',
    section: 'transport',
    message: '🚗 How do you usually commute to work or school?',
    options: [
      { label: '🚗 Car (Petrol)', value: 'car_petrol' },
      { label: '⚡ Car (Electric)', value: 'car_electric' },
      { label: '🚌 Bus', value: 'bus' },
      { label: '🚆 Train/Metro', value: 'train' },
      { label: '🚲 Bicycle', value: 'bicycle' },
      { label: '🚶 Walking', value: 'walking' },
    ],
    field: 'transport.commuteMode'
  },
  {
    id: 'commute_distance',
    section: 'transport',
    message: '📏 How far is your daily one-way commute?',
    options: [
      { label: 'Less than 5 km', value: 3 },
      { label: '5-15 km', value: 10 },
      { label: '15-30 km', value: 22 },
      { label: '30-50 km', value: 40 },
      { label: '50+ km', value: 65 },
    ],
    field: 'transport.commuteDistance'
  },
  {
    id: 'flights',
    section: 'transport',
    message: '✈️ How many round-trip flights do you take per year?',
    options: [
      { label: 'None ✌️', value: '0_0' },
      { label: '1-2 short flights', value: '2_0' },
      { label: '1-2 long flights', value: '0_2' },
      { label: '3+ short flights', value: '4_0' },
      { label: 'Mix of both', value: '3_2' },
      { label: 'Frequent flyer (5+)', value: '4_3' },
    ],
    field: 'transport.flights'
  },
  {
    id: 'diet_type',
    section: 'food',
    message: '🥗 How would you describe your diet?',
    options: [
      { label: '🌱 Vegan (no animal products)', value: 'vegan' },
      { label: '🥚 Vegetarian (no meat)', value: 'vegetarian' },
      { label: '🐟 Pescatarian (fish, no meat)', value: 'pescatarian' },
      { label: '🍽️ Mixed / Average', value: 'mixed' },
      { label: '🥩 Heavy meat eater', value: 'heavy_meat' },
    ],
    field: 'food.dietType'
  },
  {
    id: 'red_meat',
    section: 'food',
    message: '🥩 How often do you eat red meat (beef, lamb)?',
    options: [
      { label: 'Daily', value: 'daily' },
      { label: '2-3 times per week', value: 'weekly' },
      { label: 'Rarely (few times a month)', value: 'rarely' },
      { label: 'Never', value: 'never' },
    ],
    field: 'food.redMeatFrequency',
    condition: (data) => !['vegan', 'vegetarian'].includes(data?.food?.dietType)
  },
  {
    id: 'local_food',
    section: 'food',
    message: '🌽 Do you prefer local or imported food?',
    options: [
      { label: '🏡 Mostly local/seasonal', value: 'mostly_local' },
      { label: '🔄 Mix of both', value: 'mixed' },
      { label: '🌍 Mostly imported/exotic', value: 'mostly_imported' },
    ],
    field: 'food.localFood'
  },
  {
    id: 'housing_type',
    section: 'energy',
    message: '🏠 What type of home do you live in?',
    options: [
      { label: '🏢 Apartment/Flat', value: 'apartment' },
      { label: '🏡 Small house (1-2 bedrooms)', value: 'small_house' },
      { label: '🏘️ Large house (3+ bedrooms)', value: 'large_house' },
    ],
    field: 'energy.housingType'
  },
  {
    id: 'heating',
    section: 'energy',
    message: '🌡️ What\'s your main heating source?',
    options: [
      { label: '🔥 Natural gas', value: 'gas' },
      { label: '⚡ Electric heating', value: 'electric' },
      { label: '♻️ Heat pump', value: 'heat_pump' },
      { label: '🪵 Wood/Biomass', value: 'wood' },
    ],
    field: 'energy.heatingSource'
  },
  {
    id: 'renewable',
    section: 'energy',
    message: '☀️ Do you use renewable energy at home?',
    options: [
      { label: '✅ Yes, 100% renewable', value: 'yes' },
      { label: '⚡ Partially (some solar, etc.)', value: 'partial' },
      { label: '❌ No, standard grid', value: 'no' },
    ],
    field: 'energy.renewableEnergy'
  },
  {
    id: 'clothing',
    section: 'lifestyle',
    message: '👕 How often do you buy new clothes?',
    options: [
      { label: 'Monthly (4+ items)', value: 'monthly' },
      { label: 'Every few months', value: 'quarterly' },
      { label: 'Rarely (when needed)', value: 'rarely' },
    ],
    field: 'lifestyle.clothingFrequency'
  },
  {
    id: 'streaming',
    section: 'lifestyle',
    message: '📺 How many hours of video streaming per day?',
    options: [
      { label: 'Less than 1 hour', value: 0.5 },
      { label: '1-2 hours', value: 1.5 },
      { label: '3-4 hours', value: 3.5 },
      { label: '5+ hours', value: 6 },
    ],
    field: 'lifestyle.streamingHours'
  },
  {
    id: 'recycling',
    section: 'lifestyle',
    message: '♻️ Do you recycle regularly?',
    options: [
      { label: '✅ Always', value: 'always' },
      { label: '🔄 Sometimes', value: 'sometimes' },
      { label: '❌ Rarely/Never', value: 'rarely' },
    ],
    field: 'lifestyle.recycling'
  },
];

export class SurveyEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentIndex = 0;
    this.data = { transport: {}, food: {}, energy: {}, lifestyle: {} };
    this.isActive = false;
    this.isComplete = false;
  }

  start() {
    this.reset();
    this.isActive = true;
    return this.getCurrentStep();
  }

  getCurrentStep() {
    if (this.currentIndex >= SURVEY_STEPS.length) {
      this.isComplete = true;
      return null;
    }
    return SURVEY_STEPS[this.currentIndex];
  }

  processAnswer(value) {
    const step = SURVEY_STEPS[this.currentIndex];
    if (!step) return null;

    // Handle intro
    if (step.id === 'intro') {
      if (value === 'cancel') {
        this.isActive = false;
        return { cancelled: true, message: 'No worries! You can start anytime by clicking "Calculate my footprint". 😊' };
      }
      this.currentIndex++;
      return this._getNextValidStep();
    }

    // Store answer
    if (step.field) {
      this._setNestedValue(step.field, value);
    }

    // Handle special fields
    if (step.id === 'flights' && typeof value === 'string') {
      const [short, long] = value.split('_').map(Number);
      this.data.transport.shortHaulFlights = short;
      this.data.transport.longHaulFlights = long;
    }

    this.currentIndex++;
    return this._getNextValidStep();
  }

  _getNextValidStep() {
    while (this.currentIndex < SURVEY_STEPS.length) {
      const step = SURVEY_STEPS[this.currentIndex];
      if (step.condition && !step.condition(this.data)) {
        this.currentIndex++;
        continue;
      }
      return step;
    }
    // Survey complete
    this.isComplete = true;
    this.isActive = false;
    return null;
  }

  getResults() {
    return calculateTotalFootprint(this.data);
  }

  getRawData() {
    return { ...this.data };
  }

  getProgress() {
    const total = SURVEY_STEPS.filter(s => s.id !== 'intro').length;
    const done = Math.min(this.currentIndex - 1, total);
    return Math.round((Math.max(done, 0) / total) * 100);
  }

  getSectionLabel() {
    const step = this.getCurrentStep();
    if (!step) return '';
    const labels = { transport: '🚗 Transport', food: '🥗 Food', energy: '⚡ Energy', lifestyle: '🛍️ Lifestyle' };
    return labels[step.section] || '';
  }

  _setNestedValue(path, value) {
    const keys = path.split('.');
    let obj = this.data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  }
}
