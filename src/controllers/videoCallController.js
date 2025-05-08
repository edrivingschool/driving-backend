const twilioClient = require('../config/twilio');
const { generateVideoToken } = require('../services/twilioService');

exports.initiateCall = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const roomName = `call_${Date.now()}_${req.user.userId}_${receiverId}`;
    
    const token = generateVideoToken(req.user.userId, roomName);
    
    // Notify receiver via WebSocket
    req.app.get('io').to(`user_${receiverId}`).emit('call_initiated', {
      callerId: req.user.userId,
      roomName,
      token
    });

    res.json({ token, roomName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};