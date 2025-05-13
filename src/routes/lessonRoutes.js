const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const fileUpload = require('../middleware/fileUpload');

/**
 * @swagger
 * /lessons/:
 *   post:
 *     summary: Create a new lesson with PDF content extraction
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *             properties:
 *               course_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               media_url:
 *                 type: string
 *               media_type:
 *                 type: string
 *                 enum: [video, document, presentation, other]
 *               position:
 *                 type: integer
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: PDF file for content extraction
 *     responses:
 *       201:
 *         description: Lesson created with extracted PDF content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Invalid input or PDF processing error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', fileUpload, lessonController.create);

/**
 * @swagger
 * /lessons/course/{courseId}:
 *   get:
 *     summary: Get all lessons for a course
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: List of lessons ordered by position
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 *       500:
 *         description: Internal server error
 */
router.get('/course/:courseId', lessonController.getAll);

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get a single lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', lessonController.getOne);

/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     summary: Update lesson details
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               media_url:
 *                 type: string
 *               media_type:
 *                 type: string
 *                 enum: [video, document, presentation, other]
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated lesson details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', lessonController.update);

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lesson ID
 *     responses:
 *       204:
 *         description: Lesson deleted successfully
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', lessonController.delete);

module.exports = router;