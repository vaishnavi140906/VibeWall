const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true
    },
    prompt: {
      type: String,
      required: [true, 'Challenge prompt is required'],
      trim: true
    },
    category: {
      type: String,
      default: 'Creativity'
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    active: {
      type: Boolean,
      default: true
    },
    submissionCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

dailyChallengeSchema.index({ date: -1 });

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
