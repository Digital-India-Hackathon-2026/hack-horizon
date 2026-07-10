const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

/**
 * Generate a unique token code and QR data URL for a booking
 */
async function generateToken(bookingId, centerName, slotDate, slotTime) {
  const tokenCode = `AQ-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  
  const qrPayload = JSON.stringify({
    token: tokenCode,
    booking: bookingId,
    center: centerName,
    date: slotDate,
    time: slotTime,
    issued: new Date().toISOString()
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 300,
    margin: 2,
    color: { dark: '#2D6A4F', light: '#FFFFFF' },
    errorCorrectionLevel: 'H'
  });

  return { tokenCode, qrData: qrDataUrl, qrPayload };
}

module.exports = { generateToken };
