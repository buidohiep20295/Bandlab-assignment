const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalFileId: {
    type: String,
    required: true
  },
  jpgFileId: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);