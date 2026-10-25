const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { broadcastPostReaction, sendNotificationToUser } = require('../socket');

const VALID_REACTIONS = ['like', 'love', 'inspired', 'happy', 'curious', 'supportive'];

// @desc    Toggle or update reaction on a post
// @route   POST /api/posts/:postId/react
exports.toggleReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;

    if (!type || !VALID_REACTIONS.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reaction type. Must be one of: ${VALID_REACTIONS.join(', ')}`
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Check existing reaction by this user on this post
    const existingReaction = await Reaction.findOne({
      post: postId,
      user: req.user._id
    });

    let currentReactionType = null;

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction clicked again -> REMOVE reaction (toggle off)
        await Reaction.findByIdAndDelete(existingReaction._id);
        post.reactionCounts[type] = Math.max(0, (post.reactionCounts[type] || 1) - 1);
        currentReactionType = null;
      } else {
        // Different reaction clicked -> SWITCH reaction
        const oldType = existingReaction.type;
        existingReaction.type = type;
        await existingReaction.save();

        post.reactionCounts[oldType] = Math.max(0, (post.reactionCounts[oldType] || 1) - 1);
        post.reactionCounts[type] = (post.reactionCounts[type] || 0) + 1;
        currentReactionType = type;
      }
    } else {
      // New reaction
      await Reaction.create({
        post: postId,
        user: req.user._id,
        type
      });
      post.reactionCounts[type] = (post.reactionCounts[type] || 0) + 1;
      currentReactionType = type;

      // Notify post author if not reacting to own post
      if (post.author.toString() !== req.user._id.toString()) {
        const reactionLabels = {
          like: 'liked',
          love: 'loved',
          inspired: 'was inspired by',
          happy: 'smiled at',
          curious: 'is curious about',
          supportive: 'supported'
        };

        const notification = await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'reaction',
          post: post._id,
          reactionType: type,
          message: `@${req.user.username} ${reactionLabels[type] || 'reacted to'} your post.`
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate('sender', 'fullName username avatar')
          .populate('post', 'content');

        sendNotificationToUser(post.author, populatedNotification);
      }
    }

    post.markModified('reactionCounts');
    await post.save();

    // Broadcast reaction update to other users
    broadcastPostReaction(postId, post.reactionCounts, req.user._id, currentReactionType);

    res.status(200).json({
      success: true,
      reactionCounts: post.reactionCounts,
      userReaction: currentReactionType
    });
  } catch (error) {
    console.error('[Toggle Reaction Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating reaction.'
    });
  }
};
