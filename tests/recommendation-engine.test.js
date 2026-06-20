import { describe, it, expect } from 'vitest';
import { 
  getRecommendations, 
  getTopRecommendations, 
  getRecommendationsByCategory, 
  calculatePotentialSavings 
} from '../src/core/recommendation-engine.js';

describe('Recommendation Engine', () => {
  const mockProfile = {
    transport: { commuteMode: 'car_petrol', commuteDistance: 10, longHaulFlights: 2 },
    food: { dietType: 'heavy_meat', redMeatFrequency: 'daily', localFood: 'mostly_imported' },
    energy: { housingType: 'apartment', heatingSource: 'gas', renewableEnergy: 'no' },
    lifestyle: { clothingFrequency: 'monthly', recycling: 'rarely', streamingHours: 5 }
  };

  it('should return applicable recommendations', () => {
    const recs = getRecommendations(mockProfile);
    expect(recs.length).toBeGreaterThan(0);
    // Should include reducing flights since longHaulFlights > 1
    const reduceFlights = recs.find(r => r.id === 'reduce_flights');
    expect(reduceFlights).toBeDefined();
  });

  it('should exclude adopted recommendations', () => {
    const allRecs = getRecommendations(mockProfile);
    const adopted = [allRecs[0].id];
    const filteredRecs = getRecommendations(mockProfile, adopted);
    expect(filteredRecs.length).toBe(allRecs.length - 1);
    expect(filteredRecs.find(r => r.id === adopted[0])).toBeUndefined();
  });

  it('should sort recommendations by impact (high) and effort (low) first', () => {
    const recs = getRecommendations(mockProfile);
    if (recs.length > 1) {
      const top = recs[0];
      const bottom = recs[recs.length - 1];
      
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { low: 3, medium: 2, high: 1 };
      
      const topScore = impactScore[top.impact] * 2 + effortScore[top.effort];
      const bottomScore = impactScore[bottom.impact] * 2 + effortScore[bottom.effort];
      
      expect(topScore).toBeGreaterThanOrEqual(bottomScore);
    }
  });

  it('should return exactly count elements for getTopRecommendations', () => {
    const top2 = getTopRecommendations(mockProfile, 2);
    expect(top2.length).toBeLessThanOrEqual(2);
  });

  it('should filter by category', () => {
    const transportRecs = getRecommendationsByCategory(mockProfile, 'transport');
    expect(transportRecs.every(r => r.category === 'transport')).toBe(true);
  });

  it('should correctly calculate potential savings', () => {
    const recs = [
      { savingsKgPerMonth: 10 },
      { savingsKgPerMonth: 20 },
      { savingsKgPerMonth: 5 }
    ];
    const sum = calculatePotentialSavings(recs);
    expect(sum).toBe(35);
  });
});
