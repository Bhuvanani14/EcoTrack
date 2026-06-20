/**
 * Formatting utilities for display values.
 * @module format
 */

/**
 * Formats a number with commas and specified decimal places.
 * @param {number|string} num - The number to format.
 * @param {number} [decimals=1] - Maximum fractional digits.
 * @returns {string} The formatted number string.
 */
export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

/**
 * Converts kg to tonnes for display if >= 1000kg.
 * @param {number} kg - Weight in kilograms.
 * @returns {string} Formatted weight (e.g., "1.5t" or "500 kg").
 */
export function formatTonnes(kg) {
  const tonnes = kg / 1000;
  return tonnes >= 1 ? `${formatNumber(tonnes)}t` : `${formatNumber(kg, 0)} kg`;
}

/**
 * Formats a value as a percentage.
 * @param {number} value - The percentage value.
 * @returns {string} The formatted percentage (e.g., "45%").
 */
export function formatPercentage(value) {
  return `${Math.round(value)}%`;
}

/**
 * Returns a color code based on eco grade.
 * @param {string} grade - The eco grade (e.g., "A+", "F").
 * @returns {string} Hex color code.
 */
export function getEcoGradeColor(grade) {
  const colors = { 'A+': '#00d68f', 'A': '#00d68f', 'B+': '#00b4d8', 'B': '#00b4d8', 'C': '#f5a623', 'D': '#ff9f43', 'F': '#ff6b6b' };
  return colors[grade] || '#8892a4';
}

/**
 * Returns a color code based on impact level.
 * @param {string} impact - 'high', 'medium', or 'low'.
 * @returns {string} Hex color code.
 */
export function getImpactColor(impact) {
  const colors = { high: '#ff6b6b', medium: '#f5a623', low: '#00d68f' };
  return colors[impact] || '#8892a4';
}

/**
 * Returns an emoji icon for a category.
 * @param {string} category - e.g., 'transport', 'food'.
 * @returns {string} Emoji character.
 */
export function getCategoryIcon(category) {
  const icons = { transport: '🚗', food: '🥗', energy: '⚡', lifestyle: '🛍️' };
  return icons[category] || '📊';
}

/**
 * Returns a color code for a specific category.
 * @param {string} category - e.g., 'transport', 'food'.
 * @returns {string} Hex color code.
 */
export function getCategoryColor(category) {
  const colors = { transport: '#00b4d8', food: '#00d68f', energy: '#f5a623', lifestyle: '#a78bfa' };
  return colors[category] || '#8892a4';
}

/**
 * Returns a relative time string (e.g., "5m ago").
 * @param {string|Date} dateStr - Date to parse.
 * @returns {string} Relative time string.
 */
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}
