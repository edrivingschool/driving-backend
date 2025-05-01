const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const registrationController = require('../controllers/registrationController');

router.post(
    '/register',
    upload.fields([
        { name: 'national_id', maxCount: 1 },
        { name: 'educational_certificate', maxCount: 1 },
        { name: 'medical_report', maxCount: 1 },
        { name: 'user_image', maxCount: 1 }
    ]),
    registrationController.registerUser
);
router.get('/', registrationController.getAllRegistrations);
router.get('/:id', registrationController.getRegistrationById);
router.put('/:id', registrationController.updateRegistration);
router.delete('/:id', registrationController.deleteRegistration);

module.exports = router;
