const { v4: uuidv4 } = require('uuid');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const { twilioJwtConfig } = require('../config/twilio');

const generateVideoToken = (identity, room) => {
  if (!twilioJwtConfig.accountSid || !twilioJwtConfig.apiKey || !twilioJwtConfig.apiSecret) {
    throw new Error('Twilio credentials not configured');
  }

  const token = new AccessToken(
    twilioJwtConfig.accountSid,
    twilioJwtConfig.apiKey,
    twilioJwtConfig.apiSecret,
    { 
      identity,
      ttl: 3600
    }
  );

  const videoGrant = new VideoGrant({ 
    room,
    maxParticipants: 2
  });

  token.addGrant(videoGrant);
  
  return token.toJwt();
};

const generateRoomName = () => `call_${uuidv4()}`;

module.exports = { generateVideoToken, generateRoomName };