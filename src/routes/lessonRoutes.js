const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const fileUpload = require('../middleware/fileUpload');

// Add file upload middleware to create route
router.post('/', fileUpload, lessonController.create);
router.get('/course/:courseId', lessonController.getAll);
router.get('/:id', lessonController.getOne);
router.put('/:id', lessonController.update);
router.delete('/:id', lessonController.delete);

module.exports = router;