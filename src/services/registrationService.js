const pool = require('../config/db');
const s3Uploader = require('../utils/s3Uploader');

exports.register = async (data, files) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Upload files
        const uploadedFiles = {};
        for (const key in files) {
            const file = files[key][0];
            uploadedFiles[`${key}_url`] = await s3Uploader.uploadToS3(file);
        }

        // Check if user exists
        const existingUserRes = await client.query(
            `SELECT id, first_name, last_name FROM users 
             WHERE email = $1 OR phone_number = $2`,
            [data.email, data.phone_number]
        );

        let userId;
        if (existingUserRes.rows.length > 0) {
            // User exists
            const user = existingUserRes.rows[0];
            userId = user.id;

            // Update name if mismatched
            if (user.first_name !== data.first_name || user.last_name !== data.last_name) {
                await client.query(
                    `UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3`,
                    [data.first_name, data.last_name, userId]
                );
            }
        } else {
            
        }

        // Create emergency contact
        const ecRes = await client.query(
            `INSERT INTO emergency_contacts 
             (full_name, phone_number) VALUES ($1, $2) RETURNING id`,
            [data.emergency_contact_name, data.emergency_contact_phone]
        );
        const emergencyContactId = ecRes.rows[0].id;

        // Create residential address
        const addrRes = await client.query(
            `INSERT INTO addresses 
             (state, zone, woreda, city, kebele) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [data.state, data.zone, data.woreda, 
             data.city, data.kebele]
        );
        const addressId = addrRes.rows[0].id;

        // Create course registration
        const regRes = await client.query(
            `INSERT INTO course_registrations (
                user_id, residential_address_id, emergency_contact_id,
                age, sex, education_level, national_id_url,
                educational_certificate_url, medical_report_url,
                user_image_url, driving_license_level, school_branch_id
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                userId, addressId, emergencyContactId,
                data.age, data.sex, data.education_level,
                uploadedFiles.national_id_url,
                uploadedFiles.educational_certificate_url,
                uploadedFiles.medical_report_url,
                uploadedFiles.user_image_url,
                data.driving_license_level,
                data.school_branch
            ]
        );
        await client.query(`
            INSERT INTO documents_verification_log (registration_id, status)
            SELECT $1, 'pending'
            WHERE NOT EXISTS (
                SELECT 1 FROM documents_verification_log WHERE registration_id = $1
            )
        `, [regRes.rows[0].id]);
        
        await client.query('COMMIT');
        return regRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


exports.getDocumentVerificationStatus = async (userId) => {
    const client = await pool.connect();
    try {
        console.log('User ID:', userId);
        const result = await client.query(`
            SELECT dvl.status, dvl.verified_at, cr.id as registration_id
            FROM course_registrations cr
            JOIN documents_verification_log dvl ON dvl.registration_id = cr.id
            WHERE cr.user_id = $1
            ORDER BY dvl.verified_at DESC
            LIMIT 1
        `, [userId]);

        if (result.rows.length === 0) {
            return { status: 'not_found' };
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};



exports.getAllRegistrations = async () => {
    const query = `
        SELECT cr.*, 
               u.first_name, u.last_name, u.email,
               ec.full_name as emergency_contact_name,
               ec.phone_number as emergency_contact_phone,
               addr.state, addr.zone, addr.woreda, addr.city, addr.kebele,
               dl.description as license_description,
               el.description as education_description,
               sb.city as branch_name
        FROM course_registrations cr
        JOIN users u ON cr.user_id = u.id
        JOIN emergency_contacts ec ON cr.emergency_contact_id = ec.id
        JOIN addresses addr ON cr.residential_address_id = addr.id
        LEFT JOIN driving_license_levels dl ON cr.driving_license_level = dl.level_code
        JOIN education_levels el ON cr.education_level = el.level_code
        LEFT JOIN school_branches sb ON cr.school_branch_id = sb.branch_id`;
    
    const result = await pool.query(query);
    return result.rows;
};

exports.getRegistrationById = async (id) => {
    const query = `
        SELECT cr.*, 
               u.first_name, u.last_name, u.email,
               ec.full_name as emergency_contact_name,
               ec.phone_number as emergency_contact_phone,
               addr.state, addr.zone, addr.woreda, addr.city, addr.kebele,
               dl.description as license_description,
               el.description as education_description,
               sb.city as branch_name
        FROM course_registrations cr
        JOIN users u ON cr.user_id = u.id
        JOIN emergency_contacts ec ON cr.emergency_contact_id = ec.id
        JOIN addresses addr ON cr.residential_address_id = addr.id
        LEFT JOIN driving_license_levels dl ON cr.driving_license_level = dl.level_code
        JOIN education_levels el ON cr.education_level = el.level_code
        LEFT JOIN school_branches sb ON cr.school_branch_id = sb.branch_id
        WHERE cr.id = $1`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

exports.updateRegistration = async (id, data, files) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const uploadedFiles = {};
        for (const key in files) {
            const file = files[key][0];
            uploadedFiles[`${key}_url`] = await s3Uploader.uploadToS3(file);
        }

        // Get existing registration
        const regRes = await client.query(
            'SELECT * FROM course_registrations WHERE id = $1',
            [id]
        );
        if (!regRes.rows[0]) throw new Error('Registration not found');
        const reg = regRes.rows[0];

        // Update related entities
        await client.query(
            `UPDATE users SET 
             first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             email = COALESCE($3, email),
             phone_number = COALESCE($4, phone_number)
             WHERE id = $5`,
            [data.first_name, data.last_name, data.email, 
             data.phone_number, reg.user_id]
        );

        await client.query(
            `UPDATE emergency_contacts SET
             full_name = COALESCE($1, full_name),
             phone_number = COALESCE($2, phone_number)
             WHERE id = $3`,
            [data.emergency_contact_name, 
             data.emergency_contact_phone, reg.emergency_contact_id]
        );

        await client.query(
            `UPDATE addresses SET
             state = COALESCE($1, state),
             zone = COALESCE($2, zone),
             woreda = COALESCE($3, woreda),
             city = COALESCE($4, city),
             kebele = COALESCE($5, kebele)
             WHERE id = $6`,
            [data.state, data.zone, data.woreda,
             data.city, data.kebele, reg.residential_address_id]
        );

        // Update registration
        const updateRes = await client.query(
            `UPDATE course_registrations SET
             age = COALESCE($1, age),
             sex = COALESCE($2, sex),
             education_level = COALESCE($3, education_level),
             driving_license_level = COALESCE($4, driving_license_level),
             school_branch_id = COALESCE($5, school_branch_id),
             national_id_url = COALESCE($6, national_id_url),
             educational_certificate_url = COALESCE($7, educational_certificate_url),
             medical_report_url = COALESCE($8, medical_report_url),
             user_image_url = COALESCE($9, user_image_url),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $10 RETURNING *`,
            [
                data.age, data.sex, data.education_level,
                data.driving_license_level, data.school_branch_id,
                uploadedFiles.national_id_url || reg.national_id_url,
                uploadedFiles.educational_certificate_url || reg.educational_certificate_url,
                uploadedFiles.medical_report_url || reg.medical_report_url,
                uploadedFiles.user_image_url || reg.user_image_url,
                id
            ]
        );

        await client.query('COMMIT');
        return updateRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.deleteRegistration = async (id) => {
    const result = await pool.query(
        'DELETE FROM course_registrations WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

