const pool = require('../config/db');


const createMessageTable = `
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    type VARCHAR(10) CHECK (type IN ('text', 'image')),
    created_at TIMESTAMP DEFAULT NOW()
  )
`;

pool.query(createMessageTable);

module.exports = {
    async isValidTeacherStudentRelation(senderId, receiverId) {
      const result = await pool.query(
        `SELECT 1 FROM teacher_assignments 
         WHERE (student_id = $1 AND teacher_id = $2)
            OR (teacher_id = $1 AND student_id = $2)`,
        [senderId, receiverId]
      );
      return result.rowCount > 0;
    },
  
    async createMessage(senderId, receiverId, content, type) {
      const isValid = await this.isValidTeacherStudentRelation(senderId, receiverId);
      if (!isValid) {
        throw new Error('Invalid teacher-student relationship.');
      }
  
      const result = await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, content, type) VALUES ($1, $2, $3, $4) RETURNING *',
        [senderId, receiverId, content, type]
      );
      return result.rows[0];
    },
  
    async getMessages(user1, user2) {
      const result = await pool.query(
        'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at',
        [user1, user2]
      );
      return result.rows;
    }
  };
  