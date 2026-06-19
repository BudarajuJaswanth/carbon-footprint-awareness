import { createElement } from '../utils/dom.js';
import { formatEmissions } from '../utils/formatters.js';

/**
 * Creates an accessible SVG Donut Chart representing emissions category breakdown.
 * @param {Object} emissions - { transportation, energy, lifestyle, total }
 * @returns {HTMLElement} Chart DOM element
 */
export function createDonutChart(emissions) {
  const { transportation = 0, energy = 0, lifestyle = 0, total = 0 } = emissions;
  
  if (total === 0) {
    return createElement('div', { 
      style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' } 
    }, 'No emissions data to display. Complete a calculation to see your breakdown.');
  }

  // Calculate percentages
  const pctTrans = (transportation / total) * 100;
  const pctEnergy = (energy / total) * 100;
  const pctLife = (lifestyle / total) * 100;

  // SVG parameters
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate offsets (drawing segment order: transportation -> energy -> lifestyle)
  const offsetTrans = 0;
  const offsetEnergy = circumference * (pctTrans / 100);
  const offsetLife = circumference * ((pctTrans + pctEnergy) / 100);

  // SVG Elements
  const svg = createElement('svg', {
    viewBox: `0 0 ${size} ${size}`,
    width: '100%',
    height: size,
    role: 'img',
    'aria-label': `Emissions category breakdown: Transportation ${pctTrans.toFixed(0)}%, Energy ${pctEnergy.toFixed(0)}%, Lifestyle ${pctLife.toFixed(0)}%`
  });

  // Unique title for screen readers
  const titleId = `donut-title-${Date.now()}`;
  svg.appendChild(createElement('title', { id: titleId, textContent: 'Emissions Category Breakdown Chart' }));
  svg.setAttribute('aria-labelledby', titleId);

  // Background track
  svg.appendChild(createElement('circle', {
    cx: center,
    cy: center,
    r: radius,
    fill: 'transparent',
    stroke: 'rgba(255, 255, 255, 0.03)',
    'stroke-width': strokeWidth
  }));

  // Helper to add animated segment
  const addSegment = (pct, offset, color, name) => {
    if (pct <= 0) return;
    const dashArray = `${circumference * (pct / 100)} ${circumference}`;
    const dashOffset = circumference - offset;

    const segment = createElement('circle', {
      cx: center,
      cy: center,
      r: radius,
      fill: 'transparent',
      stroke: color,
      'stroke-width': strokeWidth,
      'stroke-dasharray': dashArray,
      'stroke-dashoffset': dashOffset,
      transform: `rotate(-90 ${center} ${center})`,
      'stroke-linecap': 'round',
      style: {
        transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s',
        cursor: 'pointer'
      }
    });

    // Simple tooltip hover
    segment.addEventListener('mouseenter', () => {
      segment.setAttribute('stroke-width', String(strokeWidth + 4));
    });
    segment.addEventListener('mouseleave', () => {
      segment.setAttribute('stroke-width', String(strokeWidth));
    });

    svg.appendChild(segment);
  };

  // Render segments using theme tokens
  // Transportation (Cyan)
  addSegment(pctTrans, offsetTrans, '#06b6d4', 'Transportation');
  // Energy (Warning Amber)
  addSegment(pctEnergy, offsetEnergy, '#f59e0b', 'Energy');
  // Lifestyle (Emerald Green)
  addSegment(pctLife, offsetLife, '#10b981', 'Lifestyle');

  // Text details in center of donut
  const textGroup = createElement('g', {
    style: { textAnchor: 'middle', dominantBaseline: 'central' }
  });
  textGroup.appendChild(createElement('text', {
    x: center,
    y: center - 10,
    fill: 'var(--text-muted)',
    style: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
    textContent: 'Total Monthly'
  }));
  textGroup.appendChild(createElement('text', {
    x: center,
    y: center + 12,
    fill: 'var(--text-primary)',
    style: { fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-heading)' },
    textContent: formatEmissions(total, 1).replace(' CO₂e', '')
  }));
  textGroup.appendChild(createElement('text', {
    x: center,
    y: center + 28,
    fill: 'var(--text-secondary)',
    style: { fontSize: '10px', fontWeight: '500' },
    textContent: 'CO₂e'
  }));

  svg.appendChild(textGroup);

  // Assemble legend side-by-side
  const legend = createElement('div', { className: 'chart-legend' },
    createElement('div', { className: 'legend-item' },
      createElement('div', { className: 'legend-color', style: { backgroundColor: '#06b6d4' } }),
      createElement('span', { textContent: `Transportation: ${pctTrans.toFixed(0)}%` })
    ),
    createElement('div', { className: 'legend-item' },
      createElement('div', { className: 'legend-color', style: { backgroundColor: '#f59e0b' } }),
      createElement('span', { textContent: `Energy: ${pctEnergy.toFixed(0)}%` })
    ),
    createElement('div', { className: 'legend-item' },
      createElement('div', { className: 'legend-color', style: { backgroundColor: '#10b981' } }),
      createElement('span', { textContent: `Lifestyle: ${pctLife.toFixed(0)}%` })
    )
  );

  return createElement('div', { 
    className: 'chart-container-wrapper',
    style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }
  }, svg, legend);
}

/**
 * Creates an SVG Gauge Chart comparing monthly emissions vs average footprint.
 * @param {number} value - User footprint in kg
 * @param {number} [average=1300] - Baseline comparison average (e.g. 1300 kg / month national average)
 * @returns {HTMLElement} Gauge DOM element
 */
export function createGaugeChart(value, average = 1300) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  // Semi-circle path settings
  const circumference = Math.PI * radius; // 180 deg
  const pct = Math.min(100, (value / average) * 100);
  const dashOffset = circumference - (circumference * pct) / 100;

  const color = value <= average * 0.7 
    ? '#10b981' // Green (Good)
    : value <= average 
      ? '#06b6d4' // Cyan (Average) 
      : '#ef4444'; // Red (High)

  const svg = createElement('svg', {
    viewBox: `0 0 ${size} ${center + 20}`,
    width: '100%',
    height: center + 20,
    role: 'img',
    'aria-label': `Carbon footprint comparison: ${value.toFixed(0)} kg CO2e, representing ${pct.toFixed(0)}% of the national monthly average of ${average} kg.`
  });

  const titleId = `gauge-title-${Date.now()}`;
  svg.appendChild(createElement('title', { id: titleId, textContent: 'Emissions Comparison Gauge' }));
  svg.setAttribute('aria-labelledby', titleId);

  // Base arc track
  svg.appendChild(createElement('path', {
    d: `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`,
    fill: 'transparent',
    stroke: 'rgba(255, 255, 255, 0.03)',
    'stroke-width': strokeWidth,
    'stroke-linecap': 'round'
  }));

  // Colored progress arc
  svg.appendChild(createElement('path', {
    d: `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`,
    fill: 'transparent',
    stroke: color,
    'stroke-width': strokeWidth,
    'stroke-dasharray': circumference,
    'stroke-dashoffset': dashOffset,
    'stroke-linecap': 'round',
    style: {
      transition: 'stroke-dashoffset 1s ease-out',
      filter: `drop-shadow(0 2px 8px ${color}33)`
    }
  }));

  // Text labels
  const textGroup = createElement('g', {
    style: { textAnchor: 'middle' }
  });
  textGroup.appendChild(createElement('text', {
    x: center,
    y: center - 16,
    fill: 'var(--text-muted)',
    style: { fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
    textContent: 'National Avg Comparison'
  }));
  textGroup.appendChild(createElement('text', {
    x: center,
    y: center + 5,
    fill: 'var(--text-primary)',
    style: { fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-heading)' },
    textContent: `${pct.toFixed(0)}%`
  }));
  
  // High/Low labels at ends
  textGroup.appendChild(createElement('text', {
    x: center - radius,
    y: center + 18,
    fill: 'var(--text-muted)',
    style: { fontSize: '8px' },
    textContent: '0'
  }));
  textGroup.appendChild(createElement('text', {
    x: center + radius,
    y: center + 18,
    fill: 'var(--text-muted)',
    style: { fontSize: '8px' },
    textContent: `${average} kg`
  }));

  svg.appendChild(textGroup);

  return createElement('div', {
    className: 'chart-container-wrapper',
    style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }
  }, svg);
}

/**
 * Creates an SVG Bar Chart showing historical emissions trend.
 * @param {Array<Object>} footprints - Historical calculations
 * @returns {HTMLElement} Bar Chart DOM element
 */
export function createTrendChart(footprints) {
  if (!footprints || footprints.length === 0) {
    return createElement('div', {
      style: { textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }
    }, 'Add calculations over time to visualize your emission trends.');
  }

  // Cap history at last 6 entries for display clarity
  const data = footprints.slice(-6);

  const width = 500;
  const height = 240;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value calculation for scale bounds
  const maxVal = Math.max(...data.map(d => d.emissions.total), 100);
  // Round max value to nearest 500 for clean axis grids
  const gridMax = Math.ceil(maxVal / 500) * 500;

  const svg = createElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width: '100%',
    height,
    role: 'img',
    'aria-label': 'Emissions trend graph showing footprint changes over time.'
  });

  const titleId = `trend-title-${Date.now()}`;
  svg.appendChild(createElement('title', { id: titleId, textContent: 'Footprint Trend Chart' }));
  svg.setAttribute('aria-labelledby', titleId);

  // Draw Grid Lines & Y-axis labels
  const gridLinesCount = 4;
  for (let i = 0; i <= gridLinesCount; i++) {
    const val = (gridMax / gridLinesCount) * i;
    const y = height - paddingBottom - (chartHeight * (i / gridLinesCount));

    // Grid line
    svg.appendChild(createElement('line', {
      x1: paddingX,
      y1: y,
      x2: width - paddingX,
      y2: y,
      stroke: 'var(--border-color)',
      'stroke-width': 1,
      'stroke-dasharray': i === 0 ? 'none' : '4 4'
    }));

    // Axis label
    svg.appendChild(createElement('text', {
      x: paddingX - 8,
      y: y + 3,
      fill: 'var(--text-muted)',
      style: { fontSize: '8px', textAnchor: 'end' },
      textContent: val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${val.toFixed(0)}`
    }));
  }

  // Draw Bar elements
  const barCount = data.length;
  const gap = 20;
  const barWidth = (chartWidth - gap * (barCount - 1)) / barCount;

  data.forEach((fp, index) => {
    const val = fp.emissions.total;
    const barHeight = (val / gridMax) * chartHeight;
    const x = paddingX + index * (barWidth + gap);
    const y = height - paddingBottom - barHeight;

    // Create unique vertical gradient for each bar
    const gradId = `bar-grad-${index}-${Date.now()}`;
    const defs = createElement('defs');
    const grad = createElement('linearGradient', { id: gradId, x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    grad.appendChild(createElement('stop', { offset: '0%', 'stop-color': 'var(--primary)' }));
    grad.appendChild(createElement('stop', { offset: '100%', 'stop-color': 'var(--accent)' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Bar rectangle
    const rect = createElement('rect', {
      x,
      y,
      width: barWidth,
      height: Math.max(2, barHeight), // min height 2px
      fill: `url(#${gradId})`,
      rx: 4,
      style: {
        transition: 'height 0.8s ease-out, y 0.8s ease-out, opacity 0.3s',
        cursor: 'pointer',
        opacity: 0.95
      }
    });

    // Hover tooltip/focus logic
    const tooltipText = createElement('text', {
      x: x + barWidth / 2,
      y: y - 6,
      fill: 'var(--text-primary)',
      style: { fontSize: '8px', fontWeight: 'bold', textAnchor: 'middle', display: 'none' },
      textContent: formatEmissions(val, 1).replace(' CO₂e', '')
    });
    
    rect.addEventListener('mouseenter', () => {
      rect.style.opacity = '1';
      tooltipText.style.display = 'block';
    });
    rect.addEventListener('mouseleave', () => {
      rect.style.opacity = '0.95';
      tooltipText.style.display = 'none';
    });

    svg.appendChild(rect);
    svg.appendChild(tooltipText);

    // X-axis label (date formatted)
    const dateObj = new Date(fp.date);
    const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    svg.appendChild(createElement('text', {
      x: x + barWidth / 2,
      y: height - paddingBottom + 16,
      fill: 'var(--text-secondary)',
      style: { fontSize: '8px', textAnchor: 'middle' },
      textContent: dateLabel
    }));
  });

  return createElement('div', {
    className: 'chart-container-wrapper',
    style: { width: '100%', maxWidth: '600px', margin: '0 auto' }
  }, svg);
}
