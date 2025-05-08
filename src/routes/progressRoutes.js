// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

router.post('/complete/:lessonId', authenticate, progressController.markLessonCompleted);
router.get('/course/:courseId', authenticate, progressController.getUserProgressForCourse);
router.get('/completed', authenticate, progressController.getCompletedLessons);
router.get('/lesson/:lessonId', authenticate, progressController.getProgressByLesson);

module.exports = router;
