import { createElement } from '../utils/dom.js';

/**
 * Reusable Card container component.
 * @param {Object} props - Component properties
 * @param {string} [props.title] - Card title text
 * @param {string} [props.subtitle] - Card subtitle text
 * @param {string} [props.className] - Extra css classes
 * @param {HTMLElement|Array<HTMLElement>} [props.actions] - Action buttons in header
 * @param {Array<HTMLElement|string>} children - Child elements or text nodes
 * @returns {HTMLElement} Card DOM element
 */
export function Card(props = {}, ...children) {
  const { title, subtitle, className = '', actions } = props;
  
  const cardChildren = [];
  
  // Header section
  if (title || subtitle || actions) {
    const headerContent = [];
    
    if (title || subtitle) {
      const titles = [];
      if (title) {
        titles.push(createElement('h3', { textContent: title }));
      }
      if (subtitle) {
        titles.push(createElement('p', { className: 'card-subtitle', textContent: subtitle, style: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' } }));
      }
      headerContent.push(createElement('div', { style: { flex: '1' } }, ...titles));
    }
    
    if (actions) {
      const actionList = Array.isArray(actions) ? actions : [actions];
      headerContent.push(createElement('div', { className: 'card-actions', style: { display: 'flex', gap: '8px' } }, ...actionList));
    }
    
    cardChildren.push(createElement('div', { 
      className: 'card-header',
      style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
        marginBottom: '20px'
      } 
    }, ...headerContent));
  }
  
  // Body section
  cardChildren.push(createElement('div', { className: 'card-body' }, ...children));
  
  return createElement('div', {
    className: `card ${className}`.trim()
  }, ...cardChildren);
}
