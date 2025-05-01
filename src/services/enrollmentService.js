// services/enrollmentService.js
const pool = require('../config/db');

exports.createEnrollment = async (studentId, courseId) => {
    const client = await pool.connect();
    try {
        // Optional: Prevent duplicate enrollment
        const check = await client.query(
            `SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2`,
            [studentId, courseId]
        );
        if (check.rows.length > 0) {
            throw new Error('You have already enrolled in this course');
        }

        const result = await client.query(
            `INSERT INTO enrollments (student_id, course_id)
             VALUES ($1, $2)
             RETURNING *`,
            [studentId, courseId]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};
exports.getEnrollmentsByStudentId = async (studentId) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM enrollments WHERE student_id = $1`,
            [studentId]
        );
        return result.rows;
    } finally {
        client.release();
    }
};
exports.getEnrollmentById = async (enrollmentId) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM enrollments WHERE id = $1`,
            [enrollmentId]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};
exports.updateEnrollment = async (enrollmentId, data) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE enrollments SET course_id = $1 WHERE id = $2 RETURNING *`,
            [data.course_id, enrollmentId]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};
exports.deleteEnrollment = async (enrollmentId) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `DELETE FROM enrollments WHERE id = $1 RETURNING *`,
            [enrollmentId]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};
exports.getAllEnrollments = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM enrollments`
        );
        return result.rows;
    } finally {
        client.release();
    }
};
exports.getEnrollmentsByCourseId = async (courseId) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM enrollments WHERE course_id = $1`,
            [courseId]
        );
        return result.rows;
    } finally {
        client.release();
    }
};