const express = require('express');
const router = express.Router();
const { getMyBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyBookmarks);

module.exports = router;
