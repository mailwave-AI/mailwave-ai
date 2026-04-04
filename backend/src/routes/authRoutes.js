const express = require('express');
const { googleAuthUrl, googleAuthCallback, getCurrentUser, logout } = require('../controllers/authController');

const router = express.Router();

router.get('/google', googleAuthUrl);
router.get('/google/callback', googleAuthCallback);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

module.exports = router;
