const db = require('../config/db'); // your pg client setup
const User = require('../models/user');

async function findUserById(id) {
  const result = await db.query(
    'SELECT id, first_name, last_name, email, phone_number, profile_picture FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return new User(row.id, row.first_name, row.last_name, row.email, row.phone_number, null, null, row.profile_picture);
}

async function findTeacherById(id) {
    const result = await db.query(
      'SELECT id, first_name, last_name, email, phone_number FROM teachers WHERE id = $1',
      [id]
    );
  
    if (result.rows.length === 0) return null;
  
    const row = result.rows[0];
    return new User(row.id, row.first_name, row.last_name, row.email, row.phone_number, null, null, row.profile_picture);
  }

module.exports = {
  findUserById,
    findTeacherById
};
