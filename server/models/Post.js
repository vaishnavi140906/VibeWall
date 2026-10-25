const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [3000, 'Post cannot exceed 3000 characters']
    },
    imageUrl: {
      type: String,
      default: null
    },
    imagePublicId: {
      type: String,
      default: null
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Circle',
      default: null,
      index: true
    },
    dailyChallenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyChallenge',
      default: null,
      index: true
    },
    reactionCounts: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      inspired: { type: Number, default: 0 },
      happy: { type: Number, default: 0 },
      curious: { type: Number, default: 0 },
      supportive: { type: Number, default: 0 }
    },
    commentsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
