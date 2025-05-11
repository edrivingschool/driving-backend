// services/progressService.js
const db = require('../config/db');

exports.markLessonCompleted = async (userId, lessonId) => {
  await db.query(
    `INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completed_at)
     VALUES ($1, $2, true, NOW())
     ON CONFLICT (user_id, lesson_id)
     DO UPDATE SET is_completed = true, completed_at = NOW()`,
    [userId, lessonId]
  );
};

exports.getCourseProgressSummary = async (userId, courseId) => {
  const totalRes = await db.query(
    `SELECT COUNT(*) AS total_lessons FROM lessons WHERE course_id = $1`,
    [courseId]
  );
  const totalLessons = parseInt(totalRes.rows[0].total_lessons, 10);

  const compRes = await db.query(
    `SELECT COUNT(*) AS completed_lessons
     FROM user_lesson_progress ulp
     JOIN lessons l ON l.id = ulp.lesson_id
     WHERE ulp.user_id = $1 AND l.course_id = $2 AND ulp.is_completed = true`,
    [userId, courseId]
  );
  const completedLessons = parseInt(compRes.rows[0].completed_lessons, 10);

  return { totalLessons, completedLessons };
};

exports.getUserProgressForCourse = async (userId, courseId) => {
  const result = await db.query(
    `SELECT l.id AS lesson_id, l.title, l.position,
            COALESCE(ulp.is_completed, false) AS is_completed
     FROM lessons l
     LEFT JOIN user_lesson_progress ulp
       ON ulp.lesson_id = l.id AND ulp.user_id = $1
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
     JOIN lessons l ON l.id = ulp.lesson_id
     WHERE ulp.user_id = $1 AND ulp.is_completed = true
     ORDER BY ulp.completed_at DESC`,
    [userId]
  );
  return result.rows;
};

exports.getProgressByLesson = async (userId, lessonId) => {
  const result = await db.query(
    `SELECT COALESCE(ulp.is_completed, false) AS is_completed, ulp.completed_at
     FROM lessons l
     LEFT JOIN user_lesson_progress ulp
       ON ulp.lesson_id = l.id AND ulp.user_id = $1
     WHERE l.id = $2`,
    [userId, lessonId]
  );
  if (!result.rows.length) return { is_completed: false, completed_at: null };
  return result.rows[0];
};
exports.getStudentProgressDetails = async (teacherId, studentId) => {
    const verification = await db.query(
        `SELECT 1 FROM teacher_assignments 
         WHERE teacher_id = $1 AND student_id = $2`,
        [teacherId, studentId]
    );

    if (verification.rows.length === 0) {
        throw new Error('Unauthorized access or invalid student');
    }

    // Dynamically get the course ID the student is enrolled in (assuming 1 course per student for simplicity)
    const courseRes = await db.query(
        `SELECT DISTINCT l.course_id
         FROM user_lesson_progress ulp
         JOIN lessons l ON ulp.lesson_id = l.id
         WHERE ulp.user_id = $1
         LIMIT 1`,
        [studentId]
    );

    if (courseRes.rows.length === 0) {
        throw new Error('No course progress found for the student');
    }

    const courseId = courseRes.rows[0].course_id;


    const result = await db.query(
        `SELECT 
            l.id AS lesson_id,
            l.title AS lesson_title,
            l.position AS lesson_position,
            ulp.is_completed,
            ulp.completed_at,
            c.title AS course_title
         FROM lessons l
         JOIN courses c ON c.id = l.course_id
         LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = $1
         WHERE l.course_id = $2
         ORDER BY l.position ASC`,
        [studentId, courseId]
    );

    return result.rows;
};
