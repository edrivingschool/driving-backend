const authService = require('../services/authService');

const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await authService.createUser(firstName, lastName, email, phoneNumber, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.signin = async (req, res) => {
    const { identifier, password } = req.body; // identifier = email or phone number

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
    }

    try {
        const user = await authService.authenticateUser(identifier, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json(user); // or add JWT here if needed
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.signin = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
    }

    try {
        const user = await authService.authenticateUser(identifier, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: 'student'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await authService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await authService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};