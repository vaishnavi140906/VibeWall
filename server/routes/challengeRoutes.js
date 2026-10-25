const express = require('express');
const router = express.Router();
const { getTodayChallenge, getChallengeSubmissions } = require('../controllers/challengeController');
const { optionalAuth } = require('../middleware/auth');

router.get('/today', optionalAuth, getTodayChallenge);
router.get('/:id/submissions', getChallengeSubmissions);

module.exports = router;
