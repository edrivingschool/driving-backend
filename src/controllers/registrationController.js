const registrationService = require('../services/registrationService');

exports.registerUser = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;

        const registration = await registrationService.register(data, files);
        res.status(201).json(registration);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await registrationService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await registrationService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        const files = req.files;

        const updatedUser = await registrationService.updateUser(userId, data, files);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await registrationService.deleteUser(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
