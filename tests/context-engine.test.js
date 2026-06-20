/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContextEngine } from '../src/core/context-engine.js';
import { Storage } from '../src/core/storage.js';

describe('Context Engine', () => {
  let ctx;

  beforeEach(() => {
    localStorage.clear();
    ctx = new ContextEngine();
    // Inject a fresh storage instance for testing
    ctx.storage = new Storage();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return default profile if none exists', () => {
    const profile = ctx.getUserProfile();
    expect(profile).toEqual({});
  });

  it('should identify first run', () => {
    expect(ctx.isFirstRun()).toBe(true);
    ctx.completeOnboarding();
    expect(ctx.isFirstRun()).toBe(false);
  });

  it('should track streak', () => {
    expect(ctx.getStreak()).toBe(0);
    ctx.updateStreak();
    expect(ctx.getStreak()).toBe(1);
    // Logging again on the same day shouldn't increase streak
    ctx.updateStreak();
    expect(ctx.getStreak()).toBe(1);
  });

  it('should determine avatar state based on score', () => {
    const ecoHero = ctx.getAvatarState(90);
    expect(ecoHero.key).toBe('ecohero');

    const seedling = ctx.getAvatarState(25);
    expect(seedling.key).toBe('seedling');
  });

  it('should get daily budget', () => {
    const budgetInfo = ctx.getDailyBudget();
    // Default is unknown without profile
    expect(budgetInfo.status).toBe('unknown');

    // Mock a profile
    ctx.storage.set('userProfile', { transport: { commuteMode: 'car_petrol' } });
    const b2 = ctx.getDailyBudget();
    expect(b2.budget).toBeGreaterThan(0);
  });

  it('should compute trend', () => {
    expect(ctx.getTrend().direction).toBe('stable'); // Default

    ctx.storage.set('footprintHistory', [
      { date: '2023-01-01', monthly: { total: 500 } },
      { date: '2023-02-01', monthly: { total: 450 } }
    ]);
    
    const trend = ctx.getTrend();
    expect(trend.direction).toBe('improving');
    expect(trend.change).toBe(-50);
  });
});
