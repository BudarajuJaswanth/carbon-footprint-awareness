import { createElement } from '../utils/dom.js';
import { store } from '../services/Store.js';
import { RecommendationService } from '../services/RecommendationService.js';
import { GoalService } from '../services/GoalService.js';
import { Card } from '../components/Card.js';

export function renderRecommendations() {
  const container = createElement('div', { className: 'recommendations-page' });

  container.appendChild(
    createElement('div', { className: 'dashboard-header' },
      createElement('h1', { className: 'dashboard-title', textContent: 'Personalized AI Recommendations' }),
      createElement('p', { className: 'dashboard-subtitle', textContent: 'Contextual, high-impact actions designed specifically for your carbon profile.' })
    )
  );

  const state = store.getState();
  const footprints = state.footprints;
  const recommendations = RecommendationService.getRecommendations(footprints);

  if (footprints.length === 0) {
    container.appendChild(
      Card({ title: 'Receive Dynamic Recommendations' },
        createElement('div', { style: { textAlign: 'center', padding: '40px 0' } },
          createElement('p', { 
            style: { marginBottom: '20px', color: 'var(--text-secondary)' },
            textContent: 'Once you input your carbon data, our engine will analyze your transportation, energy, and diet profiles to generate tailored reduction plans.'
          }),
          createElement('a', {
            href: '#/calculator',
            className: 'btn btn-primary',
            textContent: 'Calculate Your Footprint'
          })
        )
      )
    );
    return container;
  }

  const listWrapper = createElement('div', { className: 'recs-container' });

  recommendations.forEach(rec => {
    const isGoalAlreadyCreated = state.goals.some(g => {
      const desc = g.description || '';
      return desc === rec.description || desc.includes(rec.title);
    });

    let categoryIcon = '';
    let iconClass = 'rec-icon-wrapper ';
    if (rec.category === 'TRANSPORTATION') {
      categoryIcon = '🚲';
      iconClass += 'rec-icon-transport';
    } else if (rec.category === 'ENERGY') {
      categoryIcon = '💡';
      iconClass += 'rec-icon-energy';
    } else {
      categoryIcon = '🥗';
      iconClass += 'rec-icon-lifestyle';
    }

    let diffBadgeColor = 'var(--text-muted)';
    let diffBg = 'rgba(255, 255, 255, 0.05)';
    if (rec.difficulty === 'EASY') {
      diffBadgeColor = 'var(--primary)';
      diffBg = 'var(--primary-glow)';
    } else if (rec.difficulty === 'MEDIUM') {
      diffBadgeColor = 'var(--accent)';
      diffBg = 'var(--accent-glow)';
    } else if (rec.difficulty === 'HARD') {
      diffBadgeColor = 'var(--warning)';
      diffBg = 'var(--warning-glow)';
    }

    const addGoalBtn = createElement('button', {
      className: `btn ${isGoalAlreadyCreated ? 'btn-secondary' : 'btn-primary'}`,
      style: { padding: '10px 18px', fontSize: '0.85rem' },
      disabled: isGoalAlreadyCreated,
      textContent: isGoalAlreadyCreated ? '✓ Scheduled' : rec.actionText,
      onClick: () => {
        if (isGoalAlreadyCreated) return;
        const type = rec.isHighImpact || rec.category === 'ENERGY' ? 'reduction' : 'habit';
        const targetVal = type === 'reduction' ? 10 : 8; 
        const newGoal = GoalService.createGoal(
          `${rec.title}: ${rec.description}`,
          type,
          targetVal
        );
        store.addGoal(newGoal);
      }
    });

    const priorityHeader = rec.isStagnatingAlert
      ? createElement('div', {
          className: 'rec-badge',
          style: { 
            backgroundColor: 'var(--danger-hover)', 
            color: 'white', 
            marginBottom: '12px',
            alignSelf: 'flex-start',
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 'bold'
          },
          textContent: '🔥 CRITICAL ACTION REQ - BREAK PROGRESS STAGNATION'
        })
      : null;

    const cardEl = createElement('div', { 
      className: 'card rec-card',
      style: rec.isStagnatingAlert ? { borderColor: 'var(--danger)' } : {}
    },
      createElement('div', { className: iconClass, style: { fontSize: '1.75rem' } }, categoryIcon),
      createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
        priorityHeader,
        createElement('h3', { className: 'rec-title', textContent: rec.title }),
        createElement('p', { className: 'rec-desc', textContent: rec.description }),
        createElement('div', { className: 'rec-meta' },
          createElement('span', { 
            className: 'rec-badge', 
            style: { backgroundColor: diffBg, color: diffBadgeColor },
            textContent: `${rec.difficulty} Difficulty`
          }),
          createElement('span', {
            style: { fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)' },
            textContent: `-${rec.impact} kg CO₂e / month`
          }),
          createElement('span', {
            style: { fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' },
            textContent: rec.priorityReason
          })
        )
      ),
      createElement('div', {}, addGoalBtn)
    );

    listWrapper.appendChild(cardEl);
  });

  container.appendChild(listWrapper);
  return container;
}
