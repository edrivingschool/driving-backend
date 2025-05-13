const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const registrationController = require('../controllers/registrationController');

router.post(
    '/create',
    upload.fields([
        { name: 'national_id', maxCount: 1 },
        { name: 'educational_certificate', maxCount: 1 },
        { name: 'medical_report', maxCount: 1 },
        { name: 'user_image', maxCount: 1 }
    ]),
    registrationController.registerUser
);

/*
 * @swagger
 * /api/register/create:
 *   post:
 *     summary: Create a new course registration
 *     tags: [Registrations]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               national_id:
 *                 type: string
 *                 format: binary
 *               educational_certificate:
 *                 type: string
 *                 format: binary
 *               medical_report:
 *                 type: string
 *                 format: binary
 *               user_image:
 *                 type: string
 *                 format: binary
 *               ... # Other form fields from RegistrationRequest schema
 *     responses:
 *       201:
 *         description: Registration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registration'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/register:
 *   get:
 *     summary: Get all registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', registrationController.getAllUsers);

/**
 * @swagger
 * /api/register/{id}:
 *   get:
 *     summary: Get registration by ID
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registration'
 *       404:
 *         description: Registration not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', registrationController.getUserById);

/**
 * @swagger
 * /api/register/{id}:
 *   put:
 *     summary: Update a registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ... # Same file and field properties as POST
 *     responses:
 *       200:
 *         description: Updated registration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registration'
 *       404:
 *         description: Registration not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', registrationController.updateUser);

/**
 * @swagger
 * /api/register/{id}:
 *   delete:
 *     summary: Delete a registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration deleted successfully
 *       404:
 *         description: Registration not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', registrationController.deleteUser);

module.exports = router;