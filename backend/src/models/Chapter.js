const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Chapter content is required']
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'none'],
      default: 'none'
    },
    url: String
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
