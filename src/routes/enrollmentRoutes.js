// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

const upload = multer();

router.post(
  '/create/:courseId',
  upload.none(),            // 👈 This is required for text-only form data
  authenticate,
  createEnrollment
);

router.get('/', authenticate, enrollmentController.getAllEnrollments);
router.get('/:id', authenticate, enrollmentController.getEnrollmentById);
router.put('/:id', authenticate, enrollmentController.updateEnrollment);
router.delete('/:id', authenticate, enrollmentController.deleteEnrollment);
router.get('/course/:courseId', authenticate, enrollmentController.getEnrollmentsByCourseId);


module.exports = router;
