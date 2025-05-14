const pool = require('../config/db');
const { uploadToS3 } = require('../utils/s3Uploader');
const pdf = require('pdf-parse');
const { getDocument } = require('pdfjs-dist/es5/build/pdf.js');
const extractStructuredContent = async (file) => {
  try {
    const data = new Uint8Array(file.data);
    const pdf = await getDocument(data).promise;
    let output = '';
    let currentListLevel = 0;
    let listStack = [];
    let currentSection = null;

    const groupItemsIntoLines = (items) => {
      items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
      const lines = [];
      let currentLine = null;
      
      for (const item of items) {
        const y = item.transform[5];
        if (!currentLine || Math.abs(currentLine.y - y) > 5) {
          currentLine = { y: y, items: [], x: item.transform[4] };
          lines.push(currentLine);
        }
        currentLine.items.push(item);
      }
      return lines;
    };

    const closeLists = () => {
      while (listStack.length > 0) {
        output += listStack.pop().type === 'ul' ? '</ul>' : '</ol>';
        currentListLevel--;
      }
    };

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = groupItemsIntoLines(content.items);

      for (const line of lines) {
        const firstItem = line.items[0];
        const fontSize = firstItem.transform[3];
        const lineText = line.items.map(item => item.str).join(' ');
        const isSection = /^(Lesson|Section) \d+:/.test(lineText);

        // Handle sections and headings
        if (isSection) {
          closeLists();
          currentSection = lineText.split(':')[0].replace(/\d+/, '').trim();
          output += `<h2 style="font-size:${fontSize}px">${lineText}</h2>`;
          continue;
        }

        // Handle lists
        const listMatch = lineText.match(/^(\s*)(•|\d+\.|o)\s/);
        if (listMatch) {
          const indent = line.x;
          const listType = listMatch[2] === '•' || listMatch[2] === 'o' ? 'ul' : 'ol';

          // Adjust list nesting
          while (listStack.length > 0 && indent < listStack[listStack.length - 1].indent - 5) {
            output += listStack.pop().type === 'ul' ? '</ul>' : '</ol>';
            currentListLevel--;
          }

          if (listStack.length === 0 || indent > listStack[listStack.length - 1].indent + 5) {
            listStack.push({ indent: indent, type: listType });
            output += listType === 'ul' ? '<ul>' : '<ol>';
            currentListLevel++;
          }

          const text = lineText.replace(/^(\s*)(•|\d+\.|o)\s/, '').trim();
          output += `<li>${text}</li>`;
        } else {
          closeLists();
          
          // Handle subheadings and content
          if (fontSize >= 16) {
            output += `<h2 style="font-size:${fontSize}px">${lineText}</h2>`;
          } else if (fontSize >= 14) {
            output += `<h3 style="font-size:${fontSize}px">${lineText}</h3>`;
          } else if (fontSize >= 12) {
            output += `<h4 style="font-size:${fontSize}px">${lineText}</h4>`;
          } else {
            output += `<p style="font-size:${fontSize}px">${lineText}</p>`;
          }
        }
      }
    }

    closeLists();
    return output;

  } catch (error) {
    console.error('Error extracting PDF content:', error);
    throw error;
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
        const values = [course_id, title, content, media_url, media_type, position];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Update other methods to remove document_url references
    async updateLesson(id, updates, file) {
       let { course_id, title, content, media_url, media_type, document_content, position } = updates;

if (file) {
    try {
        const dataBuffer = new Uint8Array(file.data);
        const data = await pdf(dataBuffer);
        document_content = await extractStructuredContent(file); // ✅ Safe to reassign now
    } catch (err) {
        console.error('PDF parsing error:', err);
        throw new Error('Failed to parse PDF file');
    }
}
const query = `
    UPDATE lessons
    SET course_id = $1, title = $2, content = $3, media_url = $4, media_type = $5, document_content = $6, position = $7
    WHERE id = $8 RETURNING *;
`;
const values = [course_id, title, content, media_url, media_type, document_content, position, id];

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
