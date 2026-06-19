/**
 * Database of recommendation actions
 */
const RECOMMENDATION_DATABASE = [
  // Transportation
  {
    id: 'rec_public_transit',
    category: 'TRANSPORTATION',
    title: 'Commute via Public Transit',
    description: 'Use trains or buses for work commuting twice a week instead of driving.',
    impact: 85, // kg CO2e / month saved
    difficulty: 'EASY',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_reduce_flights',
    category: 'TRANSPORTATION',
    title: 'Avoid Short-Haul Flights',
    description: 'Opt for rail travel or virtual meetings to reduce frequent short flights.',
    impact: 150,
    difficulty: 'MEDIUM',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_active_commute',
    category: 'TRANSPORTATION',
    title: 'Bike/Walk Short Distances',
    description: 'Replace car trips under 5 kilometers with walking or cycling.',
    impact: 45,
    difficulty: 'EASY',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_electric_vehicle',
    category: 'TRANSPORTATION',
    title: 'Transition to Electric Vehicle',
    description: 'When updating your vehicle, choose a hybrid or fully electric model.',
    impact: 220,
    difficulty: 'HARD',
    actionText: 'Add to Goals',
    isHighImpact: true
  },

  // Energy
  {
    id: 'rec_switch_led',
    category: 'ENERGY',
    title: 'Switch to LED Lighting',
    description: 'Replace incandescent bulbs with energy-efficient LEDs.',
    impact: 25,
    difficulty: 'EASY',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_green_tariff',
    category: 'ENERGY',
    title: 'Switch to Renewable Grid Tariffs',
    description: 'Enroll in a 100% green energy electricity tariff from your supplier.',
    impact: 180,
    difficulty: 'MEDIUM',
    actionText: 'Add to Goals',
    isHighImpact: true
  },
  {
    id: 'rec_smart_power',
    category: 'ENERGY',
    title: 'Defeat Vampire Load',
    description: 'Use smart power strips to completely power off standby devices.',
    impact: 15,
    difficulty: 'EASY',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_thermostat',
    category: 'ENERGY',
    title: 'Optimize Thermostat Settings',
    description: 'Lower heating by 1.5°C in winter and raise AC by 1.5°C in summer.',
    impact: 40,
    difficulty: 'EASY',
    actionText: 'Add to Goals'
  },

  // Lifestyle
  {
    id: 'rec_diet_vegan',
    category: 'LIFESTYLE',
    title: 'Shift Towards Plant-Based Diet',
    description: 'Reduce red meat consumption by shifting towards vegetarian or vegan meals.',
    impact: 135,
    difficulty: 'MEDIUM',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_recycle_waste',
    category: 'LIFESTYLE',
    title: 'Compost & Recycle Diligently',
    description: 'Divert organic waste and packaging material from landfills.',
    impact: 50,
    difficulty: 'EASY',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_secondhand_shop',
    category: 'LIFESTYLE',
    title: 'Shop Secondhand First',
    description: 'Buy clothing and electronics used to reduce manufacturing footprint.',
    impact: 75,
    difficulty: 'MEDIUM',
    actionText: 'Add to Goals'
  },
  {
    id: 'rec_meal_planning',
    category: 'LIFESTYLE',
    title: 'Reduce Food Waste',
    description: 'Plan weekly meals to minimize groceries decaying and going to waste.',
    impact: 40,
    difficulty: 'EASY',
    actionText: 'Add to Goals'
  }
];

export class RecommendationService {
  /**
   * Generates a sorted, prioritized list of recommendations based on footprints and stagnation.
   * @param {Array<Object>} footprints - Footprint history
   * @returns {Array<Object>} Customized recommendations
   */
  static getRecommendations(footprints) {
    if (!footprints || footprints.length === 0) {
      // Default: Return database sorted by impact
      return [...RECOMMENDATION_DATABASE].sort((a, b) => b.impact - a.impact);
    }

    const latest = footprints[footprints.length - 1];
    const totalEmissions = latest.emissions.total || 1; // avoid division by zero

    // 1. Calculate weights of each category
    const weights = {
      TRANSPORTATION: latest.emissions.transportation / totalEmissions,
      ENERGY: latest.emissions.energy / totalEmissions,
      LIFESTYLE: latest.emissions.lifestyle / totalEmissions
    };

    // 2. Detect stagnation in recent data
    // Stagnation defined as: last 3 reports do not show a cumulative footprint reduction of > 2%
    let isStagnating = false;
    if (footprints.length >= 3) {
      const lastThree = footprints.slice(-3);
      const firstTotal = lastThree[0].emissions.total;
      const latestTotal = lastThree[2].emissions.total;
      
      // If latest emissions are >= 98% of the emissions from 2 calculations ago, we are stagnating
      if (latestTotal >= firstTotal * 0.98) {
        isStagnating = true;
      }
    }

    // 3. Map database items and calculate priority scores
    return RECOMMENDATION_DATABASE.map(rec => {
      // Base score is the estimated impact
      let score = rec.impact;

      // Multiply by category weight multiplier (0 to 3x increase)
      const categoryWeight = weights[rec.category] || 0.33;
      score += score * categoryWeight * 2;

      // Boost high-impact suggestions if user is stagnating
      if (isStagnating && rec.isHighImpact) {
        score += 200; // Major priority boost
      }

      // Add helper explanation for why this is prioritized
      let priorityMessage = '';
      if (categoryWeight >= 0.4) {
        priorityMessage = `High priority: ${rec.category.toLowerCase()} is your largest source of emissions.`;
      } else if (isStagnating && rec.isHighImpact) {
        priorityMessage = 'Stagnation Warning: Adopt this high-impact action to break through your flat progress.';
      } else {
        priorityMessage = `Targeted reduction for your ${rec.category.toLowerCase()} profile.`;
      }

      return {
        ...rec,
        priorityScore: score,
        priorityReason: priorityMessage,
        isStagnatingAlert: isStagnating && rec.isHighImpact
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }
}
