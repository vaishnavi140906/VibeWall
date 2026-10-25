const User = require('../models/User');
const Post = require('../models/Post');
const Circle = require('../models/Circle');

// @desc    Global search across users, posts, and circles
// @route   GET /api/search
exports.searchAll = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q) {
      return res.status(200).json({
        success: true,
        query: '',
        users: [],
        posts: [],
        circles: []
      });
    }

    const regex = new RegExp(q, 'i');

    const [users, posts, circles] = await Promise.all([
      User.find({
        $or: [{ username: regex }, { fullName: regex }]
      })
        .select('fullName username avatar bio createdAt')
        .limit(10),

      Post.find({ content: regex })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('author', 'fullName username avatar')
        .populate('circle', 'name slug coverColor icon'),

      Circle.find({
        $or: [{ name: regex }, { description: regex }, { category: regex }]
      })
        .limit(10)
    ]);

    res.status(200).json({
      success: true,
      query: q,
      users,
      posts,
      circles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error executing search.'
    });
  }
};
