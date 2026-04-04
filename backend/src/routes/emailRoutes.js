const express = require('express');
const { getInbox, sendEmail } = require('../controllers/emailController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/inbox', protect, getInbox);
router.post('/send', protect, sendEmail);

module.exports = router;
