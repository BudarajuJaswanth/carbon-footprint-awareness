import { describe, it, expect } from './test-framework.js';
import { Store } from '../services/Store.js';
import { GoalService } from '../services/GoalService.js';
import { createFootprintModel } from '../models/Schema.js';

export function runIntegrationTests() {
  describe('Application State Store Integration Tests', () => {
    it('should add footprints and trigger automated achievements checks', () => {
      // Create a fresh store instance for testing (isolated context)
      const testStore = new Store();
      testStore.state.footprints = []; // Clear footprints
      
      const initialUnlockedCount = testStore.state.achievements.filter(a => a.isUnlocked).length;
      expect(initialUnlockedCount).toBe(0);

      // 1. Add standard footprint
      const fp = createFootprintModel({
        transportation: { carDistance: 200, fuelType: 'PETROL', publicDistance: 100, flightsShort: 0, flightsLong: 0 },
        energy: { electricity: 200, renewable: 0 },
        lifestyle: { diet: 'AVERAGE', shopping: 'AVERAGE', waste: 'AVERAGE' },
        emissions: { transportation: 40, energy: 80, lifestyle: 200, total: 320 }
      });
      
      testStore.addFootprint(fp);

      // Verify footprint stored
      expect(testStore.state.footprints.length).toBe(1);
      
      // Verify "First Footprint" achievement is now unlocked
      const achFirst = testStore.state.achievements.find(a => a.id === 'first_calculation');
      expect(achFirst.isUnlocked).toBe(true);

      // Verify "Eco Warrior" achievement (since 320 kg is < 600 kg average)
      const achEco = testStore.state.achievements.find(a => a.id === 'low_carbon_hero');
      expect(achEco.isUnlocked).toBe(true);
    });

    it('should unlock Clean Commuter achievement if car distance is zero', () => {
      const testStore = new Store();
      testStore.state.footprints = [];

      const fp = createFootprintModel({
        transportation: { carDistance: 0, fuelType: 'PETROL', publicDistance: 250, flightsShort: 0, flightsLong: 0 },
        emissions: { transportation: 8.75, energy: 0, lifestyle: 0, total: 8.75 }
      });

      testStore.addFootprint(fp);
      
      const achCommute = testStore.state.achievements.find(a => a.id === 'green_commuter');
      expect(achCommute.isUnlocked).toBe(true);
    });
  });

  describe('Goals Evaluation Integration Tests', () => {
    it('should evaluate carbon reduction goal completions based on history', () => {
      // 1. Setup baseline calculation (1000 kg CO2e)
      const baselineFp = createFootprintModel({
        date: '2026-05-01T12:00:00Z',
        emissions: { transportation: 400, energy: 300, lifestyle: 300, total: 1000 }
      });

      // 2. Create custom reduction goal: 10% reduction
      // Created on 2026-05-15 (after baseline)
      const reductionGoal = GoalService.createGoal(
        'Reduce footprint by 10%',
        'reduction',
        10
      );
      reductionGoal.createdAt = '2026-05-15T12:00:00Z';

      // 3. Setup subsequent calculation showing 15% reduction (850 kg CO2e)
      const followUpFp = createFootprintModel({
        date: '2026-06-01T12:00:00Z',
        emissions: { transportation: 300, energy: 250, lifestyle: 300, total: 850 }
      });

      const history = [baselineFp, followUpFp];
      const goals = [reductionGoal];

      const evaluated = GoalService.evaluateGoalsProgress(history, goals);

      // Progress calculation: (1000 - 850) / 1000 * 100 = 15%
      expect(evaluated[0].currentValue).toBe(15);
      expect(evaluated[0].isCompleted).toBe(true);
    });
  });
}
