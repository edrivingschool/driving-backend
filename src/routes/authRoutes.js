const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin); // 🔐 new route
router.get('/users/', authController.getAllUsers);
router.get('/users/:id', authController.getUserById);

module.exports = router;
