const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

router.post('/', lessonController.create);
router.get('/course/:courseId', lessonController.getAll);
router.get('/:id', lessonController.getOne);
router.put('/:id', lessonController.update);
router.delete('/:id', lessonController.delete);

module.exports = router;
