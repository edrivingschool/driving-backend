const pool = require('../config/db');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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