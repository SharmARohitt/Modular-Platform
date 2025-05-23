const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required']
  },
  type: {
    type: String,
    enum: ['mcq', 'fill-blank', 'text', 'audio'],
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'audio', 'none'],
      default: 'none'
    },
    url: String
  },
  points: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
