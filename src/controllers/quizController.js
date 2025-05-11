// === FILE: controllers/quizController.js ===
const quizService = require('../services/quizService');

exports.createQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { question, options } = req.body;
    const quiz = await quizService.createQuizWithOptions(lessonId, question, options);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQuizzesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const quizzes = await quizService.getQuizzesWithOptions(lessonId);
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add this new method to quizController.js
exports.getUserSubmissionsForLesson = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.userId;

    try {
        const submissions = await quizService.getUserSubmissionsForLesson(userId, lessonId);
        res.json({
            answers: submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.submitAnswer = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.userId;
    const { selected_option_id } = req.body;

    try {
        const result = await quizService.submitAnswer(userId, quizId, selected_option_id);
        res.json(result);
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.submitBatchAnswers = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.userId;
    const { answers } = req.body;

    try {
        const result = await quizService.submitBatchAnswers(userId, lessonId, answers);
        res.json(result);
    } catch (error) {
        console.error('Error submitting batch answers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await quizService.getQuizResultsByUserId(userId);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        await quizService.deleteQuiz(quizId);
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { question, options } = req.body;
        const updatedQuiz = await quizService.updateQuiz(quizId, question, options);
        res.status(200).json(updatedQuiz);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
