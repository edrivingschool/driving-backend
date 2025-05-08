// controllers/progressController.js
const progressService = require('../services/progressService');

exports.markLessonCompleted = async (req, res) => {
    try {
        const userId =req.user.userId; 
        const { lessonId } = req.params;
        await progressService.markLessonCompleted(userId, lessonId);
        res.json({ message: 'Lesson marked as completed' });
    } catch (error) {
        console.error('Error marking lesson completed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserProgressForCourse = async (req, res) => {
    try {
        const userId =req.user.userId; 
        const { courseId } = req.params;
        const progress = await progressService.getUserProgressForCourse(userId, courseId);
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCompletedLessons = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const lessons = await progressService.getCompletedLessons(userId);
        res.json(lessons);
    } catch (error) {
        console.error('Error fetching completed lessons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProgressByLesson = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { lessonId } = req.params;
        const progress = await progressService.getProgressByLesson(userId, lessonId);
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress by lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};