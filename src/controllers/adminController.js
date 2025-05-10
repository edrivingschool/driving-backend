const adminService = require('../services/adminService');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const admin = await adminService.createAdmin(firstName, lastName, email, password);
        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const admin = await adminService.authenticateAdmin(email, password);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                adminId: admin.id,
                email: admin.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.status(200).json({
            message: 'Admin login successful',
            token,
            admin
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getPendingRegistrations = async (req, res) => {
    try {
        const data = await adminService.getPendingRegistrations();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pending registrations.' });
    }
};

exports.getRegistrationById = async (req, res) => {
    const id = req.params.id;
    try {
      console.log(id);
        const data = await adminService.getRegistrationById(id);
        console.log(data);

        if (!data) return res.status(404).json({ error: 'Registration not found.' });
        res.json(data);
    } catch (err) {

        res.status(500).json({ error: 'Failed to fetch registration.' });
    }
};

exports.verifyRegistration = async (req, res) => {
    const registrationId = req.params.id;
    const { status, remark } = req.body;
    const adminId = req.user.adminId;

    try {
        const result = await adminService.verifyRegistration(
          registrationId,
          status,
          remark || '',
          adminId
        );
        res.json(result);
      } catch (error) {
        
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await adminService.getAllCourses();
        res.status(200).json({ message: 'Courses fetched', data: courses });
    } catch (err) {
       
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
};