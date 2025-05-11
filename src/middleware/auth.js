// middleware/auth.js
const jwt = require('jsonwebtoken');
const { twilioClient } = require('../config/twilio');

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info (e.g., id) to the request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};



exports.validateRoomAccess = async (req, res, next) => {
    try {
      const room = await twilioClient.video.rooms(req.body.roomName).fetch();
      
      if (room.status !== 'in-progress') {
        return res.status(400).json({ error: 'Room not active' });
      }
      
      next();
    } catch (error) {
      console.error('Room validation error:', error);
      res.status(403).json({ error: 'Invalid room access' });
    }
  };