/**
 * EcoTrack Context Engine
 * Profiles user behavior, identifies hotspots, and tracks progress.
 */
import { Storage } from './storage.js';

export class ContextEngine {
  constructor() {
    this.storage = new Storage();
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
}
