export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

export function formatCurrency(amount, currency = 'ETB') {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency }).format(amount || 0);
}
