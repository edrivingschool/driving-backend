const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.post('/create', authenticate, messageController.sendMessage);
router.get('/:otherUserId', authenticate, messageController.getMessages);

module.exports = router;