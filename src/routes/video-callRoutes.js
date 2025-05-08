const express = require('express');
const router = express.Router();
const { authenticate} = require('../middleware/auth');
const videoCallController = require('../controllers/videoCallController');

router.post('/video-call', authenticate, videoCallController.initiateCall);

module.exports = router;