const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  caption: {
    type: String
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commentCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Create a compound index
postSchema.index({ commentCount: 1, createdAt: 1 });

module.exports = mongoose.model('Post', postSchema);