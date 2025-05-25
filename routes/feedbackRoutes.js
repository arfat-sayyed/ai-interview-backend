const express = require('express');
const router = express.Router();
const { getFeedback } = require('../controllers/feedbackController');

// Get feedback for an interview
router.get('/:interviewId', getFeedback);

module.exports = router;