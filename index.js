const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const setupSwagger = require('./swagger');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const teacherRoutes = require('./src/routes/teacherRoutes');
const registerRoutes = require('./src/routes/registrationRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const videoCallRoutes = require('./src/routes/video-callRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');

const { initializeSocket } = require('./src/services/socketService');
const { assign } = require('nodemailer/lib/shared');

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ Wrap express in http.Server

// Initialize Socket.IO with the server
setupSwagger(app);
const io = initializeSocket(server);
app.set('io', io); // Optional: allows you to access it via req.app.get('io')

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/video-call', videoCallRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assignments', assignmentRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
