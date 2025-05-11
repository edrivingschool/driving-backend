// controllers/progressController.js
const progressService = require('../services/progressService');

exports.markLessonCompleted = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lessonId } = req.params;
    await progressService.markLessonCompleted(userId, lessonId);
    res.json({ message: 'Lesson marked as completed' });
  } catch (error) {
    console.error('Error marking lesson completed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCourseProgressSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;
    const summary = await progressService.getCourseProgressSummary(userId, courseId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching course progress summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserProgressForCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;
    const progress = await progressService.getUserProgressForCourse(userId, courseId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress details:', error);
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
    res.json({ completed: progress.is_completed, completedAt: progress.completed_at });
  } catch (error) {
    console.error('Error fetching progress by lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




exports.getStudentProgressDetails = async (req, res) => {
    try {
        const teacherId = req.user.teacherId;
        const {studentId} = req.params;
        
        const progress = await progressService.getStudentProgressDetails(teacherId, studentId);
        res.json(progress);
    } catch (error) {
        console.log('Error fetching student progress details:', error);
        console.error('Error fetching student progress details:', error);
        if (error.message.includes('Unauthorized')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
