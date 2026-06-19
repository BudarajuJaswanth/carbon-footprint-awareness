import { createElement, clearContainer } from '../utils/dom.js';
import { store } from '../services/Store.js';
import { formatEmissions, formatPercentage } from '../utils/formatters.js';
import { createDonutChart, createGaugeChart, createTrendChart } from '../components/Chart.js';
import { Card } from '../components/Card.js';

/**
 * Renders the Dashboard View.
 * @returns {HTMLElement} Dashboard page DOM element
 */
export function renderDashboard() {
  const state = store.getState();
  const footprints = state.footprints;

  const container = createElement('div', { className: 'dashboard-container' });

  // Title section
  container.appendChild(
    createElement('div', { className: 'dashboard-header' },
      createElement('h1', { className: 'dashboard-title', textContent: 'Sustainability Dashboard' }),
      createElement('p', { className: 'dashboard-subtitle', textContent: 'Track, analyze, and lower your carbon emissions.' })
    )
  );

  // If no calculations completed yet
  if (footprints.length === 0) {
    container.appendChild(
      Card({ title: 'Welcome to EcoTrace!' },
        createElement('div', { style: { textAlign: 'center', padding: '40px 0' } },
          createElement('p', { 
            style: { marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '1.1rem' }, 
            textContent: 'To start tracking your carbon footprint and receive personalized reduction recommendations, please complete your first calculation.'
          }),
          createElement('a', {
            href: '#/calculator',
            className: 'btn btn-primary',
            textContent: 'Calculate Footprint Now'
          })
        )
      )
    );
    return container;
  }

  // Retrieve metrics
  const latestEntry = footprints[footprints.length - 1];
  const totalEmissions = latestEntry.emissions.total;
  const transEmissions = latestEntry.emissions.transportation;
  const energyEmissions = latestEntry.emissions.energy;
  const lifestyleEmissions = latestEntry.emissions.lifestyle;

  // Comparison metrics (latest vs previous)
  let percentageDiff = 0;
  let isReduction = false;
  let comparisonText = 'First calculation baseline established.';

  if (footprints.length > 1) {
    const prevEntry = footprints[footprints.length - 2];
    const prevTotal = prevEntry.emissions.total;
    if (prevTotal > 0) {
      percentageDiff = ((prevTotal - totalEmissions) / prevTotal) * 100;
      isReduction = percentageDiff >= 0;
      comparisonText = isReduction
        ? `Reduced by ${Math.abs(percentageDiff).toFixed(1)}% compared to your last calculation.`
        : `Increased by ${Math.abs(percentageDiff).toFixed(1)}% compared to your last calculation.`;
    }
  }

  // Metric cards row
  const metricsGrid = createElement('div', { className: 'metrics-row' });

  // Total footprint card (Primary Highlight)
  metricsGrid.appendChild(
    Card({ className: 'metric-primary-card' },
      createElement('div', {},
        createElement('span', { 
          style: { textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', color: 'var(--text-secondary)' }, 
          textContent: 'Current Footprint' 
        }),
        createElement('div', { className: 'metric-value-large', textContent: formatEmissions(totalEmissions, 1).replace(' CO₂e', '') },
          createElement('span', { className: 'metric-unit', textContent: ' kg CO₂e/mo' })
        ),
        createElement('div', { 
          className: `metric-badge ${isReduction ? 'metric-badge-success' : percentageDiff === 0 ? 'metric-badge-success' : 'metric-badge-warning'}` 
        }, 
          createElement('span', { textContent: comparisonText })
        )
      ),
      createElement('div', { style: { fontSize: '3rem' } }, '🌎')
    )
  );

  // National Average Comparison Gauge Card
  // 1300 kg/month is average US carbon footprint (roughly 16 tons/year).
  metricsGrid.appendChild(
    Card({ title: 'Rating vs National Avg' },
      createGaugeChart(totalEmissions, 1300)
    )
  );

  container.appendChild(metricsGrid);

  // Charts Grid (Breakdown & History)
  const chartsGrid = createElement('div', { className: 'grid-2', style: { marginBottom: '24px' } });

  // 1. Category Breakdown Donut Chart
  chartsGrid.appendChild(
    Card({ title: 'Emission Breakdown', subtitle: 'Proportion of carbon by category source' },
      createDonutChart(latestEntry.emissions)
    )
  );

  // 2. Historical Trend Bar Chart
  chartsGrid.appendChild(
    Card({ title: 'Emissions History', subtitle: 'Your last 6 carbon footprint calculation entries' },
      createTrendChart(footprints)
    )
  );

  container.appendChild(chartsGrid);

  // Impact Explainer Alert Card
  const highestEmissionSource = Math.max(transEmissions, energyEmissions, lifestyleEmissions);
  let highestCategory = '';
  let highestImpactRec = '';
  if (highestEmissionSource === transEmissions) {
    highestCategory = 'Transportation';
    highestImpactRec = 'Consolidating car commutes with public transit or reducing travel distance will yield your highest carbon reduction.';
  } else if (highestEmissionSource === energyEmissions) {
    highestCategory = 'Energy Consumption';
    highestImpactRec = 'Switching to LED lights and changing to a 100% renewable electricity supplier will cut your utility emissions directly.';
  } else {
    highestCategory = 'Lifestyle Choice';
    highestImpactRec = 'Moving towards a vegetarian diet or adopting reusable and secondhand shopping habits will curb your agricultural and landfill impacts.';
  }

  container.appendChild(
    Card({ 
      title: 'Active Footprint Insight',
      style: { 
        borderLeft: '4px solid var(--warning)',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(30, 41, 59, 0.7))',
        marginBottom: '24px'
      } 
    },
      createElement('p', { 
        style: { fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' },
        textContent: `Your highest emission source is currently: ${highestCategory}`
      }),
      createElement('p', { 
        style: { color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px' },
        textContent: highestImpactRec
      }),
      createElement('a', {
        href: '#/recommendations',
        className: 'btn btn-accent',
        style: { fontSize: '0.85rem', padding: '8px 16px' },
        textContent: 'Explore Action Plan'
      })
    )
  );

  // Danger Zone Data Reset Card
  container.appendChild(
    Card({ title: 'System Controls', className: 'card-danger-zone' },
      createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' } },
        createElement('div', {},
          createElement('h4', { textContent: 'Reset Application Data', style: { color: 'var(--danger)' } }),
          createElement('p', { 
            style: { fontSize: '0.85rem', color: 'var(--text-secondary)' }, 
            textContent: 'Warning: This will permanently delete all footprint history, customized goals, and achievement milestones.' 
          })
        ),
        createElement('button', {
          className: 'btn btn-danger',
          textContent: 'Reset All Data',
          onClick: () => {
            if (confirm('Are you absolutely sure you want to delete all historical logs and goals? This action cannot be undone.')) {
              store.resetAllData();
              window.location.hash = '#/calculator';
              // Note: Toast alert will be triggered from app bootstrapping subscription
            }
          }
        })
      )
    )
  );

  return container;
}
