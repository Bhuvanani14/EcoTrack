/**
 * EcoTrack Context Engine v2
 * Adds daily budget, avatar state, and AI insights caching.
 * @module context-engine
 */
import { storage } from './storage.js';
import { calculateTotalFootprint } from './calculator-engine.js';
import { AVATAR_TIERS, DAILY_TARGET_KG } from './constants.js';

export class ContextEngine {
  constructor() {
    this.storage = storage;
  }

  getUserProfile() {
    return this.storage.get('userProfile') || {};
  }

  getFootprintHistory() {
    return this.storage.get('footprintHistory') || [];
  }

  saveFootprintSnapshot(footprintResult) {
    const history = this.getFootprintHistory();
    history.push({
      date: new Date().toISOString(),
      ...footprintResult
    });
    if (history.length > 24) history.splice(0, history.length - 24);
    this.storage.set('footprintHistory', history);
  }

  getHighestImpactCategory(footprint) {
    if (!footprint?.monthly) return 'transport';
    const { transport, food, energy, lifestyle } = footprint.monthly;
    const categories = { transport, food, energy, lifestyle };
    return Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0];
  }

  getTrend() {
    const history = this.getFootprintHistory();
    if (history.length < 2) return { direction: 'stable', change: 0 };
    const latest = history[history.length - 1].monthly?.total || 0;
    const previous = history[history.length - 2].monthly?.total || 0;
    const change = latest - previous;
    const direction = change < -5 ? 'improving' : change > 5 ? 'increasing' : 'stable';
    return { direction, change: Math.round(change * 10) / 10 };
  }

  getStreak() {
    return this.storage.get('engagementStreak') || 0;
  }

  updateStreak() {
    const lastVisit = this.storage.get('lastVisitDate');
    const today = new Date().toDateString();
    if (lastVisit === today) return this.getStreak();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let streak = lastVisit === yesterday ? this.getStreak() + 1 : 1;
    this.storage.set('engagementStreak', streak);
    this.storage.set('lastVisitDate', today);
    return streak;
  }

  isFirstRun() {
    return !this.storage.get('onboardingComplete');
  }

  completeOnboarding() {
    this.storage.set('onboardingComplete', true);
  }

  // ---- New v2 Methods ---- //

  /**
   * Returns the user's avatar tier based on eco-score.
   */
  getAvatarState(ecoScore = 0) {
    const tier = AVATAR_TIERS.find(t => ecoScore >= t.minScore) || AVATAR_TIERS[AVATAR_TIERS.length - 1];
    return tier;
  }

  /**
   * Returns all avatar tiers (for progression display).
   */
  getAvatarTiers() {
    return AVATAR_TIERS;
  }

  /**
   * Computes the daily carbon budget and how much has been used.
   * @returns {Object} The budget object containing used amount, percentage, and status.
   */
  getDailyBudget() {
    const profile = this.getUserProfile();

    if (!profile?.transport) {
      return { budget: DAILY_TARGET_KG, used: 0, pct: 0, status: 'unknown' };
    }

    const fp = calculateTotalFootprint(profile);
    const dailyActual = (fp.annual.total * 1000) / 365; // kg per day

    const pct = Math.min(200, Math.round((dailyActual / DAILY_TARGET_KG) * 100));
    const status = pct <= 80 ? 'great' : pct <= 120 ? 'ok' : 'over';

    return {
      budget: Math.round(DAILY_TARGET_KG * 10) / 10,
      used: Math.round(dailyActual * 10) / 10,
      pct,
      status,
      overBy: Math.max(0, Math.round((dailyActual - DAILY_TARGET_KG) * 10) / 10),
    };
  }

  /**
   * Returns cached daily insights or null if stale.
   */
  getCachedDailyInsights() {
    const cached = this.storage.get('daily_insights');
    if (!cached) return null;
    const today = new Date().toDateString();
    if (cached.date !== today) return null;
    return cached.insights;
  }

  /**
   * Cache daily insights for today.
   */
  cacheDailyInsights(insights) {
    this.storage.set('daily_insights', {
      date: new Date().toDateString(),
      insights
    });
  }

  /**
   * Returns completed daily actions for today.
   */
  getTodayCompletedActions() {
    const data = this.storage.get('daily_actions');
    if (!data || data.date !== new Date().toDateString()) return [];
    return data.completed || [];
  }

  /**
   * Mark a daily action as complete.
   */
  completeDailyAction(actionIndex) {
    const today = new Date().toDateString();
    let data = this.storage.get('daily_actions');
    if (!data || data.date !== today) {
      data = { date: today, completed: [] };
    }
    if (!data.completed.includes(actionIndex)) {
      data.completed.push(actionIndex);
    }
    this.storage.set('daily_actions', data);
    return data.completed;
  }
}

/** 
 * Shared singleton instance of the ContextEngine. 
 * @type {ContextEngine}
 */
export const ctx = new ContextEngine();
