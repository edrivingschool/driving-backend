const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {authenticate} = require('../middleware/auth');

router.post('/signup', adminController.signup);
router.post('/signin', adminController.signin);

router.get('/registrations/pending', authenticate, adminController.getPendingRegistrations);
router.get('/registration/:id', authenticate, adminController.getRegistrationById);
router.post('/registration/:id/verify', authenticate, adminController.verifyRegistration);
router.get('/course/all', adminController.getAllCourses);


module.exports = router;
