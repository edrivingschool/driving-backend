const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.post('/signup', teacherController.signup);
router.post('/signin', teacherController.signin);
router.get('/', teacherController.getAllTeachers);
router.get('/:id', teacherController.getTeacherById);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
