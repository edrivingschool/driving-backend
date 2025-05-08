const socketIO = require('socket.io');

let io;

exports.initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user_${userId}`);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

exports.getIO = () => io;