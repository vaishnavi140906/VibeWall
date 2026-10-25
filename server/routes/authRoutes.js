const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, updatePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-password', protect, updatePassword);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
