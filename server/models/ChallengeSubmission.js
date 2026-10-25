const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyChallenge',
      required: true,
      index: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

challengeSubmissionSchema.index({ challenge: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);
