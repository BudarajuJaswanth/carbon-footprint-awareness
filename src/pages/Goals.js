import { createElement } from '../utils/dom.js';
import { store } from '../services/Store.js';
import { GoalService } from '../services/GoalService.js';
import { GoalItem } from '../components/GoalItem.js';
import { Card } from '../components/Card.js';
import { createModal } from '../components/Modal.js';
import { formatDate } from '../utils/formatters.js';

/**
 * Renders the Goals and Achievements view page.
 * @returns {HTMLElement} Goals DOM page element
 */
export function renderGoals() {
  const container = createElement('div', { className: 'goals-page' });

  // Page Header
  const actionsHeader = createElement('button', {
    className: 'btn btn-primary',
    textContent: '+ Custom Goal',
    onClick: () => openAddGoalModal()
  });

  container.appendChild(
    createElement('div', { className: 'dashboard-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' } },
      createElement('div', {},
        createElement('h1', { className: 'dashboard-title', textContent: 'Sustainability Goals & Milestones' }),
        createElement('p', { className: 'dashboard-subtitle', textContent: 'Establish carbon targets, log daily green habits, and unlock achievements.' })
      ),
      actionsHeader
    )
  );

  const state = store.getState();
  
  // Evaluate goal progress automatically against latest footprint logs
  const evaluatedGoals = GoalService.evaluateGoalsProgress(state.footprints, state.goals);
  
  // Section: Goals Grid
  const goalsSection = createElement('div', { style: { marginBottom: '40px' } });
  goalsSection.appendChild(createElement('h2', { textContent: 'Your Active Goals', style: { marginBottom: '20px' } }));

  if (evaluatedGoals.length === 0) {
    goalsSection.appendChild(
      Card({},
        createElement('div', { style: { textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' } },
          createElement('p', { textContent: 'You have no active sustainability goals. Click the "+ Custom Goal" button or visit the Recommendations page to start tracking progress.' })
        )
      )
    );
  } else {
    const goalsGrid = createElement('div', { className: 'goals-grid' });
    
    evaluatedGoals.forEach(goal => {
      goalsGrid.appendChild(
        GoalItem({
          goal,
          onIncrement: (id, val) => {
            store.updateGoalProgress(id, val);
          },
          onDelete: (id) => {
            if (confirm('Are you sure you want to delete this goal?')) {
              store.deleteGoal(id);
            }
          }
        })
      );
    });
    
    goalsSection.appendChild(goalsGrid);
  }
  container.appendChild(goalsSection);

  // Section: Achievements / Milestones Unlocked
  const achievementsSection = createElement('div', {});
  achievementsSection.appendChild(
    createElement('div', {},
      createElement('h2', { textContent: 'Milestone Achievements' }),
      createElement('p', { className: 'dashboard-subtitle', textContent: 'Earn badges as you lower your carbon output and build eco-friendly routines.' })
    )
  );

  const achievementsGrid = createElement('div', { className: 'achievements-grid' });
  state.achievements.forEach(ach => {
    const isUnlocked = ach.isUnlocked;
    
    achievementsGrid.appendChild(
      createElement('div', { 
        className: `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`.trim(),
        title: isUnlocked ? `Unlocked on ${formatDate(ach.unlockedAt)}` : 'Locked'
      },
        createElement('div', { className: 'achievement-badge', textContent: ach.icon }),
        createElement('h4', { className: 'achievement-title', textContent: ach.title }),
        createElement('p', { className: 'achievement-desc', textContent: ach.description }),
        isUnlocked 
          ? createElement('span', { 
              style: { fontSize: '0.65rem', color: 'var(--primary)', marginTop: '8px', fontWeight: 'bold' },
              textContent: `UNLOCKED ${formatDate(ach.unlockedAt).toUpperCase()}`
            })
          : createElement('span', { 
              style: { fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '8px' },
              textContent: 'LOCKED'
            })
      )
    );
  });

  achievementsSection.appendChild(achievementsGrid);
  container.appendChild(achievementsSection);

  // Modal handler to create custom goals
  const openAddGoalModal = () => {
    const descInput = createElement('input', {
      type: 'text',
      id: 'new-goal-desc',
      className: 'form-input',
      placeholder: 'e.g. Turn off HVAC when away',
      required: true
    });

    const typeSelect = createElement('select', {
      id: 'new-goal-type',
      className: 'form-select'
    },
      createElement('option', { value: 'reduction', textContent: 'Carbon Reduction Percentage (%)' }),
      createElement('option', { value: 'habit', textContent: 'Green Habit Repetition Count (Times)' })
    );

    const targetInput = createElement('input', {
      type: 'number',
      id: 'new-goal-target',
      className: 'form-input',
      min: '1',
      value: '10',
      required: true
    });

    const modalError = createElement('span', {
      className: 'form-error',
      style: { display: 'none', marginBottom: '16px' }
    });

    // Handle Form Submit inside Modal
    const handleModalSubmit = (e) => {
      e.preventDefault();
      modalError.style.display = 'none';

      const desc = descInput.value.trim();
      const type = typeSelect.value;
      const target = Number(targetInput.value);

      if (!desc) {
        modalError.textContent = 'Please enter a goal description.';
        modalError.style.display = 'block';
        return;
      }

      if (isNaN(target) || target <= 0) {
        modalError.textContent = 'Please enter a valid target value greater than 0.';
        modalError.style.display = 'block';
        return;
      }

      const customGoal = GoalService.createGoal(desc, type, target);
      store.addGoal(customGoal);
      
      modal.close();
    };

    const modalForm = createElement('form', { onSubmit: handleModalSubmit },
      modalError,
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'new-goal-desc', textContent: 'Goal Description' }),
        descInput
      ),
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'new-goal-type', textContent: 'Goal Metric Type' }),
        typeSelect
      ),
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'new-goal-target', textContent: 'Target Value' }),
        targetInput,
        createElement('p', { 
          style: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' },
          textContent: 'Percentage reduction target (e.g. 15 for 15% reduction) or habit counts (e.g. 10 for 10 commutes).'
        })
      ),
      createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' } },
        createElement('button', {
          type: 'button',
          className: 'btn btn-secondary',
          textContent: 'Cancel',
          onClick: () => modal.close()
        }),
        createElement('button', {
          type: 'submit',
          className: 'btn btn-primary',
          textContent: 'Create Goal'
        })
      )
    );

    const modal = createModal({ title: 'Add Custom Sustainability Goal' }, modalForm);
  };

  return container;
}
