const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'emergency', 'other'],
    default: 'personal'
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComment: {
    type: String,
    trim: true
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);

