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
  

const getAllCourses = async () => {
  const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
  return result.rows;
};
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
  getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};
