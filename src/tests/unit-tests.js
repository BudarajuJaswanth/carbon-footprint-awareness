import { describe, it, expect } from './test-framework.js';
import { CalculatorService } from '../services/CalculatorService.js';
import { RecommendationService } from '../services/RecommendationService.js';
import { GoalService } from '../services/GoalService.js';
import { InputValidator } from '../validators/InputValidator.js';
import { EMISSION_FACTORS } from '../constants/EmissionFactors.js';

export function runUnitTests() {
  describe('Carbon Calculator Service Unit Tests', () => {
    it('should calculate transportation emissions correctly', () => {
      // Petrol car: 100km * 0.18 = 18
      // Public transit: 200km * 0.035 = 7
      // 12 short-haul flights (yearly): (12 * 150) / 12 = 150
      // 3 long-haul flights (yearly): (3 * 500) / 12 = 125
      // Expected total = 18 + 7 + 150 + 125 = 300
      const transportData = {
        carDistance: 100,
        fuelType: 'PETROL',
        publicDistance: 200,
        flightsShort: 12,
        flightsLong: 3
      };
      
      const emissions = CalculatorService.calculateTransportation(transportData);
      expect(emissions).toBe(300);
    });

    it('should calculate EV transportation emissions correctly', () => {
      // EV car: 100km * 0.05 = 5
      // No transit, no flights
      const transportData = {
        carDistance: 100,
        fuelType: 'ELECTRIC',
        publicDistance: 0,
        flightsShort: 0,
        flightsLong: 0
      };
      
      const emissions = CalculatorService.calculateTransportation(transportData);
      expect(emissions).toBe(5);
    });

    it('should calculate electricity emissions with renewable offsets', () => {
      // 500 kWh electricity * 0.4 kg/kWh = 200 kg
      // 50% renewable offset -> 200 * (1 - 0.5) = 100 kg
      const energyData = {
        electricity: 500,
        renewable: 50
      };

      const emissions = CalculatorService.calculateEnergy(energyData);
      expect(emissions).toBe(100);
    });

    it('should calculate lifestyle emissions by dietary habits', () => {
      // Vegan: 125, Minimalist Shopping: 50, Low Waste: 10
      // Expected = 125 + 50 + 10 = 185
      const lifestyleData = {
        diet: 'VEGAN',
        shopping: 'MINIMALIST',
        waste: 'LOW'
      };

      const emissions = CalculatorService.calculateLifestyle(lifestyleData);
      expect(emissions).toBe(185);
    });
  });

  describe('Recommendation Service Priority Engine', () => {
    it('should prioritize transportation recommendations if transit is highest source', () => {
      const footprintHistory = [{
        date: new Date().toISOString(),
        emissions: {
          transportation: 1000,
          energy: 200,
          lifestyle: 200,
          total: 1400
        }
      }];

      const recs = RecommendationService.getRecommendations(footprintHistory);
      
      // The top recommendation should belong to the TRANSPORTATION category
      expect(recs[0].category).toBe('TRANSPORTATION');
    });

    it('should boost high-impact recommendations if progress has stagnated', () => {
      // 3 entries indicating stagnant footprints
      const footprints = [
        { date: '2026-04-01', emissions: { total: 1000, transportation: 400, energy: 300, lifestyle: 300 } },
        { date: '2026-05-01', emissions: { total: 1000, transportation: 400, energy: 300, lifestyle: 300 } },
        { date: '2026-06-01', emissions: { total: 1005, transportation: 405, energy: 300, lifestyle: 300 } }
      ];

      const recs = RecommendationService.getRecommendations(footprints);
      
      // Look for a high impact flag in top priorities
      const hasStagnationWarning = recs.some(r => r.isStagnatingAlert === true);
      expect(hasStagnationWarning).toBe(true);
    });
  });

  describe('Input Validator Unit Tests', () => {
    it('should fail invalid or negative numbers', () => {
      const badTransport = {
        carDistance: -50,
        fuelType: 'PETROL',
        publicDistance: 'abc',
        flightsShort: 2.5
      };

      const res = InputValidator.validateTransportation(badTransport);
      expect(res.isValid).toBe(false);
      expect(res.errors.carDistance).toBe('Distance must be a non-negative number.');
      expect(res.errors.publicDistance).toBe('Public transit distance must be a non-negative number.');
      expect(res.errors.flightsShort).toBe('Number of flights must be a non-negative integer.');
    });

    it('should pass correct values and respect limits bounds', () => {
      const goodEnergy = {
        electricity: 300,
        renewable: 80
      };

      const res = InputValidator.validateEnergy(goodEnergy);
      expect(res.isValid).toBe(true);

      const limitEnergy = {
        electricity: 99999, // Exceeds limits bounds
        renewable: 105      // Exceeds 100%
      };

      const resBad = InputValidator.validateEnergy(limitEnergy);
      expect(resBad.isValid).toBe(false);
    });
  });
}
