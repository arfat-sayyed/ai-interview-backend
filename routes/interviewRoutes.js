const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  startInterview, 
  getInterview, 
  endInterview 
} = require('../controllers/interviewController');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Routes
router.post('/start', upload.single('resume'), startInterview);
router.get('/:id', getInterview);
router.post('/:id/end', endInterview);

module.exports = router;