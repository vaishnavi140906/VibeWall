const mongoose = require('mongoose');

const circleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Circle name is required'],
      unique: true,
      trim: true,
      maxlength: [60, 'Circle name cannot exceed 60 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Circle description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Art and Design', 'Student Life', 'Photography', 'Music', 'Personal Growth', 'General'],
      default: 'General'
    },
    icon: {
      type: String,
      default: 'Compass'
    },
    coverColor: {
      type: String,
      default: 'from-violet-500 to-indigo-600'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    memberCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Circle', circleSchema);
