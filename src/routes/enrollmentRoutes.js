const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         student_id:
 *           type: integer
 *         course_id:
 *           type: integer
 *         enrollment_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         has_verified_payment:
 *           type: boolean
 *     ApprovalRequest:
 *       type: object
 *       required:
 *         - teacher_id
 *       properties:
 *         teacher_id:
 *           type: integer
 */

/**
 * @swagger
 * /api/enrollments/create/{courseId}:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the course to enroll in
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Already enrolled in this course
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/create/:courseId', authenticate, enrollmentController.createEnrollment);

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments (Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, enrollmentController.getAllEnrollments);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: Enrollment not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, enrollmentController.getEnrollmentById);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   put:
 *     summary: Update enrollment (Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enrollment'
 *     responses:
 *       200:
 *         description: Updated enrollment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: Enrollment not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, enrollmentController.updateEnrollment);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Delete enrollment (Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment deleted
 *       404:
 *         description: Enrollment not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, enrollmentController.deleteEnrollment);

/**
 * @swagger
 * /api/enrollments/course/{courseId}:
 *   get:
 *     summary: Get enrollments by course ID
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: No enrollments found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/course/:courseId', authenticate, enrollmentController.getEnrollmentsByCourseId);

/**
 * @swagger
 * /api/enrollments/admin/pending:
 *   get:
 *     summary: Get pending enrollments (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/admin/pending', authenticate, enrollmentController.getPendingEnrollments);

/**
 * @swagger
 * /api/enrollments/{id}/approve:
 *   post:
 *     summary: Approve enrollment (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovalRequest'
 *     responses:
 *       200:
 *         description: Enrollment approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Teacher ID required or missing payment
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/:id/approve', authenticate, enrollmentController.approveEnrollment);

/**
 * @swagger
 * /api/enrollments/{id}/reject:
 *   post:
 *     summary: Reject enrollment (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/:id/reject', authenticate, enrollmentController.rejectEnrollment);

module.exports = router;