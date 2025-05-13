// === FILE: routes/quizRoutes.js ===
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const {authenticate} = require('../middleware/auth');

router.post('/:lessonId', quizController.createQuiz);
router.get('/:lessonId', quizController.getQuizzesByLesson);
router.post('/submit/:quizId', authenticate, quizController.submitAnswer);
router.get('/submissions/:lessonId', authenticate, quizController.getUserSubmissionsForLesson);
router.post('/submit-batch/:lessonId', authenticate, quizController.submitBatchAnswers);
router.get('/results/:userId', quizController.getQuizResults);
router.delete('/:quizId', authenticate, quizController.deleteQuiz);
router.put('/:quizId', authenticate, quizController.updateQuiz);


module.exports = router;
