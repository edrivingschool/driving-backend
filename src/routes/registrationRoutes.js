const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const registrationController = require('../controllers/registrationController');

router.post(
    '/create',
    upload.fields([
        { name: 'national_id', maxCount: 1 },
        { name: 'educational_certificate', maxCount: 1 },
        { name: 'medical_report', maxCount: 1 },
        { name: 'user_image', maxCount: 1 }
    ]),
    registrationController.registerUser
);

router.get('/', registrationController.getAllUsers);
router.get('/:id', registrationController.getUserById);
router.put('/:id', registrationController.updateUser);
router.delete('/:id', registrationController.deleteUser);

module.exports = router;