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


exports.getPendingRegistrations = async () => {
    const result = await pool.query(`
        SELECT dvl.*, cr.*, u.first_name, u.last_name, u.email
        FROM documents_verification_log dvl
        JOIN course_registrations cr ON cr.id = dvl.registration_id
        JOIN users u ON cr.user_id = u.id
        WHERE dvl.status = 'pending'
        ORDER BY dvl.id DESC
    `);
    return result.rows;
};

exports.getRegistrationById = async (id) => {
    console.log(id);
    const result = await pool.query(`
        SELECT cr.*, 
               u.first_name, u.last_name, u.email,
               ec.full_name as emergency_contact_name,
               ec.phone_number as emergency_contact_phone,
               addr.state, addr.zone, addr.woreda, addr.city, addr.kebele,
               dl.description as license_description,
               el.description as education_description,
               sb.city as branch_name,
               dvl.status, dvl.remarks, dvl.verified_by, dvl.verified_at
        FROM course_registrations cr
        JOIN users u ON cr.user_id = u.id
        JOIN emergency_contacts ec ON cr.emergency_contact_id = ec.id
        JOIN addresses addr ON cr.residential_address_id = addr.id
        LEFT JOIN driving_license_levels dl ON cr.driving_license_level = dl.level_code
        JOIN education_levels el ON cr.education_level = el.level_code
        LEFT JOIN school_branches sb ON cr.school_branch_id = sb.branch_id
        JOIN documents_verification_log dvl ON cr.id = dvl.registration_id
        WHERE cr.id = $1
    `, [id]);
    
        console.log("inside return arround"+result.rows);
    return result.rows[0] || null;
};
exports.verifyRegistration = async (registrationId, status, remarks, adminId) => {
    if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status. Use "approved" or "rejected".');
    }

    const result = await pool.query(
        `UPDATE documents_verification_log 
         SET status = $2, verified_by = $3, remarks = $4 
         WHERE registration_id = $1 
         RETURNING *`,
        [registrationId, status, adminId, remarks]
    );

    return result.rows[0] || null;
};

exports.getAllCourses = async () => {
    
      const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
   return result.rows;
};
