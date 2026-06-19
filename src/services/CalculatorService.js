import { EMISSION_FACTORS } from '../constants/EmissionFactors.js';

/**
 * Service to calculate carbon emissions (in kg CO2e per month)
 */
export class CalculatorService {
  /**
   * Calculates monthly transportation emissions.
   * @param {Object} data - Transportation variables
   * @returns {number} Emissions in kg CO2e / month
   */
  static calculateTransportation(data) {
    const { carDistance = 0, fuelType = 'PETROL', publicDistance = 0, flightsShort = 0, flightsLong = 0 } = data;
    
    // 1. Car emissions
    const carFactor = EMISSION_FACTORS.TRANSPORTATION.CAR[fuelType.toUpperCase()] || EMISSION_FACTORS.TRANSPORTATION.CAR.PETROL;
    const carEmissions = carDistance * carFactor;

    // 2. Public transport emissions
    const publicEmissions = publicDistance * EMISSION_FACTORS.TRANSPORTATION.PUBLIC;

    // 3. Flight emissions (flights entered are per year, divide by 12 for monthly comparison)
    const shortHaulEmissions = (flightsShort * EMISSION_FACTORS.TRANSPORTATION.FLIGHT.SHORT_HAUL) / 12;
    const longHaulEmissions = (flightsLong * EMISSION_FACTORS.TRANSPORTATION.FLIGHT.LONG_HAUL) / 12;

    return Number((carEmissions + publicEmissions + shortHaulEmissions + longHaulEmissions).toFixed(2));
  }

  /**
   * Calculates monthly energy emissions.
   * @param {Object} data - Energy variables
   * @returns {number} Emissions in kg CO2e / month
   */
  static calculateEnergy(data) {
    const { electricity = 0, renewable = 0 } = data;

    // Calculate grid emissions, discounted by renewable energy offset percentage
    const gridFactor = EMISSION_FACTORS.ENERGY.GRID_ELECTRICITY;
    const renewableOffset = Math.min(100, Math.max(0, renewable)) / 100;
    const energyEmissions = electricity * gridFactor * (1 - renewableOffset);

    return Number(energyEmissions.toFixed(2));
  }

  /**
   * Calculates monthly lifestyle emissions.
   * @param {Object} data - Lifestyle variables
   * @returns {number} Emissions in kg CO2e / month
   */
  static calculateLifestyle(data) {
    const { diet = 'AVERAGE', shopping = 'AVERAGE', waste = 'AVERAGE' } = data;

    const dietEmissions = EMISSION_FACTORS.LIFESTYLE.DIET[diet.toUpperCase()] || EMISSION_FACTORS.LIFESTYLE.DIET.LOW_MEAT;
    const shoppingEmissions = EMISSION_FACTORS.LIFESTYLE.SHOPPING[shopping.toUpperCase()] || EMISSION_FACTORS.LIFESTYLE.SHOPPING.AVERAGE;
    const wasteEmissions = EMISSION_FACTORS.LIFESTYLE.WASTE[waste.toUpperCase()] || EMISSION_FACTORS.LIFESTYLE.WASTE.AVERAGE;

    return Number((dietEmissions + shoppingEmissions + wasteEmissions).toFixed(2));
  }

  /**
   * Calculates full footprint data incorporating breakdowns and totals.
   * @param {Object} inputs - Combined inputs
   * @returns {Object} Footprint object with emissions populated
   */
  static calculateFootprint(inputs) {
    const transportationEmissions = this.calculateTransportation(inputs.transportation || {});
    const energyEmissions = this.calculateEnergy(inputs.energy || {});
    const lifestyleEmissions = this.calculateLifestyle(inputs.lifestyle || {});
    
    const totalEmissions = Number((transportationEmissions + energyEmissions + lifestyleEmissions).toFixed(2));

    return {
      transportation: transportationEmissions,
      energy: energyEmissions,
      lifestyle: lifestyleEmissions,
      total: totalEmissions
    };
  }
}
