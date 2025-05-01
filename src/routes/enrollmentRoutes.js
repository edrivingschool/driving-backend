// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

router.post('/create/:courseId', authenticate, enrollmentController.createEnrollment);

router.get('/', authenticate, enrollmentController.getAllEnrollments);
router.get('/:id', authenticate, enrollmentController.getEnrollmentById);
router.put('/:id', authenticate, enrollmentController.updateEnrollment);
router.delete('/:id', authenticate, enrollmentController.deleteEnrollment);
router.get('/course/:courseId', authenticate, enrollmentController.getEnrollmentsByCourseId);


module.exports = router;
