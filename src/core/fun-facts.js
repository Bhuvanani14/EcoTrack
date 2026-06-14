/**
 * EcoTrack Fun Facts Database
 * 60+ curated fun facts about carbon footprint and climate.
 */

const FUN_FACTS = [
  // --- Transport ---
  { id: 'f1', icon: '🚗', text: 'The average car produces about 4.6 tonnes of CO₂ per year — nearly the entire global average footprint per person.', category: 'Transport', source: 'EPA', impact: 'mind-blowing' },
  { id: 'f2', icon: '✈️', text: 'A round-trip flight from NYC to London produces ~1.6 tonnes CO₂ per passenger — that\'s 1/3 of the sustainable annual budget.', category: 'Transport', source: 'ICAO', impact: 'mind-blowing' },
  { id: 'f3', icon: '🚆', text: 'Taking the train instead of driving can reduce your trip emissions by up to 80%.', category: 'Transport', source: 'EEA', impact: 'surprising' },
  { id: 'f4', icon: '🚲', text: 'If 10% of car trips were replaced by cycling, national emissions would drop by ~4%.', category: 'Transport', source: 'ECF', impact: 'surprising' },
  { id: 'f5', icon: '⛽', text: 'Idling your car for just 10 seconds wastes more fuel than restarting the engine.', category: 'Transport', source: 'NRCan', impact: 'good-to-know' },
  { id: 'f6', icon: '🛳️', text: 'Cruise ships can emit as much CO₂ per passenger-km as flying, plus significant air pollution.', category: 'Transport', source: 'Transport & Environment', impact: 'surprising' },
  { id: 'f7', icon: '🚀', text: 'A single SpaceX Falcon 9 launch produces about 336 tonnes of CO₂ — equal to 71 average people\'s annual footprint.', category: 'Transport', source: 'The Verge', impact: 'mind-blowing' },
  { id: 'f8', icon: '🛴', text: 'An e-scooter shared ride produces ~110g CO₂ per km due to collection, charging, and short lifespan.', category: 'Transport', source: 'Environmental Research Letters', impact: 'surprising' },

  // --- Food ---
  { id: 'f9', icon: '🥩', text: 'Producing 1 kg of beef generates 27 kg of CO₂ — equivalent to driving 100 km in a car.', category: 'Food', source: 'Poore & Nemecek', impact: 'mind-blowing' },
  { id: 'f10', icon: '🥛', text: 'Producing 1 glass of cow\'s milk creates nearly 3x the emissions of any plant-based milk.', category: 'Food', source: 'Our World in Data', impact: 'surprising' },
  { id: 'f11', icon: '🍫', text: 'Chocolate has a carbon footprint of 19 kg CO₂ per kg — deforestation for cocoa is a major factor.', category: 'Food', source: 'Poore & Nemecek', impact: 'surprising' },
  { id: 'f12', icon: '🍚', text: 'Rice paddies produce ~1.5% of global greenhouse gases due to methane from waterlogged fields.', category: 'Food', source: 'Nature', impact: 'surprising' },
  { id: 'f13', icon: '🥑', text: 'An avocado has a carbon footprint of ~0.85 kg CO₂ — mostly from water-intensive farming and shipping.', category: 'Food', source: 'Carbon Footprint Ltd', impact: 'good-to-know' },
  { id: 'f14', icon: '☕', text: 'Your daily coffee habit produces ~100-200 kg CO₂ per year depending on type and preparation.', category: 'Food', source: 'UCL', impact: 'surprising' },
  { id: 'f15', icon: '🗑️', text: 'Food waste in landfills generates methane — a gas 80x more potent than CO₂ over 20 years.', category: 'Food', source: 'EPA', impact: 'mind-blowing' },
  { id: 'f16', icon: '🌱', text: 'Going vegan for a year can save ~1 tonne of CO₂ compared to an average diet.', category: 'Food', source: 'Poore & Nemecek', impact: 'surprising' },
  { id: 'f17', icon: '🐑', text: 'Lamb has the highest carbon footprint of any common food: 39.2 kg CO₂ per kg.', category: 'Food', source: 'EWG', impact: 'mind-blowing' },
  { id: 'f18', icon: '🍺', text: 'A pint of beer produces ~500g CO₂, while a glass of wine produces ~100-200g.', category: 'Food', source: 'Berners-Lee', impact: 'good-to-know' },

  // --- Energy ---
  { id: 'f19', icon: '💡', text: 'Switching one incandescent bulb to LED saves ~50 kg CO₂ per year.', category: 'Energy', source: 'Energy Star', impact: 'good-to-know' },
  { id: 'f20', icon: '☀️', text: 'The sun delivers more energy to Earth in one hour than humanity uses in an entire year.', category: 'Energy', source: 'MIT', impact: 'mind-blowing' },
  { id: 'f21', icon: '🔌', text: '"Vampire power" from idle devices wastes 5-10% of household electricity — costing ~$100/year.', category: 'Energy', source: 'Lawrence Berkeley Lab', impact: 'surprising' },
  { id: 'f22', icon: '🌬️', text: 'Wind energy\'s carbon footprint is just 0.01 kg CO₂/kWh — 100x cleaner than coal.', category: 'Energy', source: 'IPCC', impact: 'surprising' },
  { id: 'f23', icon: '🏠', text: 'Improving home insulation can reduce heating emissions by 30-50% and save hundreds on energy bills.', category: 'Energy', source: 'Energy Saving Trust', impact: 'good-to-know' },
  { id: 'f24', icon: '🔋', text: 'Battery storage costs have fallen 90% since 2010, making renewable energy increasingly viable.', category: 'Energy', source: 'BloombergNEF', impact: 'surprising' },
  { id: 'f25', icon: '⚡', text: 'Norway generates 98% of its electricity from renewables, mainly hydropower.', category: 'Energy', source: 'IEA', impact: 'surprising' },
  { id: 'f26', icon: '🏗️', text: 'Cement production alone accounts for ~8% of global CO₂ emissions.', category: 'Energy', source: 'Chatham House', impact: 'mind-blowing' },

  // --- Nature ---
  { id: 'f27', icon: '🌳', text: 'A single mature tree absorbs ~22 kg of CO₂ per year — you\'d need 214 trees to offset the global average.', category: 'Nature', source: 'USDA', impact: 'surprising' },
  { id: 'f28', icon: '🌊', text: 'Oceans absorb about 30% of human-produced CO₂ — but this causes acidification threatening marine life.', category: 'Nature', source: 'NOAA', impact: 'surprising' },
  { id: 'f29', icon: '🏔️', text: 'Arctic sea ice has lost about 75% of its volume since 1979 due to global warming.', category: 'Nature', source: 'NSIDC', impact: 'mind-blowing' },
  { id: 'f30', icon: '🧊', text: 'If all of Greenland\'s ice melted, global sea levels would rise by about 7.4 meters.', category: 'Nature', source: 'NASA', impact: 'mind-blowing' },
  { id: 'f31', icon: '🐝', text: 'Climate change threatens 40% of insect species with extinction within decades.', category: 'Nature', source: 'Biological Conservation', impact: 'mind-blowing' },
  { id: 'f32', icon: '🌿', text: 'Mangrove forests store 3-5x more carbon per hectare than terrestrial forests.', category: 'Nature', source: 'Nature Geoscience', impact: 'surprising' },
  { id: 'f33', icon: '🐋', text: 'A single great whale sequesters about 33 tonnes of CO₂ over its lifetime — equivalent to 1,500 trees.', category: 'Nature', source: 'IMF', impact: 'mind-blowing' },
  { id: 'f34', icon: '🍄', text: 'Soil contains more carbon than the atmosphere and all plants combined.', category: 'Nature', source: 'FAO', impact: 'surprising' },

  // --- Technology ---
  { id: 'f35', icon: '📱', text: 'Manufacturing a single smartphone produces about 70 kg CO₂ — more than a year of using it.', category: 'Technology', source: 'Apple Environmental Report', impact: 'surprising' },
  { id: 'f36', icon: '📧', text: 'Sending 65 emails is equivalent to driving 1 km in a car in terms of CO₂.', category: 'Technology', source: 'Berners-Lee', impact: 'good-to-know' },
  { id: 'f37', icon: '📺', text: 'Streaming 1 hour of video generates ~36g CO₂ — 4 hours/day for a year equals a short-haul flight.', category: 'Technology', source: 'IEA', impact: 'surprising' },
  { id: 'f38', icon: '🖥️', text: 'Global data centers consume about 1-1.5% of world electricity and produce ~0.3% of all CO₂ emissions.', category: 'Technology', source: 'IEA', impact: 'surprising' },
  { id: 'f39', icon: '🤖', text: 'Training a single large AI model can emit as much CO₂ as 5 cars over their lifetimes (~284 tonnes).', category: 'Technology', source: 'MIT Technology Review', impact: 'mind-blowing' },
  { id: 'f40', icon: '🔍', text: 'A single Google search produces about 0.2g of CO₂ — but with billions of searches daily, it adds up.', category: 'Technology', source: 'Google', impact: 'good-to-know' },
  { id: 'f41', icon: '🎮', text: 'Gaming consoles can use 100-200W of power — comparable to a large TV or several light bulbs.', category: 'Technology', source: 'NRDC', impact: 'good-to-know' },
  { id: 'f42', icon: '☁️', text: 'Cloud computing is 3.6x more energy-efficient than traditional on-premise data centers.', category: 'Technology', source: 'Lawrence Berkeley Lab', impact: 'good-to-know' },

  // --- History & General ---
  { id: 'f43', icon: '🏭', text: 'Since 1751, humanity has emitted over 1.5 trillion tonnes of CO₂ into the atmosphere.', category: 'History', source: 'Global Carbon Project', impact: 'mind-blowing' },
  { id: 'f44', icon: '📈', text: 'CO₂ levels are now at 420+ ppm — the highest in at least 800,000 years.', category: 'History', source: 'NOAA', impact: 'mind-blowing' },
  { id: 'f45', icon: '🌡️', text: 'The last decade (2014-2023) was the warmest decade in recorded history.', category: 'History', source: 'WMO', impact: 'mind-blowing' },
  { id: 'f46', icon: '🏅', text: 'The COVID-19 lockdowns in 2020 reduced global emissions by only about 7% — showing how much structural change is needed.', category: 'History', source: 'Nature Climate Change', impact: 'surprising' },
  { id: 'f47', icon: '🇸🇪', text: 'The term "carbon footprint" was popularized by a BP ad campaign in 2005 to shift focus to individual responsibility.', category: 'History', source: 'The Guardian', impact: 'surprising' },
  { id: 'f48', icon: '💰', text: 'Climate change could cost the global economy up to $23 trillion per year by 2050 if unchecked.', category: 'History', source: 'Swiss Re', impact: 'mind-blowing' },
  { id: 'f49', icon: '🌍', text: 'Just 100 companies are responsible for 71% of global industrial greenhouse gas emissions since 1988.', category: 'History', source: 'Carbon Disclosure Project', impact: 'mind-blowing' },
  { id: 'f50', icon: '👶', text: 'Today\'s children will face 2-7x more extreme climate events than their grandparents.', category: 'History', source: 'Science', impact: 'mind-blowing' },

  // --- Extra fun ones ---
  { id: 'f51', icon: '🐄', text: 'A single cow produces 70-120 kg of methane per year — equivalent to driving 12,000 km in a car.', category: 'Food', source: 'FAO', impact: 'mind-blowing' },
  { id: 'f52', icon: '🎄', text: 'A real Christmas tree has a lower carbon footprint than an artificial one if the artificial one is used for less than 10 years.', category: 'Nature', source: 'Carbon Trust', impact: 'surprising' },
  { id: 'f53', icon: '👟', text: 'A pair of running shoes produces about 14 kg of CO₂ — equivalent to keeping a light bulb on for a week.', category: 'Technology', source: 'MIT', impact: 'good-to-know' },
  { id: 'f54', icon: '🏊', text: 'Heating a swimming pool produces 2-4 tonnes of CO₂ per year — a solar cover can reduce this by 50%.', category: 'Energy', source: 'Energy Saving Trust', impact: 'surprising' },
  { id: 'f55', icon: '🐕', text: 'A medium-sized dog has a carbon footprint of ~770 kg CO₂ per year, mainly from food.', category: 'Food', source: 'Okin, 2017', impact: 'surprising' },
  { id: 'f56', icon: '💎', text: 'Lab-grown diamonds have ~5x lower carbon footprint than mined diamonds.', category: 'Technology', source: 'Frost & Sullivan', impact: 'good-to-know' },
  { id: 'f57', icon: '🎈', text: 'Releasing helium balloons creates not just litter but also wastes a non-renewable resource.', category: 'Nature', source: 'NWF', impact: 'good-to-know' },
  { id: 'f58', icon: '🧻', text: 'Using a hand dryer produces ~3x fewer emissions than paper towels.', category: 'Technology', source: 'MIT', impact: 'good-to-know' },
  { id: 'f59', icon: '🌾', text: 'Regenerative farming could sequester up to 10 billion tonnes of CO₂ annually if scaled globally.', category: 'Nature', source: 'Rodale Institute', impact: 'surprising' },
  { id: 'f60', icon: '🎵', text: 'Streaming music on Spotify for 1 hour produces ~0.2-0.5g CO₂ — much less than a physical CD.', category: 'Technology', source: 'University of Glasgow', impact: 'good-to-know' },
];

export function getRandomFact(excludeIds = []) {
  const available = FUN_FACTS.filter(f => !excludeIds.includes(f.id));
  if (available.length === 0) return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export function getFactsByCategory(category) {
  if (!category || category === 'All') return FUN_FACTS;
  return FUN_FACTS.filter(f => f.category === category);
}

export function getFactsByImpact(impact) {
  return FUN_FACTS.filter(f => f.impact === impact);
}

export function getDailyFact() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return FUN_FACTS[dayOfYear % FUN_FACTS.length];
}

export function getAllCategories() {
  return [...new Set(FUN_FACTS.map(f => f.category))];
}

export function getAllFacts() {
  return FUN_FACTS;
}
