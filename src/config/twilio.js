require('dotenv').config();
const twilio = require('twilio');

const validateConfig = () => {
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_API_KEY',
    'TWILIO_API_SECRET',
    'TWILIO_AUTH_TOKEN'
  ];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`Missing required Twilio config: ${varName}`);
    }
  });
};

validateConfig();

module.exports = {
  twilioClient: twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  ),
  twilioJwtConfig: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiKey: process.env.TWILIO_API_KEY,
    apiSecret: process.env.TWILIO_API_SECRET
  }
};