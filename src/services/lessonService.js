const pool = require('../config/db');

const lessonService = {
    async createLesson(lesson) {
        const { course_id, title, content, media_url, media_type, document_url, position } = lesson;
        const query = `
            INSERT INTO lessons (course_id, title, content, media_url, media_type, document_url, position)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [course_id, title, content, media_url, media_type, document_url, position];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async getAllLessons(courseId) {
        const { rows } = await pool.query(
            `SELECT * FROM lessons WHERE course_id = $1 ORDER BY position ASC;`,
            [courseId]
        );
        return rows;
    },

    async getLessonById(id) {
        const { rows } = await pool.query(`SELECT * FROM lessons WHERE id = $1;`, [id]);
        return rows[0];
    },

    async updateLesson(id, updates) {
        const { course_id, title, content, media_url, media_type, document_url, position } = updates;
        const query = `
            UPDATE lessons
            SET course_id = $1, title = $2, content = $3, media_url = $4,
                media_type = $5, document_url = $6, position = $7
            WHERE id = $8 RETURNING *;
        `;
        const values = [course_id, title, content, media_url, media_type, document_url, position, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async deleteLesson(id) {
        await pool.query(`DELETE FROM lessons WHERE id = $1;`, [id]);
    },
};

module.exports = lessonService;
