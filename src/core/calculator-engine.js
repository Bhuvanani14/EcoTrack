/**
 * EcoTrack Calculator Engine
 * Computes emissions for each category and total footprint.
 * @module calculator-engine
 */
import { EMISSION_FACTORS, BENCHMARKS, EQUIVALENTS } from './emission-factors.js';
import { WORK_DAYS_PER_MONTH, MONTHS_PER_YEAR, KG_PER_TONNE } from './constants.js';

/**
 * Calculates monthly transport emissions based on user input.
 * @param {Object} transportData - Transport data from user profile.
 * @returns {number} Monthly transport emissions in kg CO₂e.
 */
export function calculateTransportEmissions(transportData) {
  if (!transportData) return 0;
  let monthlyKg = 0;
  if (transportData.commuteMode && Number.isFinite(transportData.commuteDistance)) {
    const mode = EMISSION_FACTORS.transport[transportData.commuteMode];
    if (mode) {
      monthlyKg += mode.factor * transportData.commuteDistance * 2 * WORK_DAYS_PER_MONTH;
    }
  }
  if (Number.isFinite(transportData.shortHaulFlights)) {
    const annualKm = transportData.shortHaulFlights * EMISSION_FACTORS.flight_distances.short_haul * 2;
    monthlyKg += (annualKm * EMISSION_FACTORS.transport.flight_short.factor) / MONTHS_PER_YEAR;
  }
  if (Number.isFinite(transportData.longHaulFlights)) {
    const annualKm = transportData.longHaulFlights * EMISSION_FACTORS.flight_distances.long_haul * 2;
    monthlyKg += (annualKm * EMISSION_FACTORS.transport.flight_long.factor) / MONTHS_PER_YEAR;
  }
  return Math.round(monthlyKg * 10) / 10;
}

/**
 * Calculates monthly food emissions based on user diet type.
 * @param {Object} foodData - Food data from user profile.
 * @returns {number} Monthly food emissions in kg CO₂e.
 */
export function calculateFoodEmissions(foodData) {
  if (!foodData) return 210;
  if (foodData.dietType) {
    let base = EMISSION_FACTORS.diet_monthly[foodData.dietType]?.factor || 210;
    if (foodData.redMeatFrequency === 'daily') base *= 1.2;
    else if (foodData.redMeatFrequency === 'rarely') base *= 0.85;
    else if (foodData.redMeatFrequency === 'never') base *= 0.7;
    if (foodData.localFood === 'mostly_local') base *= 0.9;
    else if (foodData.localFood === 'mostly_imported') base *= 1.15;
    return Math.round(base * 10) / 10;
  }
  return 210;
}

/**
 * Calculates monthly energy emissions based on home setup.
 * @param {Object} energyData - Energy data from user profile.
 * @returns {number} Monthly energy emissions in kg CO₂e.
 */
export function calculateEnergyEmissions(energyData) {
  if (!energyData) return 0;
  let monthlyKg = 0;
  if (energyData.housingType) {
    monthlyKg += EMISSION_FACTORS.housing[energyData.housingType]?.factor || 200;
  }
  if (energyData.heatingSource) {
    const heatingFactors = { gas: 1.2, electric: 1.0, heat_pump: 0.5, wood: 0.7 };
    monthlyKg *= heatingFactors[energyData.heatingSource] || 1.0;
  }
  if (energyData.renewableEnergy === 'yes') monthlyKg *= 0.4;
  else if (energyData.renewableEnergy === 'partial') monthlyKg *= 0.7;
  if (Number.isFinite(energyData.electricityKwh)) {
    monthlyKg += energyData.electricityKwh * EMISSION_FACTORS.energy.electricity.factor;
  }
  return Math.round(monthlyKg * 10) / 10;
}

/**
 * Calculates monthly lifestyle emissions.
 * @param {Object} lifestyleData - Lifestyle data from user profile.
 * @returns {number} Monthly lifestyle emissions in kg CO₂e.
 */
export function calculateLifestyleEmissions(lifestyleData) {
  if (!lifestyleData) return 30;
  let monthlyKg = 0;
  if (lifestyleData.clothingFrequency === 'monthly') monthlyKg += 4 * EMISSION_FACTORS.lifestyle.new_clothes.factor;
  else if (lifestyleData.clothingFrequency === 'quarterly') monthlyKg += 1.5 * EMISSION_FACTORS.lifestyle.new_clothes.factor;
  else if (lifestyleData.clothingFrequency === 'rarely') monthlyKg += 0.3 * EMISSION_FACTORS.lifestyle.new_clothes.factor;
  if (Number.isFinite(lifestyleData.streamingHours)) {
    monthlyKg += lifestyleData.streamingHours * 30 * EMISSION_FACTORS.lifestyle.streaming.factor;
  }
  if (lifestyleData.recycling === 'always') monthlyKg *= 0.85;
  else if (lifestyleData.recycling === 'rarely') monthlyKg *= 1.15;
  monthlyKg += 30;
  return Math.round(monthlyKg * 10) / 10;
}

/**
 * Calculates total footprint and full metrics including comparisons and equivalents.
 * @param {Object} allData - Complete user profile data.
 * @returns {Object} Comprehensive footprint results.
 */
export function calculateTotalFootprint(allData) {
  if (!allData) return null;
  const transport = calculateTransportEmissions(allData.transport || {});
  const food = calculateFoodEmissions(allData.food || {});
  const energy = calculateEnergyEmissions(allData.energy || {});
  const lifestyle = calculateLifestyleEmissions(allData.lifestyle || {});
  const monthlyTotal = transport + food + energy + lifestyle;
  
  const annualTonnes = Math.round((monthlyTotal * MONTHS_PER_YEAR) / KG_PER_TONNE * 10) / 10;
  
  return {
    monthly: { transport, food, energy, lifestyle, total: Math.round(monthlyTotal * 10) / 10 },
    annual: {
      transport: Math.round((transport * MONTHS_PER_YEAR) / KG_PER_TONNE * 10) / 10,
      food: Math.round((food * MONTHS_PER_YEAR) / KG_PER_TONNE * 10) / 10,
      energy: Math.round((energy * MONTHS_PER_YEAR) / KG_PER_TONNE * 10) / 10,
      lifestyle: Math.round((lifestyle * MONTHS_PER_YEAR) / KG_PER_TONNE * 10) / 10,
      total: annualTonnes
    },
    comparison: {
      vs_global: Math.round((annualTonnes / BENCHMARKS.global_average) * 100),
      vs_target: Math.round((annualTonnes / BENCHMARKS.target_2050) * 100),
      vs_us: Math.round((annualTonnes / BENCHMARKS.us_average) * 100),
    },
    equivalents: {
      trees: Math.round(annualTonnes * EQUIVALENTS.trees_per_tonne),
      km_driven: Math.round(annualTonnes * EQUIVALENTS.km_driven_per_tonne),
    },
    ecoScore: calculateEcoScore(annualTonnes)
  };
}

/**
 * Assigns a score (0-100) and grade (A-F) based on annual tonnes of CO2.
 * @param {number} annualTonnes - User's total annual footprint.
 * @returns {Object} Score and grade.
 */
export function calculateEcoScore(annualTonnes) {
  let score;
  if (annualTonnes <= 2) score = 95;
  else if (annualTonnes <= 4) score = 80;
  else if (annualTonnes <= 6) score = 65;
  else if (annualTonnes <= 8) score = 50;
  else if (annualTonnes <= 12) score = 35;
  else if (annualTonnes <= 16) score = 20;
  else score = 10;
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
  return { score, grade };
}
