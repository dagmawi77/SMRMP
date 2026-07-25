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
const generateArtifactQR = async () => {
  const qrCode = `ART-${uuidv4().split('-')[0].toUpperCase()}`;
  const publicUrl = `${process.env.FRONTEND_URL}/artifact/${qrCode}`;
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
