const db = require('../config/db');

const getAssignmentsForStudent = async (studentId) => {
    const query = `
      SELECT t.*
      FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      WHERE ta.student_id = $1;
    `;
    const { rows } = await db.query(query, [studentId]);
    return rows;
  };
  

  const getAssignmentsForTeacher = async (teacherId) => {
    const query = `
      SELECT ta.*, u.*
      FROM teacher_assignments ta
      LEFT JOIN users u ON ta.student_id = u.id
      WHERE ta.teacher_id = $1;
    `;
    const { rows } = await db.query(query, [teacherId]);
    return rows;
  };
  
  

module.exports = {
  getAssignmentsForStudent,
  getAssignmentsForTeacher,
};
