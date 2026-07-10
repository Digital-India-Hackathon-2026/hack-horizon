const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prepareGet, prepareAll, prepareRun } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { generateOtp, sendSms } = require('../utils/smsService');

const otpStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (val.expiresAt < now) otpStore.delete(key);
  }
}, 60000);

const authController = {
  async login(req, res) {
    const { mobile, farmer_id, aadhaar } = req.body;

    let farmer = null;
    if (mobile) {
      farmer = await prepareGet('SELECT * FROM farmers WHERE mobile = ?', [mobile]);
    } else if (farmer_id) {
      farmer = await prepareGet('SELECT * FROM farmers WHERE farmer_id = ?', [farmer_id]);
    } else if (aadhaar) {
      const all = await prepareAll('SELECT * FROM farmers WHERE aadhaar_hash IS NOT NULL');
      farmer = all.find(f => bcrypt.compareSync(aadhaar, f.aadhaar_hash));
    }

    if (!farmer) {
      if (mobile) {
        const farmerId = `FRM${Date.now().toString(36).toUpperCase()}`;
        const result = await prepareRun(
          'INSERT INTO farmers (name, mobile, farmer_id) VALUES (?, ?, ?)',
          ['New Farmer', mobile, farmerId]
        );
        farmer = await prepareGet('SELECT * FROM farmers WHERE id = ?', [result.lastInsertRowid]);
      } else {
        return res.status(404).json({ error: 'Farmer not found. Please register with mobile number.' });
      }
    }

    const otp = generateOtp();
    otpStore.set(farmer.mobile, { otp, farmerId: farmer.id, expiresAt: Date.now() + 300000 });

    await sendSms(farmer.mobile, otp);

    res.json({
      success: true,
      message: `OTP sent to ${farmer.mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')}`,
      demo_otp: otp,
      farmer_name: farmer.name
    });
  },

  async verifyOtp(req, res) {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile and OTP are required.' });
    }

    const stored = otpStore.get(mobile);
    if (!stored) {
      return res.status(401).json({ error: 'OTP expired or not requested. Please request a new OTP.' });
    }

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(mobile);
      return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (otp !== stored.otp) {
      return res.status(401).json({ error: 'Invalid OTP. Please try again.' });
    }

    const farmer = await prepareGet('SELECT * FROM farmers WHERE mobile = ?', [mobile]);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found.' });
    }

    const token = jwt.sign(
      { id: farmer.id, mobile: farmer.mobile, name: farmer.name, farmer_id: farmer.farmer_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    otpStore.delete(mobile);

    await prepareRun(
      'INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, details) VALUES (?, ?, ?, ?, ?)',
      ['login', 'farmer', farmer.id, farmer.id, JSON.stringify({ method: 'otp' })]
    );

    res.json({
      success: true,
      token,
      farmer: {
        id: farmer.id,
        name: farmer.name,
        mobile: farmer.mobile,
        farmer_id: farmer.farmer_id,
        village: farmer.village,
        district: farmer.district,
        land_size: farmer.land_size,
        crop_types: typeof farmer.crop_types === 'string' ? JSON.parse(farmer.crop_types || '[]') : (farmer.crop_types || []),
        preferred_language: farmer.preferred_language
      }
    });
  }
};

module.exports = authController;
