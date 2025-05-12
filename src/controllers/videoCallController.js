const { v4: uuidv4 } = require('uuid');
const { twilioClient, twilioJwtConfig } = require('../config/twilio');
const { generateVideoToken, generateRoomName } = require('../services/twilioService');
const User = require('../models/user');

const { findUserById, findTeacherById } = require('../services/userService');
exports.createRoom = async (req, res) => {
  try {
    const room = await twilioClient.video.rooms.create({
      uniqueName: generateRoomName(),
      type: 'go', // 'peer-to-peer' for 1:1, 'group' for larger
      maxParticipants: 2
    });

    res.json({ 
      roomSid: room.sid,
      roomName: room.uniqueName 
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create video room',
      code: error.code
    });
  }
};
exports.initiateCall = async (req, res) => {
  try {
    const { receiverId, roomName } = req.body;
    const callerId = req.user.teacherId || req.user.userId;
    const io = req.app.get('io');
console.log('Caller ID:', callerId);
    console.log('Receiver ID:', receiverId);
    
    // Fetch receiver by checking both user and teacher tables
    let receiver = await findUserById(receiverId);
    let isTeacherReceiver = false;

    if (!receiver) {
      receiver = await findTeacherById(receiverId);
      isTeacherReceiver = true; // Receiver is a teacher
    }

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }
    console.log('Receiver:', receiver);

    // Determine receiver room based on their actual role
    const receiverRoom = isTeacherReceiver 
      ? `teacher_${receiverId}`
      : `user_${receiverId}`;

    const receiverSockets = await io.in(receiverRoom).fetchSockets();
    console.log('Receiver Sockets:', receiverSockets);
    if (receiverSockets.length === 0) {
      return res.status(400).json({ error: 'User is offline' });
    }

    const finalRoomName = roomName || generateRoomName();
    console.log('Final Room Name:', finalRoomName);
    const callerToken = generateVideoToken(callerId, finalRoomName);
    console.log('Caller Token:', callerToken);
    const receiverToken = generateVideoToken(receiverId, finalRoomName);
    console.log('Receiver Token:', receiverToken);
    // Emit to the correct receiver room
    io.to(receiverRoom).emit('call-initiated', { // <-- FIXED HERE
      callerId,
      roomName: finalRoomName,
      token: receiverToken
    });
    console.log('Emitted to receiver room:', receiverRoom);
    
    res.json({
      success: true,
      roomName: finalRoomName,
      token: callerToken
    });

  } catch (error) {
    console.error('Call initiation error:', error);
    res.status(500).json({ error: 'Call initiation failed' });
  }
};

exports.generateToken = (req, res) => {
  try {
    const { roomName } = req.body;
    const token = generateVideoToken(req.user.id, roomName);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Token generation failed' });
  }
};