const mongoose = require('mongoose');

const circleMembershipSchema = new mongoose.Schema(
  {
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Circle',
      required: true,
      index: true
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

circleMembershipSchema.index({ circle: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('CircleMembership', circleMembershipSchema);
