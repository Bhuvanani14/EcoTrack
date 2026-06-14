/**
 * Tests for Fun Facts
 */
import { describe, it, expect } from 'vitest';
import { getRandomFact, getFactsByCategory, getFactsByImpact, getDailyFact, getAllCategories, getAllFacts } from '../src/core/fun-facts.js';

describe('Fun Facts', () => {
  it('should return all facts', () => {
    const facts = getAllFacts();
    expect(facts.length).toBeGreaterThanOrEqual(60);
  });

  it('should return a random fact', () => {
    const fact = getRandomFact();
    expect(fact).toHaveProperty('text');
    expect(fact).toHaveProperty('icon');
    expect(fact).toHaveProperty('category');
    expect(fact).toHaveProperty('source');
    expect(fact).toHaveProperty('impact');
  });

  it('should exclude specified IDs', () => {
    const all = getAllFacts();
    const excludeIds = all.slice(0, 58).map(f => f.id);
    const fact = getRandomFact(excludeIds);
    expect(excludeIds).not.toContain(fact.id);
  });

  it('should filter by category', () => {
    const transport = getFactsByCategory('Transport');
    expect(transport.length).toBeGreaterThan(0);
    transport.forEach(f => expect(f.category).toBe('Transport'));
  });

  it('should return all categories', () => {
    const cats = getAllCategories();
    expect(cats).toContain('Transport');
    expect(cats).toContain('Food');
    expect(cats).toContain('Energy');
    expect(cats).toContain('Nature');
    expect(cats).toContain('Technology');
  });

  it('should filter by impact', () => {
    const mindBlowing = getFactsByImpact('mind-blowing');
    expect(mindBlowing.length).toBeGreaterThan(0);
    mindBlowing.forEach(f => expect(f.impact).toBe('mind-blowing'));
  });

  it('should return a daily fact based on date', () => {
    const fact = getDailyFact();
    expect(fact).toHaveProperty('text');
    // Same day should return same fact
    const fact2 = getDailyFact();
    expect(fact.id).toBe(fact2.id);
  });

  it('should return all for category All', () => {
    const all = getFactsByCategory('All');
    expect(all.length).toBe(getAllFacts().length);
  });
});
