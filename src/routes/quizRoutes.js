const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /quizzes/{lessonId}:
 *   post:
 *     summary: Create a new quiz with options
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the lesson this quiz belongs to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - is_correct
 *                   properties:
 *                     text:
 *                       type: string
 *                     is_correct:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:lessonId', quizController.createQuiz);

/**
 * @swagger
 * /quizzes/{lessonId}:
 *   get:
 *     summary: Get all quizzes for a lesson
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the lesson
 *     responses:
 *       200:
 *         description: List of quizzes with options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId', quizController.getQuizzesByLesson);

/**
 * @swagger
 * /quizzes/submit/{quizId}:
 *   post:
 *     summary: Submit an answer to a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selected_option_id
 *             properties:
 *               selected_option_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Answer submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 is_correct:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/submit/:quizId', authenticate, quizController.submitAnswer);

/**
 * @swagger
 * /quizzes/submissions/{lessonId}:
 *   get:
 *     summary: Get user's quiz submissions for a lesson
 *     tags: [Quizzes]
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
 *         description: List of user's submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizSubmission'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/submissions/:lessonId', authenticate, quizController.getUserSubmissionsForLesson);

/**
 * @swagger
 * /quizzes/submit-batch/{lessonId}:
 *   post:
 *     summary: Submit multiple quiz answers for a lesson
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the lesson
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - quiz_id
 *                     - selected_option_id
 *                   properties:
 *                     quiz_id:
 *                       type: integer
 *                     selected_option_id:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Batch submission result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchSubmissionResult'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/submit-batch/:lessonId', authenticate, quizController.submitBatchAnswers);

/**
 * @swagger
 * /quizzes/results/{userId}:
 *   get:
 *     summary: Get quiz results for a user
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User's quiz results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   quiz_id:
 *                     type: integer
 *                   question:
 *                     type: string
 *                   option_text:
 *                     type: string
 *                   is_correct:
 *                     type: boolean
 *       500:
 *         description: Internal server error
 */
router.get('/results/:userId', quizController.getQuizResults);

/**
 * @swagger
 * /quizzes/{quizId}:
 *   delete:
 *     summary: Delete a quiz and its options
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the quiz to delete
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:quizId', authenticate, quizController.deleteQuiz);

/**
 * @swagger
 * /quizzes/{quizId}:
 *   put:
 *     summary: Update a quiz and its options
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the quiz to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - is_correct
 *                   properties:
 *                     text:
 *                       type: string
 *                     is_correct:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/:quizId', authenticate, quizController.updateQuiz);

module.exports = router;