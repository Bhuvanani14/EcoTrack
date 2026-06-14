/**
 * EcoTrack Emission Factors Database
 * Values in kg CO₂e per unit, sourced from EPA, DEFRA, IEA public data.
 */

export const EMISSION_FACTORS = {
  transport: {
    car_petrol:    { factor: 0.21,  unit: 'km', label: 'Car (Petrol)' },
    car_diesel:    { factor: 0.17,  unit: 'km', label: 'Car (Diesel)' },
    car_hybrid:    { factor: 0.12,  unit: 'km', label: 'Car (Hybrid)' },
    car_electric:  { factor: 0.05,  unit: 'km', label: 'Car (Electric)' },
    motorcycle:    { factor: 0.11,  unit: 'km', label: 'Motorcycle' },
    bus:           { factor: 0.089, unit: 'km', label: 'Bus' },
    train:         { factor: 0.041, unit: 'km', label: 'Train' },
    metro:         { factor: 0.033, unit: 'km', label: 'Metro/Subway' },
    bicycle:       { factor: 0.0,   unit: 'km', label: 'Bicycle' },
    walking:       { factor: 0.0,   unit: 'km', label: 'Walking' },
    flight_short:  { factor: 0.255, unit: 'km', label: 'Flight (Short-haul)' },
    flight_long:   { factor: 0.195, unit: 'km', label: 'Flight (Long-haul)' },
    taxi:          { factor: 0.21,  unit: 'km', label: 'Taxi/Rideshare' },
  },

  food: {
    beef:          { factor: 27.0,  unit: 'kg', label: 'Beef' },
    lamb:          { factor: 39.2,  unit: 'kg', label: 'Lamb' },
    pork:          { factor: 12.1,  unit: 'kg', label: 'Pork' },
    chicken:       { factor: 6.9,   unit: 'kg', label: 'Chicken' },
    fish:          { factor: 6.1,   unit: 'kg', label: 'Fish' },
    cheese:        { factor: 13.5,  unit: 'kg', label: 'Cheese' },
    milk:          { factor: 3.2,   unit: 'litre', label: 'Milk' },
    eggs:          { factor: 4.8,   unit: 'kg', label: 'Eggs' },
    rice:          { factor: 4.0,   unit: 'kg', label: 'Rice' },
    bread:         { factor: 1.3,   unit: 'kg', label: 'Bread' },
    vegetables:    { factor: 2.0,   unit: 'kg', label: 'Vegetables' },
    fruits:        { factor: 1.1,   unit: 'kg', label: 'Fruits' },
    legumes:       { factor: 0.9,   unit: 'kg', label: 'Legumes/Beans' },
    nuts:          { factor: 2.3,   unit: 'kg', label: 'Nuts' },
    tofu:          { factor: 3.0,   unit: 'kg', label: 'Tofu' },
    coffee:        { factor: 16.5,  unit: 'kg', label: 'Coffee' },
    chocolate:     { factor: 19.0,  unit: 'kg', label: 'Chocolate' },
    processed:     { factor: 5.0,   unit: 'kg', label: 'Processed Foods' },
  },

  diet_monthly: {
    vegan:         { factor: 85,   label: 'Vegan' },
    vegetarian:    { factor: 130,  label: 'Vegetarian' },
    pescatarian:   { factor: 155,  label: 'Pescatarian' },
    mixed:         { factor: 210,  label: 'Mixed/Average' },
    heavy_meat:    { factor: 330,  label: 'Heavy Meat' },
  },

  energy: {
    electricity:   { factor: 0.42, unit: 'kWh', label: 'Electricity (Grid Average)' },
    natural_gas:   { factor: 2.0,  unit: 'm³',  label: 'Natural Gas' },
    heating_oil:   { factor: 2.54, unit: 'litre', label: 'Heating Oil' },
    lpg:           { factor: 1.51, unit: 'litre', label: 'LPG' },
    wood:          { factor: 0.39, unit: 'kg', label: 'Wood/Biomass' },
    solar:         { factor: 0.05, unit: 'kWh', label: 'Solar PV' },
    wind:          { factor: 0.01, unit: 'kWh', label: 'Wind' },
  },

  lifestyle: {
    new_clothes:   { factor: 25,   unit: 'item', label: 'New Clothing Item' },
    smartphone:    { factor: 70,   unit: 'device', label: 'Smartphone' },
    laptop:        { factor: 300,  unit: 'device', label: 'Laptop' },
    streaming:     { factor: 0.036, unit: 'hour', label: 'Video Streaming' },
    internet:      { factor: 0.015, unit: 'hour', label: 'Internet Browsing' },
    laundry:       { factor: 0.6,  unit: 'load', label: 'Laundry Load' },
    shower:        { factor: 0.5,  unit: '5min', label: '5-min Shower' },
  },

  housing: {
    apartment:     { factor: 120,  unit: 'month', label: 'Apartment' },
    small_house:   { factor: 200,  unit: 'month', label: 'Small House' },
    large_house:   { factor: 350,  unit: 'month', label: 'Large House' },
  },

  flight_distances: {
    short_haul: 1500,
    long_haul: 8000,
  }
};

export const BENCHMARKS = {
  global_average:   4.7,
  us_average:       16.0,
  eu_average:       6.8,
  india_average:    1.9,
  china_average:    7.4,
  target_2050:      2.0,
};

export const EQUIVALENTS = {
  trees_per_tonne:      45,
  km_driven_per_tonne:  4750,
  flights_paris_per_tonne: 0.6,
  smartphones_charged_per_kg: 122,
  led_bulb_hours_per_kg: 714,
};
