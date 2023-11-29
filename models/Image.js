const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('image', ImageSchema);
