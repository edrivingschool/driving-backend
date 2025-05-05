const pool = require('../config/db'); // Assuming you have a db.js file for database connection

const createCourse = async (title, description, price, imageUrl) => {
    const result = await pool.query(
      'INSERT INTO courses (title, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, price, imageUrl]
    );
    return result.rows[0];
  };
  
  const updateCourse = async (id, title, description, price, imageUrl) => {
    const result = await pool.query(
      'UPDATE courses SET title = $1, description = $2, price = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [title, description, price, imageUrl, id]
    );
    return result.rows[0];
  };
  

  const getAllCoursesWithEnrollmentStatus = async (userId) => {
    const result = await pool.query(
      `
      SELECT 
        c.*,
        CASE 
          WHEN e.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS enrolled,
        e.status AS enrollment_status  -- ✅ Include status from enrollments if exists
      FROM courses c
      LEFT JOIN enrollments e 
        ON c.id = e.course_id AND e.student_id = $1
      ORDER BY c.created_at DESC
      `,
      [userId]
    );
  
    return result.rows;}

const getCourseById = async (id) => {
  const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
  return result.rows[0];
};

const deleteCourse = async (id) => {
  const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  createCourse,
  getAllCoursesWithEnrollmentStatus,
    getCourseById,
    updateCourse,
    deleteCourse
};
