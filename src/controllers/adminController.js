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
