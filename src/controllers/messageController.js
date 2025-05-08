const Message = require('../models/message');
const { io } = require('../services/socketService');

exports.sendMessage = async (req, res) => {
    try {
      const { receiverId, content, type } = req.body;
    
        console.log('Message content:', content);
      const message = await Message.createMessage(req.user.userId, receiverId, content, type);
  
      // Emit real-time message using io from app instance
      const io = req.app.get('io');
      io.to(`user_${receiverId}`).emit('new_message', message);
  
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.getMessages(req.user.userId, req.params.otherUserId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};