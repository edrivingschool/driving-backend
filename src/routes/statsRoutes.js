const express = require('express');
const router = express.Router();
const {authenticate} = require('../middleware/auth');
const statsController = require('../controllers/statsController');

router.get('/dashboard', authenticate, statsController.getDashboardStats);

module.exports = router;
