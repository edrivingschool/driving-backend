const teacherService = require('../services/teacherService');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const teacher = await teacherService.createTeacher(firstName, lastName, email, phoneNumber, password);
        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const teacher = await teacherService.authenticateTeacher(email, password);
        if (!teacher) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { teacherId: teacher.id, email: teacher.email, role: 'teacher' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.status(200).json({ message: 'Login successful', token, teacher });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await teacherService.getAllTeachers();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTeacherById = async (req, res) => {
    const { id } = req.params;
    try {
        const teacher = await teacherService.getTeacherById(id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber } = req.body;

    try {
        const updatedTeacher = await teacherService.updateTeacher(id, firstName, lastName, email, phoneNumber);
        if (!updatedTeacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json(updatedTeacher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteTeacher = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTeacher = await teacherService.deleteTeacher(id);
        if (!deletedTeacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
