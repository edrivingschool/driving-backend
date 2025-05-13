const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         teacher_id:
 *           type: integer
 *         student_id:
 *           type: integer
 *         sent_by:
 *           type: string
 *           enum: [teacher, student]
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [text, image]
 *         created_at:
 *           type: string
 *           format: date-time
 *     MessageRequest:
 *       type: object
 *       required:
 *         - content
 *         - type
 *       properties:
 *         teacherId:
 *           type: integer
 *           description: Required if sending to a teacher
 *         studentId:
 *           type: integer
 *           description: Required if sending to a student
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [text, image]
 */

/**
 * @swagger
 * /api/message/create:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageRequest'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid teacher-student relationship
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/create', authenticate, messageController.sendMessage);

/**
 * @swagger
 * /api/message:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         description: Required if user is a student
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Required if user is a teacher
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing required parameters
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, messageController.getMessages);

/**
 * @swagger
 * /api/message/edit/{id}:
 *   put:
 *     summary: Edit a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/edit/:id', authenticate, messageController.editMessage);

/**
 * @swagger
 * /api/message/delete/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Message not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/delete/:id', authenticate, messageController.deleteMessage);

module.exports = router;