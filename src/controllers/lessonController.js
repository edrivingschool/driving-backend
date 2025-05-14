const lessonService = require('../services/lessonService');

const lessonController = {
    async create(req, res) {
        try {
            const file = req.files?.document; // Assuming you're using express-fileupload
            const newLesson = await lessonService.createLesson(req.body, file);
            res.status(201).json(newLesson);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message || 'Failed to create lesson' });
        }
    },

    // Update other methods to remove document_url handling
    async update(req, res) {
        try {
            const file = req.files?.document; // Assuming you're using express-fileupload
            const updated = await lessonService.updateLesson(req.params.id, req.body , file);
            res.status(200).json(updated);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update lesson' });
        }
    },

    async getAll(req, res) {
        try {
            const lessons = await lessonService.getAllLessons(req.params.courseId);
            res.status(200).json(lessons);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch lessons' });
        }
    },

    async getOne(req, res) {
        try {
            const lesson = await lessonService.getLessonById(req.params.id);
            if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
            res.status(200).json(lesson);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch lesson' });
        }
    },

 

    async delete(req, res) {
        try {
            await lessonService.deleteLesson(req.params.id);
            res.status(204).send();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete lesson' });
        }
    },
};

module.exports = lessonController;
