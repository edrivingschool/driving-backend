require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;

// For regular Twilio client operations
const twilioClient = twilio(accountSid, authToken);

// For JWT token generation
const twilioJwtConfig = {
  accountSid,
  apiKey,
  apiSecret
};

module.exports = {
  twilioClient,
  twilioJwtConfig
};