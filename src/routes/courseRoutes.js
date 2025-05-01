const express = require('express');
const courseController = require('../controllers/courseController');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage(); // ← use memory storage
const upload = multer({ storage });


router.post('/create/', upload.single('image'), courseController.createCourse);
router.put('/:id', upload.single('image'), courseController.updateCourse);

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.delete('/:id', courseController.deleteCourse);
module.exports = router;