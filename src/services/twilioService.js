const { v4: uuidv4 } = require('uuid');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const { twilioJwtConfig } = require('../config/twilio');

const generateVideoToken = (identity, room) => {
  const token = new AccessToken(
    twilioJwtConfig.accountSid,
    twilioJwtConfig.apiKey,
    twilioJwtConfig.apiSecret,
    { identity, ttl: 14400 } // 4 hour expiration
  );

  const videoGrant = new VideoGrant({
    room,
    maxParticipants: 2
  });

  token.addGrant(videoGrant);
  return token.toJwt();
};

const generateRoomName = () => `vc-${uuidv4()}`;

module.exports = {
  generateVideoToken,
  generateRoomName
};