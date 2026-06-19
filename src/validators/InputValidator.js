import { LIMITS } from '../constants/EmissionFactors.js';

/**
 * Input Validator for Carbon Footprint forms
 */
export class InputValidator {
  /**
   * Validates a transportation dataset.
   * @param {Object} data - Transportation inputs
   * @returns {{isValid: boolean, errors: Object}} Validation results
   */
  static validateTransportation(data) {
    const errors = {};
    const { carDistance, fuelType, publicDistance, flightsShort, flightsLong } = data;

    // Car travel distance
    if (carDistance !== undefined && carDistance !== null && carDistance !== '') {
      const dist = Number(carDistance);
      if (isNaN(dist) || dist < 0) {
        errors.carDistance = 'Distance must be a non-negative number.';
      } else if (dist > LIMITS.CAR_DISTANCE_MAX) {
        errors.carDistance = `Distance exceeds reasonable limit of ${LIMITS.CAR_DISTANCE_MAX} km.`;
      }
    }

    // Fuel Type
    const validFuels = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];
    if (fuelType && !validFuels.includes(fuelType.toUpperCase())) {
      errors.fuelType = 'Invalid fuel type selected.';
    }

    // Public transport usage
    if (publicDistance !== undefined && publicDistance !== null && publicDistance !== '') {
      const dist = Number(publicDistance);
      if (isNaN(dist) || dist < 0) {
        errors.publicDistance = 'Public transit distance must be a non-negative number.';
      } else if (dist > LIMITS.PUBLIC_DISTANCE_MAX) {
        errors.publicDistance = `Public transit distance exceeds reasonable limit of ${LIMITS.PUBLIC_DISTANCE_MAX} km.`;
      }
    }

    // Flights
    const validateFlightCount = (count, fieldName) => {
      if (count !== undefined && count !== null && count !== '') {
        const num = Number(count);
        if (isNaN(num) || !Number.isInteger(num) || num < 0) {
          errors[fieldName] = 'Number of flights must be a non-negative integer.';
        } else if (num > LIMITS.FLIGHTS_MAX) {
          errors[fieldName] = `Flight count exceeds limits of ${LIMITS.FLIGHTS_MAX} per year.`;
        }
      }
    };
    validateFlightCount(flightsShort, 'flightsShort');
    validateFlightCount(flightsLong, 'flightsLong');

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validates energy inputs.
   * @param {Object} data - Energy inputs
   * @returns {{isValid: boolean, errors: Object}} Validation results
   */
  static validateEnergy(data) {
    const errors = {};
    const { electricity, renewable } = data;

    // Monthly electricity
    if (electricity !== undefined && electricity !== null && electricity !== '') {
      const kwh = Number(electricity);
      if (isNaN(kwh) || kwh < 0) {
        errors.electricity = 'Electricity usage must be a non-negative number.';
      } else if (kwh > LIMITS.ELECTRICITY_MAX) {
        errors.electricity = `Electricity usage exceeds limit of ${LIMITS.ELECTRICITY_MAX} kWh.`;
      }
    }

    // Renewable percentage
    if (renewable !== undefined && renewable !== null && renewable !== '') {
      const pct = Number(renewable);
      if (isNaN(pct) || pct < 0 || pct > LIMITS.RENEWABLE_MAX) {
        errors.renewable = `Renewable percentage must be a number between 0 and ${LIMITS.RENEWABLE_MAX}.`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validates lifestyle choices.
   * @param {Object} data - Lifestyle choices
   * @returns {{isValid: boolean, errors: Object}} Validation results
   */
  static validateLifestyle(data) {
    const errors = {};
    const { diet, shopping, waste } = data;

    const validDiets = ['VEGAN', 'VEGETARIAN', 'LOW_MEAT', 'HIGH_MEAT', 'AVERAGE'];
    if (diet && !validDiets.includes(diet.toUpperCase())) {
      errors.diet = 'Invalid diet selection.';
    }

    const validShopping = ['MINIMALIST', 'AVERAGE', 'HEAVY'];
    if (shopping && !validShopping.includes(shopping.toUpperCase())) {
      errors.shopping = 'Invalid shopping selection.';
    }

    const validWaste = ['LOW', 'AVERAGE', 'HIGH'];
    if (waste && !validWaste.includes(waste.toUpperCase())) {
      errors.waste = 'Invalid waste selection.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
