const Post = require('../models/Post');
const Circle = require('../models/Circle');
const DailyChallenge = require('../models/DailyChallenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const Bookmark = require('../models/Bookmark');
const { uploadToCloudinary, deleteFromCloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');
const { broadcastNewPost, broadcastPostDeleted } = require('../socket');

// @desc    Get all community posts with filters and pagination
// @route   GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.circle) {
      // Find circle by id or slug
      const circleDoc = await Circle.findOne({
        $or: [
          { slug: req.query.circle },
          ...(req.query.circle.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.query.circle }] : [])
        ]
      });
      if (circleDoc) {
        filter.circle = circleDoc._id;
      } else {
        return res.status(200).json({ success: true, posts: [], total: 0, page, pages: 0 });
      }
    }

    if (req.query.challenge) {
      filter.dailyChallenge = req.query.challenge;
    }

    if (req.query.search) {
      filter.content = { $regex: req.query.search, $options: 'i' };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName username avatar')
      .populate('circle', 'name slug coverColor icon')
      .populate('dailyChallenge', 'title prompt category')
      .lean();

    const total = await Post.countDocuments(filter);

    // If user is authenticated, attach their reaction and bookmark status for each post
    if (req.user) {
      const postIds = posts.map(p => p._id);
      const userReactions = await Reaction.find({
        post: { $in: postIds },
        user: req.user._id
      }).lean();

      const userBookmarks = await Bookmark.find({
        post: { $in: postIds },
        user: req.user._id
      }).lean();

      const reactionMap = {};
      userReactions.forEach(r => {
        reactionMap[r.post.toString()] = r.type;
      });

      const bookmarkMap = {};
      userBookmarks.forEach(b => {
        bookmarkMap[b.post.toString()] = true;
      });

      posts.forEach(p => {
        p.userReaction = reactionMap[p._id.toString()] || null;
        p.isBookmarked = Boolean(bookmarkMap[p._id.toString()]);
      });
    }

    res.status(200).json({
      success: true,
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching posts.'
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName username avatar bio')
      .populate('circle', 'name slug coverColor icon')
      .populate('dailyChallenge', 'title prompt category')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    if (req.user) {
      const reaction = await Reaction.findOne({ post: post._id, user: req.user._id });
      const bookmark = await Bookmark.findOne({ post: post._id, user: req.user._id });
      post.userReaction = reaction ? reaction.type : null;
      post.isBookmarked = Boolean(bookmark);
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching post details.'
    });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { content, circleId, challengeId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty.'
      });
    }

    if (content.trim().length > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Post content exceeds the 3000 character limit.'
      });
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      if (!isCloudinaryConfigured) {
        return res.status(503).json({
          success: false,
          message: 'Image upload requires Cloudinary configuration. You can publish text posts right now, or configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env.'
        });
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, 'vibewall/posts');
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    let verifiedCircleId = null;
    if (circleId) {
      const circleDoc = await Circle.findById(circleId);
      if (circleDoc) {
        verifiedCircleId = circleDoc._id;
        await Circle.findByIdAndUpdate(circleDoc._id, { $inc: { postCount: 1 } });
      }
    }

    let verifiedChallengeId = null;
    if (challengeId) {
      const challengeDoc = await DailyChallenge.findById(challengeId);
      if (challengeDoc) {
        verifiedChallengeId = challengeDoc._id;
      }
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      imageUrl,
      imagePublicId,
      circle: verifiedCircleId,
      dailyChallenge: verifiedChallengeId
    });

    if (verifiedChallengeId) {
      await ChallengeSubmission.create({
        challenge: verifiedChallengeId,
        post: post._id,
        user: req.user._id
      });
      await DailyChallenge.findByIdAndUpdate(verifiedChallengeId, { $inc: { submissionCount: 1 } });
    }

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'fullName username avatar')
      .populate('circle', 'name slug coverColor icon')
      .populate('dailyChallenge', 'title prompt category')
      .lean();

    populatedPost.userReaction = null;
    populatedPost.isBookmarked = false;

    // Real-time broadcast
    broadcastNewPost(populatedPost, verifiedCircleId);

    res.status(201).json({
      success: true,
      message: 'Post published successfully.',
      post: populatedPost
    });
  } catch (error) {
    console.error('[Create Post Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while publishing post.'
    });
  }
};

// @desc    Update post content (author only)
// @route   PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty.'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Authorization check
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own posts.'
      });
    }

    post.content = content.trim();
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'fullName username avatar')
      .populate('circle', 'name slug coverColor icon')
      .populate('dailyChallenge', 'title prompt category');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating post.'
    });
  }
};

// @desc    Delete post (author only)
// @route   DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Ownership check
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own posts.'
      });
    }

    // Delete image from Cloudinary if exists
    if (post.imagePublicId) {
      await deleteFromCloudinary(post.imagePublicId);
    }

    // Decrement circle count if associated
    if (post.circle) {
      await Circle.findByIdAndUpdate(post.circle, { $inc: { postCount: -1 } });
    }

    // Decrement daily challenge submission count if associated
    if (post.dailyChallenge) {
      await DailyChallenge.findByIdAndUpdate(post.dailyChallenge, { $inc: { submissionCount: -1 } });
      await ChallengeSubmission.deleteOne({ post: post._id });
    }

    // Delete comments, reactions, bookmarks
    await Comment.deleteMany({ post: post._id });
    await Reaction.deleteMany({ post: post._id });
    await Bookmark.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    // Emit real-time delete
    broadcastPostDeleted(post._id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting post.'
    });
  }
};
