/**
 * Shared Indian marketplace formatters.
 */

export const CATEGORY_NAME_MAP = {
  'plumber': 'Plumber',
  'electrician': 'Electrician',
  'ac-repair': 'AC Repair',
  'painter': 'Painter',
  'carpenter': 'Carpenter',
  'home-cleaning': 'Home Cleaning',
  'appliance-repair': 'Appliance Repair',
  'pest-control': 'Pest Control',
  'water-purifier': 'Water Purifier',
  'cctv-wifi': 'CCTV & Wi-Fi',
};

/**
 * Format category slug to human brand title (e.g. 'ac-repair' -> 'AC Repair')
 */
export function formatCategoryName(slug) {
  if (!slug) return '';
  const normalized = String(slug).toLowerCase().trim();
  if (CATEGORY_NAME_MAP[normalized]) {
    return CATEGORY_NAME_MAP[normalized];
  }
  return normalized
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format number into Indian comma grouping (e.g. 156519 -> '1,56,519')
 */
export function formatIndianCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Format rating with exactly 1 decimal digit (e.g. 5 -> '5.0', 4.8 -> '4.8')
 */
export function formatRating(rating) {
  const num = Number(rating);
  if (isNaN(num)) return '4.8';
  return num.toFixed(1);
}
