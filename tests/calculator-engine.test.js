/**
 * Tests for Calculator Engine
 */
import { describe, it, expect } from 'vitest';
import { calculateTransportEmissions, calculateFoodEmissions, calculateEnergyEmissions, calculateLifestyleEmissions, calculateTotalFootprint, calculateEcoScore } from '../src/core/calculator-engine.js';

describe('calculateTransportEmissions', () => {
  it('should return 0 for walking', () => {
    const result = calculateTransportEmissions({ commuteMode: 'walking', commuteDistance: 5 });
    expect(result).toBe(0);
  });

  it('should calculate car petrol emissions', () => {
    const result = calculateTransportEmissions({ commuteMode: 'car_petrol', commuteDistance: 15 });
    expect(result).toBeGreaterThan(0);
    // 0.21 * 15 * 2 * 22 = 138.6
    expect(result).toBeCloseTo(138.6, 0);
  });

  it('should include flight emissions', () => {
    const withFlights = calculateTransportEmissions({ commuteMode: 'walking', commuteDistance: 0, longHaulFlights: 2 });
    expect(withFlights).toBeGreaterThan(0);
  });

  it('should handle empty data', () => {
    const result = calculateTransportEmissions({});
    expect(result).toBe(0);
  });
});

describe('calculateFoodEmissions', () => {
  it('should return base value for vegan diet', () => {
    const result = calculateFoodEmissions({ dietType: 'vegan' });
    expect(result).toBeLessThan(100);
  });

  it('should return higher value for heavy meat diet', () => {
    const vegan = calculateFoodEmissions({ dietType: 'vegan' });
    const heavyMeat = calculateFoodEmissions({ dietType: 'heavy_meat' });
    expect(heavyMeat).toBeGreaterThan(vegan);
  });

  it('should adjust for red meat frequency', () => {
    const daily = calculateFoodEmissions({ dietType: 'mixed', redMeatFrequency: 'daily' });
    const never = calculateFoodEmissions({ dietType: 'mixed', redMeatFrequency: 'never' });
    expect(daily).toBeGreaterThan(never);
  });

  it('should adjust for local food preference', () => {
    const local = calculateFoodEmissions({ dietType: 'mixed', localFood: 'mostly_local' });
    const imported = calculateFoodEmissions({ dietType: 'mixed', localFood: 'mostly_imported' });
    expect(local).toBeLessThan(imported);
  });
});

describe('calculateEnergyEmissions', () => {
  it('should differentiate housing types', () => {
    const apt = calculateEnergyEmissions({ housingType: 'apartment' });
    const large = calculateEnergyEmissions({ housingType: 'large_house' });
    expect(large).toBeGreaterThan(apt);
  });

  it('should reduce for renewable energy', () => {
    const noRenew = calculateEnergyEmissions({ housingType: 'apartment', renewableEnergy: 'no' });
    const renew = calculateEnergyEmissions({ housingType: 'apartment', renewableEnergy: 'yes' });
    expect(renew).toBeLessThan(noRenew);
  });
});

describe('calculateTotalFootprint', () => {
  it('should return complete footprint object', () => {
    const result = calculateTotalFootprint({
      transport: { commuteMode: 'car_petrol', commuteDistance: 15 },
      food: { dietType: 'mixed' },
      energy: { housingType: 'apartment', renewableEnergy: 'no' },
      lifestyle: { clothingFrequency: 'quarterly', streamingHours: 2, recycling: 'sometimes' }
    });

    expect(result).toHaveProperty('monthly');
    expect(result).toHaveProperty('annual');
    expect(result).toHaveProperty('comparison');
    expect(result).toHaveProperty('equivalents');
    expect(result).toHaveProperty('ecoScore');
    expect(result.annual.total).toBeGreaterThan(0);
    expect(result.ecoScore.score).toBeGreaterThan(0);
    expect(result.ecoScore.grade).toBeDefined();
  });
});

describe('calculateEcoScore', () => {
  it('should give high score for low emissions', () => {
    expect(calculateEcoScore(1.5).grade).toBe('A+');
  });

  it('should give low score for high emissions', () => {
    expect(calculateEcoScore(20).grade).toBe('F');
  });
});
