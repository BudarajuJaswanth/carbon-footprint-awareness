import { createElement } from '../utils/dom.js';
import { Card } from '../components/Card.js';

/**
 * Renders the educational Insights page view.
 * @returns {HTMLElement} Insights DOM page element
 */
export function renderInsights() {
  const container = createElement('div', { className: 'insights-page' });

  // Page Header
  container.appendChild(
    createElement('div', { className: 'dashboard-header' },
      createElement('h1', { className: 'dashboard-title', textContent: 'Carbon Impact Insights' }),
      createElement('p', { className: 'dashboard-subtitle', textContent: 'Learn the science behind carbon emissions and identify key levers for personal reductions.' })
    )
  );

  // Top Insights List
  const list = createElement('div', { className: 'insights-list' });

  // Insight 1: Why Carbon Emissions Matter
  list.appendChild(
    createElement('div', { className: 'insight-item' },
      createElement('h3', { className: 'insight-title', textContent: '1. Why does tracking carbon footprint matter?' }),
      createElement('p', { className: 'insight-content', textContent: 'Carbon dioxide and other greenhouse gases trap heat in the atmosphere, driving climate change, extreme weather, and rising sea levels. The global average carbon footprint is roughly 4 tons per person annually. However, to avoid exceeding critical 1.5°C heating thresholds, the global target must drop to under 2 tons per person by 2050.' })
    )
  );

  // Insight 2: Transportation Impact Details
  list.appendChild(
    createElement('div', { className: 'insight-item' },
      createElement('h3', { className: 'insight-title', textContent: '2. The Heavy Weight of Transit' }),
      createElement('p', { className: 'insight-content', textContent: 'Burning fossil fuels for transportation is the single largest contributor to individual emissions in developed countries. A petrol-powered passenger car emits roughly 180 grams of CO2 per kilometer. Over a typical 10,000 km year, that exceeds 1.8 metric tons of carbon. In comparison, public buses and trains emit 80% less per passenger, while cycling or walking generates zero operational impact.' })
    )
  );

  // Insight 3: Aviation Emissions
  list.appendChild(
    createElement('div', { className: 'insight-item' },
      createElement('h3', { className: 'insight-title', textContent: '3. Flying: The High-Altitude Spike' }),
      createElement('p', { className: 'insight-content', textContent: 'A single long-haul flight (over 3 hours) can generate 500 kg to 1,000 kg of CO2e per passenger. Because aircraft emit gases directly into the upper atmosphere, their warming impact (radiative forcing) is nearly doubled compared to ground-level emissions. Restricting flights is the fastest individual lever for high-income earners to lower their carbon footprint.' })
    )
  );

  // Insight 4: Energy Grid & Renewable tariffs
  list.appendChild(
    createElement('div', { className: 'insight-item' },
      createElement('h3', { className: 'insight-title', textContent: '4. The Electricity Grid Accords' }),
      createElement('p', { className: 'insight-content', textContent: 'Standard electrical grids burn coal and natural gas, contributing roughly 0.4 kg of CO2 for every single kilowatt-hour (kWh) consumed. A typical household consuming 350 kWh monthly generates 140 kg of CO2 from lighting and appliances. Switching to a verified 100% renewable grid tariff (supported by wind/solar certificates) offsets this impact entirely.' })
    )
  );

  // Insight 5: Diet & Land Use
  list.appendChild(
    createElement('div', { className: 'insight-item' },
      createElement('h3', { className: 'insight-title', textContent: '5. The Food Print on the Plate' }),
      createElement('p', { className: 'insight-content', textContent: 'Meat production—especially beef and lamb—requires massive amounts of land, water, and feed, and generates significant methane (a potent greenhouse gas). Shifting from a high-meat diet (275 kg CO2e/month) to a plant-based vegan diet (125 kg CO2e/month) cuts diet-based emissions by over 50%, saving roughly 1.8 metric tons of CO2 annually.' })
    )
  );

  container.appendChild(
    Card({ title: 'Scientific Carbon Mechanics Summary' }, list)
  );

  // High-Impact Levers Table
  const tbody = createElement('tbody', {});
  const addRow = (action, category, reduction, difficulty) => {
    tbody.appendChild(
      createElement('tr', { style: { borderBottom: '1px solid var(--border-color)' } },
        createElement('td', { style: { padding: '12px 8px', fontWeight: '500' }, textContent: action }),
        createElement('td', { style: { padding: '12px 8px', color: 'var(--text-secondary)' }, textContent: category }),
        createElement('td', { style: { padding: '12px 8px', color: 'var(--primary)', fontWeight: 'bold' }, textContent: reduction }),
        createElement('td', { style: { padding: '12px 8px' } }, 
          createElement('span', { 
            className: 'rec-badge',
            style: { 
              backgroundColor: difficulty === 'Easy' ? 'var(--primary-glow)' : difficulty === 'Medium' ? 'var(--accent-glow)' : 'var(--warning-glow)',
              color: difficulty === 'Easy' ? 'var(--primary)' : difficulty === 'Medium' ? 'var(--accent)' : 'var(--warning)'
            },
            textContent: difficulty
          })
        )
      )
    );
  };

  addRow('Switch to 100% renewable electricity tariff', 'Home Energy', 'Up to 2,000 kg / year', 'Medium');
  addRow('Adopt vegetarian or plant-based diet', 'Lifestyle / Food', 'Up to 1,800 kg / year', 'Medium');
  addRow('Eliminate a single long-haul flight', 'Transportation', '500 - 1,000 kg / flight', 'Hard');
  addRow('Use public transit instead of car (2x/wk)', 'Transportation', '1,000 kg / year', 'Easy');
  addRow('Install home LED lighting bulbs', 'Home Energy', '300 kg / year', 'Easy');

  const comparisonTable = createElement('table', {
    style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', marginTop: '16px' }
  },
    createElement('thead', {},
      createElement('tr', { style: { borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' } },
        createElement('th', { style: { padding: '8px' }, textContent: 'Action Item' }),
        createElement('th', { style: { padding: '8px' }, textContent: 'Category' }),
        createElement('th', { style: { padding: '8px' }, textContent: 'Est. CO₂e Reduction' }),
        createElement('th', { style: { padding: '8px' }, textContent: 'Difficulty' })
      )
    ),
    tbody
  );

  container.appendChild(
    Card({ 
      title: 'High-Impact Reduction Levers', 
      subtitle: 'Ordered by average annual carbon savings potential',
      style: { marginTop: '24px' } 
    }, 
      comparisonTable
    )
  );

  return container;
}
