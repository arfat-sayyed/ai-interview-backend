const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');

// Send a message
router.post('/:interviewId', sendMessage);

// Get all messages for an interview
router.get('/:interviewId', getMessages);

module.exports = router;