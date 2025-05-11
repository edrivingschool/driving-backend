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
    console.log('Receiver ID:', receiverId);
    console.log('Room Name:', roomName);
    const callerId = req.user.teacherId || req.user.userId;
    console.log('Caller ID:', callerId);
    const io = req.app.get('io');
    // Verify receiver exists
    let receiver;
    if ( !req.user.userId ){
    receiver = await findUserById(receiverId);
    console.log('Receiver:', receiver);
    }
    else{
      console.log('Teacher ID:', req.user.teacherId);
      receiver = await findTeacherById(receiverId);
      console.log('Receiver:', receiver);
    }
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

const isTeacherReceiver = !req.user.teacherId;
    console.log('Is Teacher Receiver:', isTeacherReceiver);
    // Use different room names for teachers and users
const receiverRoom = isTeacherReceiver 
  ? `teacher_${receiverId}`
  : `user_${receiverId}`;
    console.log('Receiver Room:', receiverRoom);

const receiverSockets = await io.in(receiverRoom).fetchSockets();
    console.log('Receiver Sockets:', receiverSockets);
    if (receiverSockets.length === 0) {
      console.log('Receiver is offline'); 
      return res.status(400).json({ error: 'User is offline' });
    }

    // Generate room name if not provided
    const finalRoomName = roomName || generateRoomName();
    console.log('Final Room Name:', finalRoomName);
    // Generate tokens
    const callerToken = generateVideoToken(callerId, finalRoomName);
    const receiverToken = generateVideoToken(receiverId, finalRoomName);

    // Notify receiver via WebSocket
    io.to(`user_${receiverId}`).emit('call-initiated', {
      callerId,
      roomName: finalRoomName,
      token: receiverToken
    });

    res.json({
      success: true,
      roomName: finalRoomName,
      token: callerToken
    });
  } catch (error) {
    console.error('Call initiation error:', error);
    res.status(500).json({
      error: 'Call initiation failed',
      systemCode: error.code
    });
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