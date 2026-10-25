const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, searchAll);

module.exports = router;
