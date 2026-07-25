const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const QR_OPTIONS = {
  errorCorrectionLevel: 'M',
  type: 'image/png',
  width: 300,
  margin: 2,
  color: { dark: '#1a1a1a', light: '#ffffff' },
};

/** BE artifact QR — ART-XXXXXXXX */
const generateArtifactQR = async (code) => {
  const qrCode = code || `ART-${uuidv4().split('-')[0].toUpperCase()}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const publicUrl = `${frontendUrl}/artifact/${qrCode}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, QR_OPTIONS);
  return { qrCode, qrDataUrl, publicUrl };
};

/** BE-TKT-002 — Ticket QR — TKT-XXXXXXXX */
const generateTicketQR = async () => {
  const qrTicketCode = `TKT-${uuidv4().split('-')[0].toUpperCase()}`;
  const qrDataUrl = await QRCode.toDataURL(qrTicketCode, QR_OPTIONS);
  return { qrTicketCode, qrDataUrl };
};

module.exports = { generateArtifactQR, generateTicketQR };
