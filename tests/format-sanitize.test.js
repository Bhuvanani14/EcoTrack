/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { 
  formatNumber, 
  formatTonnes, 
  formatPercentage, 
  getEcoGradeColor, 
  getImpactColor, 
  getCategoryIcon, 
  getCategoryColor, 
  timeAgo 
} from '../src/utils/format.js';
import { sanitizeString, sanitizeHTML } from '../src/utils/sanitize.js';

describe('Format Utilities', () => {
  it('formatNumber should handle basic numbers and decimals', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1234.56, 1)).toBe('1,234.6');
    expect(formatNumber(null)).toBe('0');
  });

  it('formatTonnes should convert >= 1000kg to tonnes', () => {
    expect(formatTonnes(1500)).toBe('1.5t');
    expect(formatTonnes(900)).toBe('900 kg');
  });

  it('formatPercentage should append %', () => {
    expect(formatPercentage(45.6)).toBe('46%');
  });

  it('getEcoGradeColor should return correct colors', () => {
    expect(getEcoGradeColor('A+')).toBe('#00d68f');
    expect(getEcoGradeColor('F')).toBe('#ff6b6b');
    expect(getEcoGradeColor('Unknown')).toBe('#8892a4');
  });

  it('getCategoryIcon and getCategoryColor should map correctly', () => {
    expect(getCategoryIcon('transport')).toBe('🚗');
    expect(getCategoryColor('transport')).toBe('#00b4d8');
    expect(getCategoryIcon('unknown')).toBe('📊');
  });

  it('timeAgo should return relative time', () => {
    const now = Date.now();
    expect(timeAgo(new Date(now - 10000).toISOString())).toBe('just now');
    expect(timeAgo(new Date(now - 5 * 60000).toISOString())).toBe('5m ago');
    expect(timeAgo(new Date(now - 2 * 3600000).toISOString())).toBe('2h ago');
    expect(timeAgo(new Date(now - 24 * 3600000).toISOString())).toBe('yesterday');
    expect(timeAgo(new Date(now - 48 * 3600000).toISOString())).toBe('2d ago');
  });
});

describe('Sanitize Utilities', () => {
  it('sanitizeString should escape HTML entities', () => {
    const script = '<script>alert("XSS & hax/foo\'bar")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS &amp; hax&#x2F;foo&#x27;bar&quot;)&lt;&#x2F;script&gt;';
    expect(sanitizeString(script)).toBe(expected);
  });

  it('sanitizeString should pass through non-strings', () => {
    expect(sanitizeString(123)).toBe(123);
    expect(sanitizeString(null)).toBe(null);
  });

  it('sanitizeHTML should remove HTML tags entirely via textContent', () => {
    const html = '<div>Hello <b>world</b>!</div>';
    const clean = sanitizeHTML(html);
    expect(clean).toBe('&lt;div&gt;Hello &lt;b&gt;world&lt;/b&gt;!&lt;/div&gt;');
  });
});
