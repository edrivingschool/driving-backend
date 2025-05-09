const pool = require('../config/db');

const createMessageTable = `
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    sent_by VARCHAR(7) CHECK (sent_by IN ('teacher', 'student')),
    content TEXT NOT NULL,
    type VARCHAR(10) CHECK (type IN ('text', 'image')),
    created_at TIMESTAMP DEFAULT NOW()
  )
`;

pool.query(createMessageTable);

module.exports = {
  async isValidTeacherStudentRelation(teacherId, studentId) {
    const result = await pool.query(
      `SELECT 1 FROM teacher_assignments 
       WHERE teacher_id = $1 AND student_id = $2`,
      [teacherId, studentId]
    );
    return result.rowCount > 0;
  },

  async createMessage(teacherId, studentId, sentBy, content, type) {
    const result = await pool.query(
      `INSERT INTO messages (teacher_id, student_id, sent_by, content, type) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [teacherId, studentId, sentBy, content, type]
    );
    return result.rows[0];
  },

  async getMessages(teacherId, studentId) {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE teacher_id = $1 AND student_id = $2 
       ORDER BY created_at`,
      [teacherId, studentId]
    );
    return result.rows;
  }
};