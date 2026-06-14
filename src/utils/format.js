/**
 * Formatting utilities for display values.
 */
export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

export function formatTonnes(kg) {
  const tonnes = kg / 1000;
  return tonnes >= 1 ? `${formatNumber(tonnes)}t` : `${formatNumber(kg, 0)} kg`;
}

export function formatPercentage(value) {
  return `${Math.round(value)}%`;
}

export function getEcoGradeColor(grade) {
  const colors = { 'A+': '#00d68f', 'A': '#00d68f', 'B+': '#00b4d8', 'B': '#00b4d8', 'C': '#f5a623', 'D': '#ff9f43', 'F': '#ff6b6b' };
  return colors[grade] || '#8892a4';
}

export function getImpactColor(impact) {
  const colors = { high: '#ff6b6b', medium: '#f5a623', low: '#00d68f' };
  return colors[impact] || '#8892a4';
}

export function getCategoryIcon(category) {
  const icons = { transport: '🚗', food: '🥗', energy: '⚡', lifestyle: '🛍️' };
  return icons[category] || '📊';
}

export function getCategoryColor(category) {
  const colors = { transport: '#00b4d8', food: '#00d68f', energy: '#f5a623', lifestyle: '#a78bfa' };
  return colors[category] || '#8892a4';
}

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
