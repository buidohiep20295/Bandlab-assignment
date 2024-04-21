const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

commentSchema.index({ postId: 1, createdAt: 1});

module.exports = mongoose.model('Comment', commentSchema);