const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedChapters: [{
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    },
    totalPossibleScore: {
      type: Number,
      default: 0
    },
    answers: [{
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      userAnswer: String,
      isCorrect: Boolean,
      pointsEarned: Number
    }]
  }],
  lastAccessedChapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  overallScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for faster querying by user and course
userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress;
