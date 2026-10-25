const Bookmark = require('../models/Bookmark');
const Post = require('../models/Post');
const Reaction = require('../models/Reaction');

// @desc    Toggle bookmark for a post
// @route   POST /api/posts/:postId/bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      post: postId
    });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return res.status(200).json({
        success: true,
        message: 'Post removed from your saved bookmarks.',
        isBookmarked: false
      });
    } else {
      await Bookmark.create({
        user: req.user._id,
        post: postId
      });
      return res.status(200).json({
        success: true,
        message: 'Post saved to your bookmarks.',
        isBookmarked: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error toggling bookmark.'
    });
  }
};

// @desc    Get current user's saved posts (private to user)
// @route   GET /api/bookmarks
exports.getMyBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'post',
        populate: [
          { path: 'author', select: 'fullName username avatar' },
          { path: 'circle', select: 'name slug coverColor icon' },
          { path: 'dailyChallenge', select: 'title prompt category' }
        ]
      })
      .lean();

    const total = await Bookmark.countDocuments({ user: req.user._id });

    // Filter out any bookmarks whose posts may have been deleted
    const validBookmarks = bookmarks.filter(b => b.post !== null);
    const postIds = validBookmarks.map(b => b.post._id);

    // Fetch user reactions for these posts
    const userReactions = await Reaction.find({
      post: { $in: postIds },
      user: req.user._id
    }).lean();

    const reactionMap = {};
    userReactions.forEach(r => {
      reactionMap[r.post.toString()] = r.type;
    });

    const posts = validBookmarks.map(b => ({
      ...b.post,
      isBookmarked: true,
      userReaction: reactionMap[b.post._id.toString()] || null,
      savedAt: b.createdAt
    }));

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
      message: error.message || 'Error fetching saved posts.'
    });
  }
};
