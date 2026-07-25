export function formatDate(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString();
  } catch {
    return String(value);
  }
}

export function formatCurrency(amount, currency = 'ETB') {
  try {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toLocaleString()} ${currency}`;
  }
}
