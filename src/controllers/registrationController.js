const registrationService = require('../services/registrationService');

exports.registerUser = async (req, res) => {
    try {
        const registration = await registrationService.register(
            req.body, 
            req.files
        );
        res.status(201).json(registration);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDocumentStatus = async (req, res) => {
    const userId = req.user.userId;
    console.log('User ID:', userId);

    try {
        const statusInfo = await registrationService.getDocumentVerificationStatus(userId);
        if (statusInfo.status === 'not_found') {
            return res.status(404).json({ message: 'Document verification status not found for this user.' });
        }

        res.status(200).json({
            message: 'Document verification status retrieved successfully.',
            data: statusInfo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const registrations = await registrationService.getAllRegistrations();
        res.status(200).json(registrations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const registration = await registrationService.getRegistrationById(
            req.params.id
        );
        registration ? res.json(registration) : res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updated = await registrationService.updateRegistration(
            req.params.id,
            req.body,
            req.files
        );
        updated ? res.json(updated) : res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deleted = await registrationService.deleteRegistration(req.params.id);
        deleted ? res.json({ message: 'Deleted' }) : res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};