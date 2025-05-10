// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

// mark a lesson complete
router.post(
  '/complete/:lessonId',
  authenticate,
  progressController.markLessonCompleted
);

// SUMMARY: total vs. completed counts for a course
router.get(
  '/course/:courseId/summary',
  authenticate,
  progressController.getCourseProgressSummary
);

// DETAILS: full per-lesson list with is_completed flags
router.get(
  '/course/:courseId',
  authenticate,
  progressController.getUserProgressForCourse
);

// all completed lessons across all courses
router.get(
  '/completed',
  authenticate,
  progressController.getCompletedLessons
);

// single-lesson status
router.get(
  '/lesson/:lessonId',
  authenticate,
  progressController.getProgressByLesson
);

module.exports = router;
