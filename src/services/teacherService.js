const pool = require('../config/db');
const Teacher = require('../models/teacher');
const bcrypt = require('bcrypt');

exports.createTeacher = async (firstName, lastName, email, phoneNumber, password) => {
    const client = await pool.connect();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query(
            `INSERT INTO teachers (first_name, last_name, email, phone_number, password)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [firstName, lastName, email, phoneNumber, hashedPassword]
        );
        const row = result.rows[0];
        return new Teacher(row.id, row.first_name, row.last_name, row.email, row.phone_number);
    } finally {
        client.release();
    }
};

exports.authenticateTeacher = async (email, password) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM teachers WHERE email = $1`, [email]);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        const isMatch = await bcrypt.compare(password, row.password);
        if (!isMatch) return null;

        return new Teacher(row.id, row.first_name, row.last_name, row.email, row.phone_number);
    } finally {
        client.release();
    }
};

exports.getAllTeachers = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM teachers');
        return result.rows.map(row =>
            new Teacher(row.id, row.first_name, row.last_name, row.email, row.phone_number)
        );
    } finally {
        client.release();
    }
};

exports.getTeacherById = async (id) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM teachers WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new Teacher(row.id, row.first_name, row.last_name, row.email, row.phone_number);
    } finally {
        client.release();
    }
};
exports.updateTeacher = async (id, firstName, lastName, email, phoneNumber) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE teachers SET first_name = $1, last_name = $2, email = $3, phone_number = $4
             WHERE id = $5 RETURNING *`,
            [firstName, lastName, email, phoneNumber, id]
        );
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new Teacher(row.id, row.first_name, row.last_name, row.email, row.phone_number);
    } finally {
        client.release();
    }
};
exports.deleteTeacher = async (id) => {
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM teachers WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new Teacher(row.id, row.first_name, row.last_name, row.email, row.phone_number);
    } finally {
        client.release();
    }
};
exports.updateTeacherPassword = async (id, newPassword) => {
    const client = await pool.connect();
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await client.query(
            `UPDATE teachers SET password = $1 WHERE id = $2 RETURNING *`,
            [hashedPassword, id]
        );
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new Teacher(row.id, row.first_name, row.last_name, row.email, row.phone_number);
    } finally {
        client.release();
    }
};
