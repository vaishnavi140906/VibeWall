const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['reaction', 'comment', 'circle_post', 'system'],
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Circle',
      default: null
    },
    reactionType: {
      type: String,
      default: null
    },
    read: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
