const pool = require('../config/db');
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');


exports.createAdmin = async (firstName, lastName, email, password) => {
    const client = await pool.connect();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query(
            `INSERT INTO admins (first_name, last_name, email, password) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [firstName, lastName, email, hashedPassword]
        );
        const row = result.rows[0];
        return new Admin(row.id, row.first_name, row.last_name, row.email);
    } finally {
        client.release();
    }
};

exports.authenticateAdmin = async (email, password) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM admins WHERE email = $1`, [email]);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        const isMatch = await bcrypt.compare(password, row.password);
        if (!isMatch) return null;

        return new Admin(row.id, row.first_name, row.last_name, row.email);
    } finally {
        client.release();
    }
};
