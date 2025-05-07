const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Add this line
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const teacherRoutes = require('./src/routes/teacherRoutes');
const registerRoutes = require('./src/routes/registrationRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes')
const paymentRoutes = require('./src/routes/paymentRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});