const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/assignmentController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     TeacherAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         teacher_id:
 *           type: integer
 *         student_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         teacher_details:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             user_id:
 *               type: integer
 *             qualification:
 *               type: string
 *             created_at:
 *               type: string
 *               format: date-time
 *     StudentAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *         phone_number:
 *           type: string
 *         profile_picture:
 *           type: string
 */

/**
 * @swagger
 * /api/assignments/teacher:
 *   get:
 *     summary: Get assigned teacher for current student
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned teacher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teacher:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeacherAssignment'
 *       404:
 *         description: No teacher assigned yet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No teacher assigned yet
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/teacher', authenticate, AssignmentController.getAssignedTeacher);

/**
 * @swagger
 * /api/assignments/students:
 *   get:
 *     summary: Get assigned students for current teacher
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentAssignment'
 *       404:
 *         description: No students assigned yet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No students assigned yet
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/students', authenticate, AssignmentController.getAssignedStudents);

module.exports = router;