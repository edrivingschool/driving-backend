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
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }
  
    try {
      const authResult = await authService.authenticateUser(identifier, password);
      if (!authResult) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const { user, documentStatus } = authResult;
      const token = jwt.sign(
        {
          userId:      user.id,
          email:       user.email,
          phoneNumber: user.phoneNumber,
          role:        user.role || 'student'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
  
      return res.status(200).json({
        message:        'Login successful',
        token,
        user:           authResult  // or send back { user, documentStatus }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
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


exports.sendResetOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        await authService.sendOTP(email);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        const isValid = await authService.verifyOTP(email, otp);
        if (!isValid) return res.status(400).json({ error: 'Invalid or expired OTP' });

        res.status(200).json({ message: 'OTP verified' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await authService.resetPassword(email, otp, newPassword);
        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
