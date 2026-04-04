const express = require('express');
const { summarizeEmail } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// The user must be authenticated just in case this API becomes costly.
router.post('/summarize', protect, summarizeEmail);

module.exports = router;
