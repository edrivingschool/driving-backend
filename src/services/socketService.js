const socketIO = require('socket.io');

let io;
exports.initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // Consider restricting this in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    const userId = socket.handshake.query.userId;
    
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    } else {
      console.warn('User connected without userId');
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

exports.getIO = () => io;