/**
 * Core constants used across the application.
 * Centralizing these values prevents magic numbers and improves maintainability.
 * @module constants
 */

/** @constant {number} Days worked per month for commute calculations. */
export const WORK_DAYS_PER_MONTH = 22;

/** @constant {number} Months in a year for annual projections. */
export const MONTHS_PER_YEAR = 12;

/** @constant {number} Conversion factor from kg to tonnes. */
export const KG_PER_TONNE = 1000;

/** @constant {number} The 2050 target annual footprint in kg CO2e (2 tonnes). */
export const TARGET_ANNUAL_KG = 2000;

/** @constant {number} The daily target footprint in kg CO2e based on the 2050 goal. */
export const DAILY_TARGET_KG = TARGET_ANNUAL_KG / 365;

/** @constant {number} Maximum number of AI calls allowed per session. */
export const AI_SESSION_LIMIT = 10;

/** @constant {number} Debounce delay for AI calls in milliseconds. */
export const AI_DEBOUNCE_MS = 1500;

/**
 * Avatar tier definitions based on eco-score thresholds.
 * @constant {Array<Object>}
 */
export const AVATAR_TIERS = [
  { minScore: 80, key: 'ecohero',  label: 'EcoHero',   icon: '🏆', color: '#00d68f', description: 'You\'re a sustainability champion! Your footprint is exceptional.' },
  { minScore: 60, key: 'guardian', label: 'Guardian',  icon: '🌳', color: '#38ef7d', description: 'You\'re making a real difference. Keep pushing your limits!' },
  { minScore: 40, key: 'sprout',   label: 'Sprout',    icon: '🌿', color: '#00b4d8', description: 'You\'re growing in the right direction. A few changes will take you far.' },
  { minScore: 20, key: 'seedling', label: 'Seedling',  icon: '🌱', color: '#f5a623', description: 'Every journey starts somewhere. Small actions add up!' },
  { minScore: 0,  key: 'dormant',  label: 'Dormant',   icon: '🪨', color: '#8892a4', description: 'Time to wake up! Your planet needs you.' },
];
