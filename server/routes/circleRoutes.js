const express = require('express');
const router = express.Router();
const {
  getCircles,
  getCircleBySlug,
  createCircle,
  joinCircle,
  leaveCircle,
  getMyCircles
} = require('../controllers/circleController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getCircles);
router.get('/my/joined', protect, getMyCircles);
router.get('/:slug', optionalAuth, getCircleBySlug);
router.post('/', protect, createCircle);
router.post('/:id/join', protect, joinCircle);
router.post('/:id/leave', protect, leaveCircle);

module.exports = router;
