/**
 * BE-TKT-003 — Payment simulation controller
 * MVP: Telebirr sandbox only (PRD Section 4.2).
 */
const telebirrService = require('../services/telebirrService');

/**
 * Simulate payment for ticket purchase.
 * @param {{ amount: number, description?: string, reference?: string, payment_method?: string }} payload
 */
const simulatePayment = async (payload) => {
  const amount = Number(payload?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('Invalid payment amount');
    error.statusCode = 400;
    throw error;
  }

  const method = payload.payment_method || 'telebirr';

  // MVP: all methods use the same sandbox simulator (Telebirr PRD path)
  const result = await telebirrService.initiatePayment({
    amount,
    description: payload.description || 'Museum Ticket',
    reference: payload.reference || `PAY-${Date.now()}`,
  });

  return {
    ...result,
    payment_method: method,
    sandbox_label: 'DEMO — No real payment processed',
  };
};

/**
 * Shape payment block exactly as Section 4 purchase response requires.
 */
const toPaymentSimulationResponse = (payment) => ({
  status: payment.status || 'completed',
  reference: payment.reference_number,
  sandbox_mode: true,
  sandbox_label: payment.sandbox_label || 'DEMO — No real payment processed',
});

module.exports = {
  simulatePayment,
  toPaymentSimulationResponse,
};
