/**
 * Telebirr sandbox payment service — PRD Section 4.2
 * MVP: always simulate. Real Telebirr H5 Pay is out of scope.
 */
const crypto = require('crypto');

class TelebirrService {
  constructor() {
    this.appId = process.env.TELEBIRR_APP_ID;
    this.appKey = process.env.TELEBIRR_APP_KEY;
    this.shortCode = process.env.TELEBIRR_SHORT_CODE;
    this.publicKey = process.env.TELEBIRR_PUBLIC_KEY;
    this.baseUrl = process.env.TELEBIRR_BASE_URL;
    this.isSandbox = true; // MVP always sandbox
  }

  async initiatePayment(payload) {
    // PRD: simulate ~2s processing delay (skip in tests)
    if (process.env.NODE_ENV !== 'test') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return {
      success: true,
      sandbox_mode: true,
      reference_number: `DEMO-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`,
      status: 'completed',
      amount: payload.amount,
      label: 'DEMO MODE — No real payment processed',
      timestamp: new Date().toISOString(),
    };
  }

  /** Kept for Phase-2 real Telebirr wiring (not used in MVP). */
  _buildPayload(payload) {
    return {
      appid: this.appId,
      merch_code: this.shortCode,
      nonce_str: crypto.randomBytes(16).toString('hex'),
      notify_url: `${process.env.API_BASE_URL}/webhooks/telebirr`,
      out_trade_no: payload.reference,
      subject: payload.description,
      timeout_express: '120m',
      timestamp: Math.floor(Date.now() / 1000).toString(),
      total_amount: String(payload.amount),
      trade_type: 'Payment',
      payee_note: 'Museum Ticket',
    };
  }
}

module.exports = new TelebirrService();
