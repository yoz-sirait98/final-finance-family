/**
 * Format date as DD-MM-YYYY
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Get today as YYYY-MM-DD (for input[type=date])
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get month name from number
 */
export function monthName(num) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[(num - 1) % 12] || '';
}
