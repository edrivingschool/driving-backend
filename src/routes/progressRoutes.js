const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonProgress:
 *       type: object
 *       properties:
 *         lesson_id:
 *           type: integer
 *         title:
 *           type: string
 *         position:
 *           type: integer
 *         is_completed:
 *           type: boolean
 *     CourseProgressSummary:
 *       type: object
 *       properties:
 *         totalLessons:
 *           type: integer
 *         completedLessons:
 *           type: integer
 *     StudentProgressDetails:
 *       type: object
 *       properties:
 *         lesson_id:
 *           type: integer
 *         lesson_title:
 *           type: string
 *         lesson_position:
 *           type: integer
 *         is_completed:
 *           type: boolean
 *         completed_at:
 *           type: string
 *           format: date-time
 *         course_title:
 *           type: string
 */

/**
 * @swagger
 * /api/progress/complete/{lessonId}:
 *   post:
 *     summary: Mark a lesson as completed
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the lesson to mark as completed
 *     responses:
 *       200:
 *         description: Lesson marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lesson marked as completed
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/complete/:lessonId', authenticate, progressController.markLessonCompleted);

/**
 * @swagger
 * /api/progress/course/{courseId}/summary:
 *   get:
 *     summary: Get course progress summary
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Course progress summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseProgressSummary'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/course/:courseId/summary', authenticate, progressController.getCourseProgressSummary);

/**
 * @swagger
 * /api/progress/course/{courseId}:
 *   get:
 *     summary: Get detailed course progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Detailed course progress
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LessonProgress'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/course/:courseId', authenticate, progressController.getUserProgressForCourse);

/**
 * @swagger
 * /api/progress/completed:
 *   get:
 *     summary: Get all completed lessons
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   course_id:
 *                     type: integer
 *                   completed_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/completed', authenticate, progressController.getCompletedLessons);

/**
 * @swagger
 * /api/progress/lesson/{lessonId}:
 *   get:
 *     summary: Get lesson completion status
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the lesson
 *     responses:
 *       200:
 *         description: Lesson completion status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completed:
 *                   type: boolean
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/lesson/:lessonId', authenticate, progressController.getProgressByLesson);

/**
 * @swagger
 * /api/progress/teacher/student/{studentId}/course:
 *   get:
 *     summary: Get student progress details (Teacher only)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: Student progress details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentProgressDetails'
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: No progress found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/teacher/student/:studentId/course', authenticate, progressController.getStudentProgressDetails);

module.exports = router;