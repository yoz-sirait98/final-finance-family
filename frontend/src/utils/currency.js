/**
 * Format number as Indonesian Rupiah
 * @param {number} amount
 * @returns {string} e.g., "Rp 1.000.000"
 */
export function formatRupiah(amount) {
  if (amount === null || amount === undefined) return 'Rp 0';
  const num = Number(amount);
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + 'Rp ' + abs;
}

/**
 * Parse formatted rupiah string back to number
 */
export function parseRupiah(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[^0-9,-]/g, '').replace(',', '.'));
}
