// services/progressService.js
const db = require('../config/db');

exports.markLessonCompleted = async (userId, lessonId) => {
    await db.query(
        `INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completed_at)
         VALUES ($1, $2, true, NOW())
         ON CONFLICT (user_id, lesson_id) DO UPDATE SET is_completed = true, completed_at = NOW()`,
        [userId, lessonId]
    );
};

exports.getUserProgressForCourse = async (userId, courseId) => {
    const result = await db.query(
        `SELECT l.id AS lesson_id, l.title, COALESCE(ulp.is_completed, false) AS is_completed
         FROM lessons l
         LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = $1
         WHERE l.course_id = $2
         ORDER BY l.position ASC`,
        [userId, courseId]
    );
    return result.rows;
};

exports.getCompletedLessons = async (userId) => {
    const result = await db.query(
        `SELECT l.id, l.title, l.course_id, ulp.completed_at
         FROM user_lesson_progress ulp
         INNER JOIN lessons l ON l.id = ulp.lesson_id
         WHERE ulp.user_id = $1 AND ulp.is_completed = true
         ORDER BY ulp.completed_at DESC`,
        [userId]
    );
    return result.rows;
};
exports.getProgressByLesson = async (userId, lessonId) => {
    const result = await db.query(
        `SELECT ulp.is_completed, ulp.completed_at
         FROM user_lesson_progress ulp
         WHERE ulp.user_id = $1 AND ulp.lesson_id = $2`,
        [userId, lessonId]
    );
    return result.rows[0] || { is_completed: false, completed_at: null };
};