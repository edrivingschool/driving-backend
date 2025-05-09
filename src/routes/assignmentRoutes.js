const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/assignmentController');

const { authenticate } = require('../middleware/auth');

router.get('/teacher', authenticate, AssignmentController.getAssignedTeacher);

router.get('/students', authenticate, AssignmentController.getAssignedStudents);

module.exports = router;
