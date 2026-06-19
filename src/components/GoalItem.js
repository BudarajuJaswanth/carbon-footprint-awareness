import { createElement } from '../utils/dom.js';
import { formatPercentage } from '../utils/formatters.js';

/**
 * Component to render a Sustainability Goal Card.
 * @param {Object} props - Properties
 * @param {Object} props.goal - Goal schema object
 * @param {Function} props.onIncrement - Callback for habit incrementing
 * @param {Function} props.onDelete - Callback for goal deletion
 * @returns {HTMLElement} Goal Card DOM element
 */
export function GoalItem(props) {
  const { goal, onIncrement, onDelete } = props;
  const { id, description, type, targetValue, currentValue, isCompleted } = goal;

  const pct = Math.min(100, Math.max(0, (currentValue / targetValue) * 100));

  // Goal actions container
  const actionContainer = [];

  if (type === 'habit' && !isCompleted && onIncrement) {
    actionContainer.push(createElement('button', {
      className: 'btn btn-secondary',
      style: { padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' },
      textContent: '+ Log Habit',
      'aria-label': `Increment progress for habit: ${description}`,
      onClick: () => onIncrement(id, currentValue + 1)
    }));
  }

  if (onDelete) {
    actionContainer.push(createElement('button', {
      className: 'btn btn-danger',
      style: { padding: '6px 10px', display: 'flex', alignItems: 'center' },
      'aria-label': `Delete goal: ${description}`,
      onClick: () => onDelete(id)
    }, 
      createElement('svg', {
        width: '14',
        height: '14',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2'
      }, 
        createElement('polyline', { points: '3 6 5 6 21 6' }),
        createElement('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
      )
    ));
  }

  // Value display description
  let progressTextVal = '';
  if (type === 'reduction') {
    progressTextVal = `${currentValue.toFixed(1)}% of ${targetValue}% reduction`;
  } else {
    progressTextVal = `${currentValue} of ${targetValue} completed`;
  }

  const progressBar = createElement('div', { className: 'progress-bar-container', style: { marginTop: '8px' } },
    createElement('div', { 
      className: 'progress-bar-fill', 
      style: { 
        width: `${pct}%`,
        background: isCompleted ? 'var(--primary)' : 'linear-gradient(90deg, var(--accent), var(--primary))'
      } 
    })
  );

  return createElement('div', {
    className: `card ${isCompleted ? 'goal-completed-card' : ''}`.trim(),
    style: isCompleted ? {
      borderColor: 'var(--primary)',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(30, 41, 59, 0.7))',
      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
    } : {}
  },
    createElement('div', { className: 'goal-header' },
      createElement('div', {},
        createElement('div', { 
          style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } 
        },
          createElement('span', { 
            className: 'rec-badge',
            style: { 
              backgroundColor: type === 'reduction' ? 'var(--accent-glow)' : 'var(--warning-glow)',
              color: type === 'reduction' ? 'var(--accent)' : 'var(--warning)'
            },
            textContent: type === 'reduction' ? 'Carbon reduction' : 'Sustainable Habit'
          }),
          isCompleted ? createElement('span', {
            className: 'rec-badge',
            style: { backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' },
            textContent: '✓ Completed'
          }) : null
        ),
        createElement('h4', { 
          className: 'goal-title', 
          style: { textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)' },
          textContent: description 
        })
      ),
      createElement('div', { style: { display: 'flex', alignItems: 'center' } }, ...actionContainer)
    ),
    progressBar,
    createElement('div', { className: 'goal-progress-text' },
      createElement('span', { textContent: progressTextVal }),
      createElement('span', { textContent: `${pct.toFixed(0)}%` })
    )
  );
}
