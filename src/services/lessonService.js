const pool = require('../config/db');
const { uploadToS3 } = require('../utils/s3Uploader');
const pdf = require('pdf-parse');
const { getDocument } = require('pdfjs-dist/es5/build/pdf.js');

const extractStructuredContent = async (file) => {
  try {
    const data = new Uint8Array(file.data);
    const pdf = await getDocument(data).promise;
    let output = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      content.items.forEach((item) => {
        // Detect headings by font size
        const fontSize = item.transform[3];
        if (fontSize >= 16) {
          output += `<h2 style="font-size:${fontSize}px">${item.str}</h2>`;
        } else if (fontSize >= 12) {
          output += `<h3 style="font-size:${fontSize}px">${item.str}</h3>`;
        } else {
          output += `<p style="font-size:${fontSize}px; font-family:${item.fontName}">${item.str}</p>`;
        }
        
        // Preserve newlines
        if (item.hasEOL) output += '<br/>';
      });
    }
    
    return output;

  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error('Failed to parse PDF file');
  }
};


const lessonService = {
    
    async createLesson(lessonData, file) {
        const { course_id, title, content, media_url, media_type, position } = lessonData;
        let document_content = '';

        // Extract text from PDF if file exists
        if (file) {
            try {
                // Convert the file buffer to Uint8Array
                const dataBuffer = new Uint8Array(file.data);
                const data = await pdf(dataBuffer);
document_content = await extractStructuredContent(file);
            } catch (err) {
                console.error('PDF parsing error:', err);
                throw new Error('Failed to parse PDF file');
            }
        }
        const query = `
            INSERT INTO lessons (course_id, title, content, media_url, media_type, document_content, position)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [course_id, title, content, media_url, media_type, document_content, position];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Update other methods to remove document_url references
    async updateLesson(id, updates) {
        const { course_id, title, content, media_url, media_type, position } = updates;
        const query = `
            UPDATE lessons
            SET course_id = $1, title = $2, content = $3, media_url = $4,
                media_type = $5, position = $6
            WHERE id = $7 RETURNING *;
        `;
        const values = [course_id, title, content, media_url, media_type, position, id];
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

  

    async deleteLesson(id) {
        await pool.query(`DELETE FROM lessons WHERE id = $1;`, [id]);
    },
};

module.exports = lessonService;
