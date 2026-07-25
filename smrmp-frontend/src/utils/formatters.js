export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

export function formatCurrency(amount, currency = 'ETB') {
  try {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toLocaleString()} ${currency}`;
  }
}
