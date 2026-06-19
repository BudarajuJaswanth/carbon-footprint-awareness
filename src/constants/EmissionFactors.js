/**
 * Emission Factors & Constants for Carbon Calculations
 * Values represent kilograms of CO2 equivalent (kg CO2e) per unit.
 */
export const EMISSION_FACTORS = {
  // Transportation (kg CO2e per km)
  TRANSPORTATION: {
    CAR: {
      PETROL: 0.18,
      DIESEL: 0.17,
      HYBRID: 0.10,
      ELECTRIC: 0.05
    },
    PUBLIC: 0.035, // average train/bus
    FLIGHT: {
      SHORT_HAUL: 150, // per short flight (< 3 hours / 1500 km)
      LONG_HAUL: 500  // per long flight (>= 3 hours)
    }
  },

  // Energy (kg CO2e per kWh)
  ENERGY: {
    GRID_ELECTRICITY: 0.40, // standard grid average
  },

  // Lifestyle (kg CO2e per month)
  LIFESTYLE: {
    DIET: {
      VEGAN: 125,
      VEGETARIAN: 140,
      LOW_MEAT: 210,
      HIGH_MEAT: 275
    },
    SHOPPING: {
      MINIMALIST: 50,
      AVERAGE: 120,
      HEAVY: 250
    },
    WASTE: {
      LOW: 10,     // strict recycling / composting
      AVERAGE: 30, // standard household
      HIGH: 60     // no recycling / high waste
    }
  }
};

/**
 * Limits and validator ranges
 */
export const LIMITS = {
  CAR_DISTANCE_MAX: 10000, // km per month
  PUBLIC_DISTANCE_MAX: 10000, // km per month
  FLIGHTS_MAX: 100, // flights per year
  ELECTRICITY_MAX: 5000, // kWh per month
  RENEWABLE_MAX: 100 // percentage
};
