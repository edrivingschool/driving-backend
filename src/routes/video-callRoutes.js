const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const videoCallController = require('../controllers/videoCallController');

router.post('/video-call',
  authenticate,
  body('receiverId').notEmpty().isString().trim().escape(),
  validateRequest,
  videoCallController.initiateCall
);

module.exports = router;