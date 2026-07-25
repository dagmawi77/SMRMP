const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateArtifactQR = async () => {
  const qrCode = `ART-${uuidv4().split('-')[0].toUpperCase()}`;
  const publicUrl = `${process.env.FRONTEND_URL}/artifact/${qrCode}`;

  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });

  return { qrCode, qrDataUrl, publicUrl };
};

const generateTicketQR = async () => {
  const qrTicketCode = `TKT-${uuidv4().split('-')[0].toUpperCase()}`;
  const qrDataUrl = await QRCode.toDataURL(qrTicketCode, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
  });

  return { qrTicketCode, qrDataUrl };
};

module.exports = { generateArtifactQR, generateTicketQR };
