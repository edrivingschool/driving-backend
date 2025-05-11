const { generateVideoToken, generateRoomName } = require('../services/twilioService');
const { twilioClient } = require('../config/twilio');
const User = require('../models/user');

exports.initiateCall = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const io = req.app.get('io');
    
    // Verify receiver exists
    const receiver = await User.findById(receiverId).lean();
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check receiver online status
    const receiverRoom = io.sockets.adapter.rooms.get(`user_${receiverId}`);
    if (!receiverRoom || receiverRoom.size === 0) {
      return res.status(400).json({ error: 'Receiver is offline' });
    }

    // Generate call details
    const roomName = generateRoomName();
    const callerToken = generateVideoToken(req.user.userId, roomName);
    const receiverToken = generateVideoToken(receiverId, roomName);

    // Example: Send SMS notification using Twilio client
    if (receiver.phone) {
      try {
        await twilioClient.messages.create({
          body: `You have an incoming video call from ${req.user.name}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: receiver.phone
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }
    }

    // Notify receiver via WebSocket
    io.to(`user_${receiverId}`).emit('call_initiated', {
      caller: {
        id: req.user.userId,
        name: req.user.name
      },
      roomName,
      token: receiverToken
    });

    res.json({
      success: true,
      token: callerToken,
      roomName,
      callDetails: {
        participants: [req.user.userId, receiverId],
        initiatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Call initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate call',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};