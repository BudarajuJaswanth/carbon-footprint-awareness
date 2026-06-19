/**
 * Service to manage and evaluate sustainability goals
 */
export class GoalService {
  /**
   * Evaluates all active goals against footprint history.
   * @param {Array<Object>} footprints - Footprint records
   * @param {Array<Object>} goals - Goal items
   * @returns {Array<Object>} Updated goals list
   */
  static evaluateGoalsProgress(footprints, goals) {
    if (!goals || goals.length === 0) return [];
    if (!footprints || footprints.length === 0) return goals;

    const latest = footprints[footprints.length - 1];

    return goals.map(goal => {
      // If goal is already completed, leave it as is (prevent loss of milestones)
      if (goal.isCompleted) return goal;

      let currentValue = goal.currentValue;
      let isCompleted = goal.isCompleted;

      if (goal.type === 'reduction') {
        // Find baseline footprint. 
        // We look for the footprint closest to the goal's creation date (but prior to it),
        // or fallback to the very first footprint.
        const goalCreatedAt = new Date(goal.createdAt).getTime();
        
        let baseline = footprints[0];
        for (const fp of footprints) {
          const fpTime = new Date(fp.date).getTime();
          if (fpTime < goalCreatedAt) {
            baseline = fp;
          } else {
            break;
          }
        }

        if (baseline && latest && baseline.id !== latest.id) {
          const baselineTotal = baseline.emissions.total;
          const latestTotal = latest.emissions.total;
          
          if (baselineTotal > 0) {
            // Reduction percentage: (baseline - latest) / baseline * 100
            const pctReduction = ((baselineTotal - latestTotal) / baselineTotal) * 100;
            currentValue = Math.max(0, Number(pctReduction.toFixed(1)));
            isCompleted = currentValue >= goal.targetValue;
          }
        }
      }

      return {
        ...goal,
        currentValue,
        isCompleted
      };
    });
  }

  /**
   * Helper to create a new goal structure.
   * @param {string} description - Goal text description
   * @param {string} type - 'reduction' | 'habit'
   * @param {number} targetValue - Target number (e.g. 10 for 10% reduction, or 12 for 12 rides)
   * @returns {Object} Goal object
   */
  static createGoal(description, type, targetValue) {
    return {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: String(description).trim(),
      type: type === 'reduction' ? 'reduction' : 'habit',
      targetValue: Math.max(1, Number(targetValue)),
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
  }
}
