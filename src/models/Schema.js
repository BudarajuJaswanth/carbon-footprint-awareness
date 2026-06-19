/**
 * System Data Schemas and Initializers
 */

/**
 * Creates a blank or initialized Carbon Footprint data object structure.
 * @param {Object} [data] - Partial footprint data
 * @returns {Object} Full structural footprint object
 */
export function createFootprintModel(data = {}) {
  const transport = data.transportation || {};
  const energy = data.energy || {};
  const lifestyle = data.lifestyle || {};
  const emissions = data.emissions || {};

  return {
    id: data.id || `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: data.date || new Date().toISOString(),
    transportation: {
      carDistance: Number(transport.carDistance ?? 0),
      fuelType: String(transport.fuelType || 'PETROL').toUpperCase(),
      publicDistance: Number(transport.publicDistance ?? 0),
      flightsShort: Number(transport.flightsShort ?? 0),
      flightsLong: Number(transport.flightsLong ?? 0)
    },
    energy: {
      electricity: Number(energy.electricity ?? 0),
      renewable: Number(energy.renewable ?? 0)
    },
    lifestyle: {
      diet: String(lifestyle.diet || 'AVERAGE').toUpperCase(),
      shopping: String(lifestyle.shopping || 'AVERAGE').toUpperCase(),
      waste: String(lifestyle.waste || 'AVERAGE').toUpperCase()
    },
    emissions: {
      transportation: Number(emissions.transportation ?? 0),
      energy: Number(emissions.energy ?? 0),
      lifestyle: Number(emissions.lifestyle ?? 0),
      total: Number(emissions.total ?? 0)
    }
  };
}

/**
 * Creates a default list of unlockable Achievements.
 * @returns {Array<Object>} List of achievements
 */
export function createInitialAchievements() {
  return [
    {
      id: 'first_calculation',
      title: 'First Footprint',
      description: 'Completed your first carbon footprint calculation.',
      icon: '🌱',
      isUnlocked: false,
      unlockedAt: null
    },
    {
      id: 'low_carbon_hero',
      title: 'Eco Warrior',
      description: 'Achieved a monthly emission score below the national average (under 600 kg CO2e).',
      icon: '🛡️',
      isUnlocked: false,
      unlockedAt: null
    },
    {
      id: 'footprint_reducer',
      title: 'Carbon Cutter',
      description: 'Reduced your footprint compared to your previous calculation.',
      icon: '📉',
      isUnlocked: false,
      unlockedAt: null
    },
    {
      id: 'green_commuter',
      title: 'Clean Commuter',
      description: 'Reduced car travel to zero and active public transport usage.',
      icon: '🚲',
      isUnlocked: false,
      unlockedAt: null
    },
    {
      id: 'renewable_pioneer',
      title: 'Sun Powered',
      description: 'Switched to 100% renewable energy percentage.',
      icon: '☀️',
      isUnlocked: false,
      unlockedAt: null
    },
    {
      id: 'goals_champion',
      title: 'Goal Getter',
      description: 'Completed your first carbon reduction goal.',
      icon: '🏆',
      isUnlocked: false,
      unlockedAt: null
    }
  ];
}
