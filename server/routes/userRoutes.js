const express = require('express');
const router = express.Router();
const { getProfileByUsername, updateProfile, uploadAvatar, getUserPosts } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/:username', getProfileByUsername);
router.get('/:username/posts', getUserPosts);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
