/**
 * Shared human-readable reference/number generators for Module 8
 * (memberships, group bookings, invoices) — {PREFIX}-{YYYY}-{5 digits}.
 */
const generateYearlyReference = (prefix) => {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `${prefix}-${year}-${suffix}`;
};

const generateMembershipNumber = () => generateYearlyReference('ADWA');
const generateBookingReference = () => generateYearlyReference('GRP');
const generateInvoiceNumber = () => generateYearlyReference('INV');

module.exports = {
  generateYearlyReference,
  generateMembershipNumber,
  generateBookingReference,
  generateInvoiceNumber,
};
