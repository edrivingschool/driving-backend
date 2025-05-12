const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.post('/create', authenticate, messageController.sendMessage);
router.get('/', authenticate, messageController.getMessages);
router.put('/edit/:id', authenticate, messageController.editMessage);
router.delete('/delete/:id', authenticate, messageController.deleteMessage);


module.exports = router;