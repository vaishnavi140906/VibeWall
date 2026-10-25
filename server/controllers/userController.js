const User = require('../models/User');
const Post = require('../models/Post');
const CircleMembership = require('../models/CircleMembership');
const { uploadToCloudinary, deleteFromCloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Get user profile by username
// @route   GET /api/users/:username
exports.getProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const postCount = await Post.countDocuments({ author: user._id });
    const circleCount = await CircleMembership.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      profile: {
        ...user.toPublicProfile(),
        postCount,
        circleCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile.'
    });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, interests } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (fullName) user.fullName = fullName.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (Array.isArray(interests)) {
      user.interests = interests.map(i => i.trim()).filter(Boolean);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile.'
    });
  }
};

// @desc    Upload profile avatar
// @route   POST /api/users/avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    if (!isCloudinaryConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Avatar upload requires Cloudinary credentials in server/.env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, 'vibewall/avatars');
    user.avatar = {
      url: result.url,
      publicId: result.publicId
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      avatar: user.avatar,
      user: user.toPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile photo.'
    });
  }
};

// @desc    Get user published posts
// @route   GET /api/users/:username/posts
exports.getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName username avatar')
      .populate('circle', 'name slug coverColor icon')
      .populate('dailyChallenge', 'title prompt');

    const total = await Post.countDocuments({ author: user._id });

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
      message: error.message || 'Error fetching user posts.'
    });
  }
};
