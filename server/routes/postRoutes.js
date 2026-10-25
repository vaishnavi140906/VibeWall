const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { toggleReaction } = require('../controllers/reactionController');
const { toggleBookmark } = require('../controllers/bookmarkController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Feed and single post
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Comments
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', protect, createComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

// Reactions
router.post('/:postId/react', protect, toggleReaction);

// Bookmark
router.post('/:postId/bookmark', protect, toggleBookmark);

module.exports = router;
