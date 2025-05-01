const pool = require('../config/db');
const s3Uploader = require('../utils/s3Uploader');
const Registration = require('../models/Registration');

exports.register = async (data, files) => {
    const client = await pool.connect();
    try {
        const uploadedFiles = {};
        for (let key in files) {
            const result = await s3Uploader.uploadFile(files[key][0]);
            uploadedFiles[key + '_url'] = result.Location;
        }

        const fullData = { ...data, ...uploadedFiles };

        const insertQuery = `
            INSERT INTO course_registrations (
                first_name, middle_name, last_name, grand_name, age, sex, education_level,
                state, zone, woreda, city, kebele, phone_number,
                emergency_contact_name, emergency_contact_phone,
                national_id_url, educational_certificate_url, medical_report_url, user_image_url,
                driving_license_level, school_branch
            ) VALUES ($1, $2, $3, $4, $5, $6, $7,
                      $8, $9, $10, $11, $12, $13,
                      $14, $15, $16, $17, $18, $19, $20, $21)
            RETURNING *`;

        const values = [
            data.first_name, data.middle_name, data.last_name, data.grand_name, data.age, data.sex, data.education_level,
            data.state, data.zone, data.woreda, data.city, data.kebele, data.phone_number,
            data.emergency_contact_name, data.emergency_contact_phone,
            uploadedFiles.national_id_url, uploadedFiles.educational_certificate_url,
            uploadedFiles.medical_report_url, uploadedFiles.user_image_url,
            data.driving_license_level, data.school_branch
        ];

        const result = await client.query(insertQuery, values);
        return new Registration(result.rows[0]);
    } finally {
        client.release();
    }
};
exports.getAllRegistrations = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM course_registrations');
        return result.rows.map(row => new Registration(row));
    } finally {
        client.release();
    }
};
exports.getRegistrationById = async (id) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM course_registrations WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        return new Registration(result.rows[0]);
    } finally {
        client.release();
    }
};
exports.updateRegistration = async (id, data, files) => {
    const client = await pool.connect();
    try {
        const uploadedFiles = {};
        for (let key in files) {
            const result = await s3Uploader.uploadFile(files[key][0]);
            uploadedFiles[key + '_url'] = result.Location;
        }

        const fullData = { ...data, ...uploadedFiles };

        const updateQuery = `
            UPDATE course_registrations
            SET first_name = $1, middle_name = $2, last_name = $3, grand_name = $4, age = $5, sex = $6, education_level = $7,
                state = $8, zone = $9, woreda = $10, city = $11, kebele = $12, phone_number = $13,
                emergency_contact_name = $14, emergency_contact_phone = $15,
                national_id_url = $16, educational_certificate_url = $17, medical_report_url = $18, user_image_url = $19,
                driving_license_level = $20, school_branch = $21
            WHERE id = $22
            RETURNING *`;

        const values = [
            fullData.first_name, fullData.middle_name, fullData.last_name, fullData.grand_name, fullData.age, fullData.sex, fullData.education_level,
            fullData.state, fullData.zone, fullData.woreda, fullData.city, fullData.kebele, fullData.phone_number,
            fullData.emergency_contact_name, fullData.emergency_contact_phone,
            fullData.national_id_url, fullData.educational_certificate_url,
            fullData.medical_report_url, fullData.user_image_url,
            fullData.driving_license_level, fullData.school_branch, id
        ];

        const result = await client.query(updateQuery, values);
        if (result.rows.length === 0) return null;
        return new Registration(result.rows[0]);
    } finally {
        client.release();
    }
};

exports.deleteRegistration = async (id) => {
    const client = await pool.connect();
    try {
        const deleteQuery = 'DELETE FROM course_registrations WHERE id = $1 RETURNING *';
        const result = await client.query(deleteQuery, [id]);
        if (result.rows.length === 0) return null;
        return new Registration(result.rows[0]);
    } finally {
        client.release();
    }
};

