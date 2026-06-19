/**
 * Formatters utility for number and data displaying
 */

/**
 * Formats carbon emissions to a human-readable string.
 * Converts to tons if >= 1000 kg.
 * @param {number} kgValue - Carbon emissions in kilograms
 * @param {number} decimals - Precision decimals
 * @returns {string} Formatted string
 */
export function formatEmissions(kgValue, decimals = 2) {
  if (kgValue === undefined || kgValue === null || isNaN(kgValue)) {
    return '0 kg CO₂e';
  }
  if (kgValue >= 1000) {
    const tons = kgValue / 1000;
    return `${tons.toFixed(decimals)} tons CO₂e`;
  }
  return `${kgValue.toFixed(0)} kg CO₂e`;
}

/**
 * Formats a percentage value.
 * @param {number} value - Decimal value (e.g. 0.15) or percentage (15)
 * @param {boolean} isDecimal - If true, treats value as decimal (0-1)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, isDecimal = false) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  const pct = isDecimal ? value * 100 : value;
  return `${pct.toFixed(0)}%`;
}

/**
 * Formats standard date string.
 * @param {string|Date} dateVal - Date to format
 * @returns {string} Formatted date (e.g., Jun 11, 2026)
 */
export function formatDate(dateVal) {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats distance (km).
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance
 */
export function formatDistance(km) {
  if (km === undefined || km === null || isNaN(km)) return '0 km';
  return `${km.toLocaleString()} km`;
}
