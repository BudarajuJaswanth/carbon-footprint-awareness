import { createInitialAchievements } from '../models/Schema.js';

const STORAGE_KEY = 'ecotrace_state_v1';

const DEFAULT_STATE = {
  footprints: [],
  goals: [
    {
      id: 'g_default_1',
      description: 'Reduce car travel by 20%',
      type: 'reduction',
      targetValue: 20,
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'g_default_2',
      description: 'Switch to public transport 3 times a week',
      type: 'habit',
      targetValue: 12, // 12 times a month
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date().toISOString()
    }
  ],
  achievements: createInitialAchievements(),
  theme: 'dark'
};

export class Store {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
  }

  /**
   * Safely loads state from localStorage with corruption protection.
   * @returns {Object} Application state
   */
  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      
      const parsed = JSON.parse(data);
      // Validate structure to prevent corruption crashes
      if (!parsed.footprints || !parsed.goals || !parsed.achievements) {
        throw new Error('Invalid state structure in localStorage');
      }

      // Check achievements migration
      if (parsed.achievements.length !== DEFAULT_STATE.achievements.length) {
        parsed.achievements = createInitialAchievements();
      }
      
      return parsed;
    } catch (e) {
      console.warn('Failed to load state or data corrupted. Resetting store.', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  /**
   * Persists state to localStorage.
   */
  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  /**
   * Returns copy of the current state.
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Subscribes a listener function to state changes.
   * @param {Function} listener - Callback to trigger on state updates
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    // Trigger immediately with current state for initialization
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifies all listeners of state changes.
   */
  notify() {
    const currentState = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error in store listener callback:', err);
      }
    }
  }

  /**
   * Updates UI Theme preference.
   * @param {string} theme - 'dark' | 'light'
   */
  updateTheme(theme) {
    this.state.theme = theme === 'light' ? 'light' : 'dark';
    this.saveState();
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.notify();
  }

  /**
   * Add a new calculated carbon footprint entry.
   * @param {Object} footprint - Footprint object
   */
  addFootprint(footprint) {
    this.state.footprints.push(footprint);
    // Sort footprint list by date ascending for charts, then save
    this.state.footprints.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Evaluate achievements unlocks
    this.checkAchievements();
    
    this.saveState();
    this.notify();
  }

  /**
   * Deletes a footprint record.
   * @param {string} id - Footprint ID
   */
  deleteFootprint(id) {
    this.state.footprints = this.state.footprints.filter(fp => fp.id !== id);
    this.saveState();
    this.notify();
  }

  /**
   * Adds a new customized user goal.
   * @param {Object} goal - Goal configuration
   */
  addGoal(goal) {
    this.state.goals.push(goal);
    this.saveState();
    this.notify();
  }

  /**
   * Updates progress of a specific goal.
   * @param {string} id - Goal ID
   * @param {number} value - Progress increment or absolute value
   */
  updateGoalProgress(id, value) {
    const goal = this.state.goals.find(g => g.id === id);
    if (goal) {
      goal.currentValue = Math.min(goal.targetValue, Math.max(0, value));
      const wasCompleted = goal.isCompleted;
      goal.isCompleted = goal.currentValue >= goal.targetValue;
      
      // If completed and wasn't before, trigger achievements check
      if (goal.isCompleted && !wasCompleted) {
        this.unlockAchievement('goals_champion');
      }
      
      this.saveState();
      this.notify();
    }
  }

  /**
   * Deletes a goal.
   * @param {string} id - Goal ID
   */
  deleteGoal(id) {
    this.state.goals = this.state.goals.filter(g => g.id !== id);
    this.saveState();
    this.notify();
  }

  /**
   * Safely unlocks a specific milestone achievement.
   * @param {string} id - Achievement ID
   */
  unlockAchievement(id) {
    const ach = this.state.achievements.find(a => a.id === id);
    if (ach && !ach.isUnlocked) {
      ach.isUnlocked = true;
      ach.unlockedAt = new Date().toISOString();
      this.saveState();
      this.notify();
      return true; // Unlocked successfully
    }
    return false;
  }

  /**
   * Evaluates rule-based achievements based on current state.
   */
  checkAchievements() {
    const fps = this.state.footprints;
    if (fps.length > 0) {
      // 1. First Calculation
      this.unlockAchievement('first_calculation');
      
      // Get latest entry
      const latest = fps[fps.length - 1];
      
      // 2. Eco Warrior (latest emissions under average)
      // Standard monthly average footprint is around 1300 kg, let's trigger under 600 kg.
      if (latest.emissions.total < 600) {
        this.unlockAchievement('low_carbon_hero');
      }

      // 3. Carbon Cutter (reduced footprint compared to previous entry)
      if (fps.length > 1) {
        const prev = fps[fps.length - 2];
        if (latest.emissions.total < prev.emissions.total) {
          this.unlockAchievement('footprint_reducer');
        }
      }

      // 4. Clean Commuter (zero car, active transit)
      if (latest.transportation.carDistance === 0 && latest.transportation.publicDistance > 0) {
        this.unlockAchievement('green_commuter');
      }

      // 5. Renewable Pioneer (100% renewable electricity)
      if (latest.energy.renewable === 100 && latest.energy.electricity > 0) {
        this.unlockAchievement('renewable_pioneer');
      }
    }
  }

  /**
   * Resets all app data back to factory defaults.
   */
  resetAllData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
    this.notify();
  }
}

// Export a singleton instance of the State Store
export const store = new Store();
// Initial theme loading application
document.documentElement.setAttribute('data-theme', store.getState().theme);
