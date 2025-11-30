const express = require('express');
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/leave/apply
// @desc    Apply for leave (Employee)
// @access  Private (Employee)
router.post('/apply', auth, [
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('leaveType').isIn(['sick', 'vacation', 'personal', 'emergency', 'other']).withMessage('Valid leave type is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Managers cannot apply for leave' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, leaveType, reason } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const leave = new Leave({
      userId: req.user._id,
      startDate: start,
      endDate: end,
      leaveType,
      reason
    });

    await leave.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: {
        id: leave._id,
        startDate: leave.startDate,
        endDate: leave.endDate,
        leaveType: leave.leaveType,
        status: leave.status
      }
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leave/my-leaves
// @desc    Get my leave requests (Employee)
// @access  Private (Employee)
router.get('/my-leaves', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Use /api/leave/all for manager access' });
    }

    const leaves = await Leave.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leave/all
// @desc    Get all leave requests (Manager)
// @access  Private (Manager)
router.get('/all', auth, isManager, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('userId', 'name email employeeId department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/leave/:id/approve
// @desc    Approve leave request (Manager)
// @access  Private (Manager)
router.put('/:id/approve', auth, isManager, [
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = 'approved';
    leave.reviewedBy = req.user._id;
    leave.reviewComment = req.body.comment || '';
    leave.reviewedAt = new Date();

    await leave.save();

    res.json({
      message: 'Leave request approved',
      leave: {
        id: leave._id,
        status: leave.status,
        reviewComment: leave.reviewComment
      }
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/leave/:id/reject
// @desc    Reject leave request (Manager)
// @access  Private (Manager)
router.put('/:id/reject', auth, isManager, [
  body('comment').trim().notEmpty().withMessage('Rejection comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = 'rejected';
    leave.reviewedBy = req.user._id;
    leave.reviewComment = req.body.comment;
    leave.reviewedAt = new Date();

    await leave.save();

    res.json({
      message: 'Leave request rejected',
      leave: {
        id: leave._id,
        status: leave.status,
        reviewComment: leave.reviewComment
      }
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

