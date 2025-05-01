const pool = require('../config/db');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService'); // Assuming you have an email service for sending OTPs


exports.createUser = async (firstName, lastName, email, phoneNumber, password) => {
    const client = await pool.connect();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            `INSERT INTO users (first_name, last_name, email, phone_number, password, role)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [firstName, lastName, email, phoneNumber, hashedPassword, 'student']
        );

        const row = result.rows[0];
        return new User(
            row.id,
            row.first_name,
            row.last_name,
            row.email,
            row.phone_number,
            null,
            row.university_id,
            row.profile_picture
        );
    } finally {
        client.release();
    }
};


exports.authenticateUser = async (identifier, password) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM users WHERE email = $1 OR phone_number = $1`,
            [identifier]
        );

        if (result.rows.length === 0) {
            return null; // No user found
        }

        const userRow = result.rows[0];
        const isMatch = await bcrypt.compare(password, userRow.password);
        if (!isMatch) {
            return null; // Password doesn't match
        }

        return new User(
            userRow.id,
            userRow.first_name,
            userRow.last_name,
            userRow.email,
            userRow.phone_number,
            null,
            userRow.profile_picture
        );
    } finally {
        client.release();
    }
};




exports.getAllUsers = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users');
        return result.rows.map(row =>
            new User(
                row.id,
                row.first_name,
                row.last_name,
                row.email,
                row.phone_number,
                null,
                row.university_id,
                row.profile_picture
            )
        );
    } finally {
        client.release();
    }
};

exports.getUserById = async (id) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new User(
            row.id,
            row.first_name,
            row.last_name,
            row.email,
            row.phone_number,
            null,
            row.university_id,
            row.profile_picture
        );
    } finally {
        client.release();
    }
};
exports.sendOTP = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const userTables = ['users', 'admins', 'teachers'];
    const client = await pool.connect();

    try {
        let userExists = false;

        for (const table of userTables) {
            const userCheck = await client.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
            if (userCheck.rows.length > 0) {
                userExists = true;
                break;
            }
        }

        if (!userExists) {
            throw new Error('User not found');
        }

        await client.query(
            'INSERT INTO password_reset_tokens (email, otp, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );
        await emailService.sendOTP(email, otp);
    } finally {
        client.release();
    }
};

exports.verifyOTP = async (email, otp) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM password_reset_tokens WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
            [email, otp]
        );
        return result.rows.length > 0;
    } finally {
        client.release();
    }
};

exports.resetPassword = async (email, otp, newPassword) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM password_reset_tokens WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
            [email, otp]
        );
        if (result.rows.length === 0) throw new Error('Invalid or expired OTP');

        const hashed = await bcrypt.hash(newPassword, 10);

        const userTables = ['users', 'admins', 'teachers'];
        let updated = false;

        for (const table of userTables) {
            const userCheck = await client.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
            if (userCheck.rows.length > 0) {
                await client.query(`UPDATE ${table} SET password = $1 WHERE email = $2`, [hashed, email]);
                updated = true;
                break;
            }
        }

        if (!updated) throw new Error('User not found');

        await client.query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);
    } finally {
        client.release();
    }
};
