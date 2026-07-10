const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { networkInterfaces } = require('os');

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

/**
 * Generate a unique token code and QR data URL for a booking
 */
async function generateToken(bookingId, centerName, slotDate, slotTime) {
  const tokenCode = `AQ-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  
  // Create a URL pointing to the digital receipt page on the frontend
  // Automatically use the correct local IP for mobile scanning
  const localIp = getLocalIp();
  const baseUrl = process.env.CLIENT_URL || `http://${localIp}:5173`;
  const qrPayload = `${baseUrl}/receipt/${bookingId}`;

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 300,
    margin: 2,
    color: { dark: '#2D6A4F', light: '#FFFFFF' },
    errorCorrectionLevel: 'H'
  });

  return { tokenCode, qrData: qrDataUrl, qrPayload };
}

module.exports = { generateToken };
