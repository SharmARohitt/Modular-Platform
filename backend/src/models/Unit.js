const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Unit title is required'],
    trim: true
  },
  description: {
    type: String
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }]
}, { timestamps: true });

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
