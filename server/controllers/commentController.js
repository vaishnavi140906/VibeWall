const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { broadcastPostComment, sendNotificationToUser } = require('../socket');

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'fullName username avatar');

    res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching comments.'
    });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:postId/comments
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.'
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 1000 characters.'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim()
    });

    // Update post comments count
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true }
    );

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'fullName username avatar');

    // Notify post author if not their own comment
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        message: `@${req.user.username} commented on your post: "${content.trim().substring(0, 40)}${content.length > 40 ? '...' : ''}"`
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'fullName username avatar')
        .populate('post', 'content');

      sendNotificationToUser(post.author, populatedNotification);
    }

    // Real-time broadcast for feed update
    broadcastPostComment(postId, populatedComment, updatedPost.commentsCount);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: populatedComment,
      commentsCount: updatedPost.commentsCount
    });
  } catch (error) {
    console.error('[Create Comment Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding comment.'
    });
  }
};

// @desc    Delete comment (comment author or post author)
// @route   DELETE /api/posts/:postId/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Ownership check: must be author of comment or author of post
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to delete this comment.'
      });
    }

    await Comment.findByIdAndDelete(commentId);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
      commentsCount: Math.max(0, updatedPost.commentsCount)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting comment.'
    });
  }
};
