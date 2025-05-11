const request = require('supertest');
const express = require('express');
const http = require('http');
const videoCallRoutes = require('../src/routes/video-callRoutes');
const { initializeSocket } = require('../src/services/socketService');

jest.mock('twilio');

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
app.set('io', io);
app.use(express.json());
app.use('/api/video-call', videoCallRoutes);

// Dummy middleware to fake auth
app.use((req, res, next) => {
  req.user = {
    userId: '6',
    name: 'Test Caller'
  };
  next();
});


jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: '6', name: 'Test User' };
    next();
  },
}));

describe('POST /api/video-call/video-call', () => {
  it('should initiate a video call successfully', async () => {
    const response = await request(app)
      .post('/api/video-call/video-call')
      .send({ receiverId: '27' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.roomName).toMatch(/^call_/);
  });
});

