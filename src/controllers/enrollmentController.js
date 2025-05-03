const enrollmentService = require('../services/enrollmentService');

exports.createEnrollment = async (req, res) => {
  try {
    // Get student_id from request body (sent by frontend)
    const { student_id } = req.body;

    // Fallback to authenticated user ID if not provided
    const studentId = student_id ? parseInt(student_id, 10) : req.user?.userId;

    // Validate studentId
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid or missing student ID' });
    }

    const courseId = req.params.courseId;

    const enrollment = await enrollmentService.createEnrollment(studentId, courseId);
    res.status(201).json(enrollment);
  } catch (err) {
    console.error('Enrollment Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getEnrollments = async (req, res) => {
    try {
        const studentId = req.user.id; // From decoded JWT
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
