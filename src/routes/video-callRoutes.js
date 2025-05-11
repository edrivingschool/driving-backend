const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  authenticate,
  validateRoomAccess
} = require('../middleware/auth');
const videoCallController = require('../controllers/videoCallController');

router.post(
  '/create-room',
  authenticate,
  videoCallController.createRoom
);

router.post(
  '/initiate',
  authenticate,
  [
    body('receiverId').isString().trim().notEmpty(),
    body('roomName').optional().isString().trim()
  ],
  videoCallController.initiateCall
);

router.post(
  '/token',
  authenticate,
  [
    body('roomName').isString().trim().notEmpty()
  ],
  videoCallController.generateToken
);

module.exports = router;