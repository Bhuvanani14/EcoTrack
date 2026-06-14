/**
 * EcoTrack Recommendation Engine
 * Generates personalized, prioritized carbon reduction suggestions.
 */

const RECOMMENDATIONS = [
  { id: 'bike_commute', category: 'transport', title: 'Bike or walk for short trips', description: 'Switch trips under 5 km to cycling or walking. Zero emissions and great exercise!', impact: 'high', effort: 'medium', savingsKgPerMonth: 40, icon: '🚲', condition: (p) => p?.transport?.commuteMode && !['bicycle','walking','metro','train'].includes(p.transport.commuteMode) },
  { id: 'public_transit', category: 'transport', title: 'Use public transport', description: 'Buses and trains emit 70-80% less CO₂ per passenger km than private cars.', impact: 'high', effort: 'medium', savingsKgPerMonth: 55, icon: '🚆', condition: (p) => ['car_petrol','car_diesel','taxi'].includes(p?.transport?.commuteMode) },
  { id: 'carpool', category: 'transport', title: 'Carpool with colleagues', description: 'Sharing rides with just one person cuts your transport emissions in half.', impact: 'medium', effort: 'low', savingsKgPerMonth: 30, icon: '🚗', condition: (p) => ['car_petrol','car_diesel','car_hybrid'].includes(p?.transport?.commuteMode) },
  { id: 'reduce_flights', category: 'transport', title: 'Reduce air travel', description: 'One fewer return long-haul flight saves ~3 tonnes CO₂e per year.', impact: 'high', effort: 'high', savingsKgPerMonth: 250, icon: '✈️', condition: (p) => (p?.transport?.longHaulFlights || 0) > 1 },
  { id: 'meatless_days', category: 'food', title: 'Go meatless 3 days a week', description: 'Replacing meat with plant-based meals even a few days a week makes a big difference.', impact: 'high', effort: 'low', savingsKgPerMonth: 35, icon: '🥗', condition: (p) => ['mixed','heavy_meat'].includes(p?.food?.dietType) },
  { id: 'reduce_beef', category: 'food', title: 'Swap beef for chicken or fish', description: 'Beef produces 4x more emissions than chicken. Small swap, big impact.', impact: 'high', effort: 'low', savingsKgPerMonth: 25, icon: '🥩', condition: (p) => p?.food?.redMeatFrequency === 'daily' || p?.food?.redMeatFrequency === 'weekly' },
  { id: 'local_food', category: 'food', title: 'Buy local & seasonal food', description: 'Locally sourced food travels less, reducing transport emissions by up to 15%.', impact: 'medium', effort: 'low', savingsKgPerMonth: 15, icon: '🌽', condition: (p) => p?.food?.localFood !== 'mostly_local' },
  { id: 'reduce_waste', category: 'food', title: 'Reduce food waste', description: '1/3 of food is wasted globally. Plan meals and use leftovers creatively.', impact: 'medium', effort: 'low', savingsKgPerMonth: 20, icon: '♻️', condition: () => true },
  { id: 'renewable_energy', category: 'energy', title: 'Switch to renewable energy', description: 'Green energy tariffs can cut your electricity emissions by up to 80%.', impact: 'high', effort: 'medium', savingsKgPerMonth: 80, icon: '☀️', condition: (p) => p?.energy?.renewableEnergy !== 'yes' },
  { id: 'led_bulbs', category: 'energy', title: 'Switch to LED lighting', description: 'LEDs use 75% less energy than traditional bulbs and last 25x longer.', impact: 'low', effort: 'low', savingsKgPerMonth: 5, icon: '💡', condition: () => true },
  { id: 'thermostat', category: 'energy', title: 'Lower thermostat by 2°C', description: 'Reducing heating by just 2 degrees saves ~10% on energy bills and emissions.', impact: 'medium', effort: 'low', savingsKgPerMonth: 20, icon: '🌡️', condition: (p) => ['gas','electric'].includes(p?.energy?.heatingSource) },
  { id: 'heat_pump', category: 'energy', title: 'Consider a heat pump', description: 'Heat pumps are 3-4x more efficient than traditional heating systems.', impact: 'high', effort: 'high', savingsKgPerMonth: 60, icon: '🏠', condition: (p) => p?.energy?.heatingSource === 'gas' },
  { id: 'less_streaming', category: 'lifestyle', title: 'Reduce streaming time', description: 'Lowering video quality or watching less saves data center energy.', impact: 'low', effort: 'low', savingsKgPerMonth: 3, icon: '📺', condition: (p) => (p?.lifestyle?.streamingHours || 0) > 3 },
  { id: 'sustainable_fashion', category: 'lifestyle', title: 'Buy secondhand or sustainable fashion', description: 'Fast fashion is a major polluter. Each secondhand item saves ~25 kg CO₂.', impact: 'medium', effort: 'low', savingsKgPerMonth: 15, icon: '👕', condition: (p) => p?.lifestyle?.clothingFrequency === 'monthly' },
  { id: 'recycle_more', category: 'lifestyle', title: 'Recycle and compost regularly', description: 'Proper waste sorting reduces methane from landfills.', impact: 'medium', effort: 'low', savingsKgPerMonth: 10, icon: '🗑️', condition: (p) => p?.lifestyle?.recycling !== 'always' },
  { id: 'unplug_devices', category: 'energy', title: 'Unplug idle electronics', description: 'Standby power ("vampire energy") accounts for 5-10% of household electricity.', impact: 'low', effort: 'low', savingsKgPerMonth: 8, icon: '🔌', condition: () => true },
];

export function getRecommendations(userProfile, adoptedIds = []) {
  const applicable = RECOMMENDATIONS.filter(r =>
    !adoptedIds.includes(r.id) && r.condition(userProfile)
  );
  applicable.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const effortOrder = { low: 3, medium: 2, high: 1 };
    return (impactOrder[b.impact] * 2 + effortOrder[b.effort]) - (impactOrder[a.impact] * 2 + effortOrder[a.effort]);
  });
  return applicable;
}

export function getTopRecommendations(userProfile, count = 3) {
  return getRecommendations(userProfile).slice(0, count);
}

export function getRecommendationsByCategory(userProfile, category) {
  return getRecommendations(userProfile).filter(r => r.category === category);
}

export function calculatePotentialSavings(recommendations) {
  return recommendations.reduce((sum, r) => sum + r.savingsKgPerMonth, 0);
}
