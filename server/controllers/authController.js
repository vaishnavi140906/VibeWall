const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');
const CircleMembership = require('../models/CircleMembership');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'vibewall_jwt_secret_token_key_dev_2026_community',
    { expiresIn: '7d' }
  );
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toPublicProfile()
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password, confirmPassword } = req.body;

    if (!fullName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All registration fields are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check existing username
    const usernameExists = await User.findOne({ username: cleanUsername });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password.'
      });
    }

    const identifier = usernameOrEmail.trim().toLowerCase();

    // Find user by email or username, explicitly selecting password
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during login.'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: user.toPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error.'
    });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// @desc    Update password
// @route   PUT /api/auth/update-password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required.'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating password.'
    });
  }
};

// @desc    Delete user account and cascade delete user data
// @route   DELETE /api/auth/delete-account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete your account.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect. Account deletion cancelled.'
      });
    }

    const userId = req.user._id;

    // Remove user content
    await Post.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });
    await Reaction.deleteMany({ user: userId });
    await Bookmark.deleteMany({ user: userId });
    await Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] });
    await CircleMembership.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({
      success: true,
      message: 'Your VibeWall account and associated data have been permanently deleted.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting account.'
    });
  }
};
