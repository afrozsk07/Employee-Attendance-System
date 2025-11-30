const express = require('express');
const { body, validationResult } = require('express-validator');
const ProblemReport = require('../models/ProblemReport');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/problem/report
// @desc    Submit a problem report (Employee)
// @access  Private (Employee)
router.post('/report', auth, [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').optional().isIn(['attendance', 'technical', 'account', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Managers cannot submit problem reports' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, description, category, priority } = req.body;

    const problemReport = new ProblemReport({
      userId: req.user._id,
      subject,
      description,
      category: category || 'other',
      priority: priority || 'medium'
    });

    await problemReport.save();

    res.status(201).json({
      message: 'Problem report submitted successfully',
      report: {
        id: problemReport._id,
        subject: problemReport.subject,
        status: problemReport.status,
        priority: problemReport.priority
      }
    });
  } catch (error) {
    console.error('Submit problem report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/problem/my-reports
// @desc    Get my problem reports (Employee)
// @access  Private (Employee)
router.get('/my-reports', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Use /api/problem/all for manager access' });
    }

    const reports = await ProblemReport.find({ userId: req.user._id })
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/problem/all
// @desc    Get all problem reports (Manager)
// @access  Private (Manager)
router.get('/all', auth, isManager, async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category;
    }

    const reports = await ProblemReport.find(query)
      .populate('userId', 'name email employeeId department')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/problem/:id/resolve
// @desc    Resolve a problem report (Manager)
// @access  Private (Manager)
router.put('/:id/resolve', auth, isManager, [
  body('resolution').trim().notEmpty().withMessage('Resolution is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = await ProblemReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Problem report not found' });
    }

    report.status = req.body.status || 'resolved';
    report.resolvedBy = req.user._id;
    report.resolution = req.body.resolution;
    report.resolvedAt = new Date();

    await report.save();

    res.json({
      message: 'Problem report resolved',
      report: {
        id: report._id,
        status: report.status,
        resolution: report.resolution
      }
    });
  } catch (error) {
    console.error('Resolve problem error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/problem/:id/update-status
// @desc    Update problem report status (Manager)
// @access  Private (Manager)
router.put('/:id/update-status', auth, isManager, [
  body('status').isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = await ProblemReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Problem report not found' });
    }

    report.status = req.body.status;
    if (req.body.status === 'resolved' || req.body.status === 'closed') {
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();
      if (req.body.resolution) {
        report.resolution = req.body.resolution;
      }
    }

    await report.save();

    res.json({
      message: 'Problem report status updated',
      report: {
        id: report._id,
        status: report.status
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

