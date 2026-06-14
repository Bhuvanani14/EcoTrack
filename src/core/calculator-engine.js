/**
 * EcoTrack Calculator Engine
 * Computes emissions for each category and total footprint.
 */
import { EMISSION_FACTORS, BENCHMARKS, EQUIVALENTS } from './emission-factors.js';

export function calculateTransportEmissions(transportData) {
  let monthlyKg = 0;
  if (transportData.commuteMode && transportData.commuteDistance) {
    const mode = EMISSION_FACTORS.transport[transportData.commuteMode];
    if (mode) {
      const workDaysPerMonth = 22;
      monthlyKg += mode.factor * transportData.commuteDistance * 2 * workDaysPerMonth;
    }
  }
  if (transportData.shortHaulFlights) {
    const annualKm = transportData.shortHaulFlights * EMISSION_FACTORS.flight_distances.short_haul * 2;
    monthlyKg += (annualKm * EMISSION_FACTORS.transport.flight_short.factor) / 12;
  }
  if (transportData.longHaulFlights) {
    const annualKm = transportData.longHaulFlights * EMISSION_FACTORS.flight_distances.long_haul * 2;
    monthlyKg += (annualKm * EMISSION_FACTORS.transport.flight_long.factor) / 12;
  }
  return Math.round(monthlyKg * 10) / 10;
}

export function calculateFoodEmissions(foodData) {
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

export function calculateEnergyEmissions(energyData) {
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
  if (energyData.electricityKwh) {
    monthlyKg += energyData.electricityKwh * EMISSION_FACTORS.energy.electricity.factor;
  }
  return Math.round(monthlyKg * 10) / 10;
}

export function calculateLifestyleEmissions(lifestyleData) {
  let monthlyKg = 0;
  if (lifestyleData.clothingFrequency === 'monthly') monthlyKg += 4 * EMISSION_FACTORS.lifestyle.new_clothes.factor;
  else if (lifestyleData.clothingFrequency === 'quarterly') monthlyKg += 1.5 * EMISSION_FACTORS.lifestyle.new_clothes.factor;
  else if (lifestyleData.clothingFrequency === 'rarely') monthlyKg += 0.3 * EMISSION_FACTORS.lifestyle.new_clothes.factor;
  if (lifestyleData.streamingHours) {
    monthlyKg += lifestyleData.streamingHours * 30 * EMISSION_FACTORS.lifestyle.streaming.factor;
  }
  if (lifestyleData.recycling === 'always') monthlyKg *= 0.85;
  else if (lifestyleData.recycling === 'rarely') monthlyKg *= 1.15;
  monthlyKg += 30;
  return Math.round(monthlyKg * 10) / 10;
}

export function calculateTotalFootprint(allData) {
  const transport = calculateTransportEmissions(allData.transport || {});
  const food = calculateFoodEmissions(allData.food || {});
  const energy = calculateEnergyEmissions(allData.energy || {});
  const lifestyle = calculateLifestyleEmissions(allData.lifestyle || {});
  const monthlyTotal = transport + food + energy + lifestyle;
  const annualTonnes = Math.round((monthlyTotal * 12) / 100) / 10;
  return {
    monthly: { transport, food, energy, lifestyle, total: Math.round(monthlyTotal * 10) / 10 },
    annual: {
      transport: Math.round(transport * 12 / 100) / 10,
      food: Math.round(food * 12 / 100) / 10,
      energy: Math.round(energy * 12 / 100) / 10,
      lifestyle: Math.round(lifestyle * 12 / 100) / 10,
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
