const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSms = async (mobile, otp) => {
  const useTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
  if (useTwilio) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your AgriQueue OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile}`
      });
      console.log(`SMS sent to ${mobile}: OTP ${otp}`);
    } catch (err) {
      console.error('Twilio SMS failed:', err.message);
      console.log(`[Demo] OTP for ${mobile}: ${otp}`);
    }
  } else {
    console.log(`[Demo Mode] OTP for ${mobile}: ${otp}`);
    console.log(`[Demo Mode] Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env to send real SMS.`);
  }
};

module.exports = { generateOtp, sendSms };