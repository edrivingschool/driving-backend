// controllers/enrollmentController.js
const enrollmentService = require('../services/enrollmentService');

exports.createEnrollment = async (req, res) => {
    try {
        const studentId = req.user.userId; // From decoded JWT
        const courseId = req.params.courseId; // From URL

        const enrollment = await enrollmentService.createEnrollment(studentId, courseId);
        res.status(201).json(enrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getEnrollments = async (req, res) => {
    try {
        const studentId = req.user.userId; // From decoded JWT
        const enrollments = await enrollmentService.getEnrollmentsByStudentId(studentId);
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getEnrollmentById = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const enrollment = await enrollmentService.getEnrollmentById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.status(200).json(enrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateEnrollment = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const updatedEnrollment = await enrollmentService.updateEnrollment(enrollmentId, req.body);
        if (!updatedEnrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.status(200).json(updatedEnrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteEnrollment = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const deleted = await enrollmentService.deleteEnrollment(enrollmentId);
        if (!deleted) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.status(200).json({ message: 'Enrollment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await enrollmentService.getAllEnrollments();
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getEnrollmentsByCourseId = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const enrollments = await enrollmentService.getEnrollmentsByCourseId(courseId);
        if (!enrollments) {
            return res.status(404).json({ error: 'No enrollments found for this course' });
        }
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingEnrollments = async (req, res) => {
    try {
      const enrollments = await enrollmentService.getEnrollmentsByStatus('pending');
      res.json(enrollments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.approveEnrollment = async (req, res) => {
    try {
      const enrollmentId = req.params.id;
      const { teacher_id } = req.body;
  
      if (!teacher_id) {
        return res.status(400).json({ message: 'Teacher ID is required' });
      }
  
      const result = await enrollmentService.approveEnrollment(enrollmentId, teacher_id);
      res.json(result);
    } catch (error) {
      console.error('Error approving enrollment:', error);
      res.status(500).json({ message: error.message });
    }
  };
  exports.rejectEnrollment = async (req, res) => {
    try {
      const enrollmentId = req.params.id;
      const enrollment = await enrollmentService.rejectEnrollment(enrollmentId);
      res.json(enrollment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };