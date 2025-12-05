const express = require('express');
const { auth, isManager } = require('../middleware/auth');
const RegistrationRequest = require('../models/RegistrationRequest');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/registration-requests
// @desc    Get all pending registration requests
// @access  Private (Manager only)
router.get('/', auth, isManager, async (req, res) => {
  try {
    const requests = await RegistrationRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get registration requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/registration-requests/all
// @desc    Get all registration requests (including processed)
// @access  Private (Manager only)
router.get('/all', auth, isManager, async (req, res) => {
  try {
    const requests = await RegistrationRequest.find()
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get all registration requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/registration-requests/:id/approve
// @desc    Approve a registration request
// @access  Private (Manager only)
router.post('/:id/approve', auth, isManager, async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Registration request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Check if user or employee ID already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: request.email }, { employeeId: request.employeeId }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User or Employee ID already exists' });
    }

    // Create new user with already hashed password
    const user = new User({
      name: request.name,
      email: request.email,
      password: request.password, // Already hashed
      employeeId: request.employeeId,
      department: request.department,
      role: 'employee'
    });

    // Bypass password hashing since it's already hashed
    user.isModified = () => false;
    await user.save();

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ 
      message: 'Registration request approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/registration-requests/:id/reject
// @desc    Reject a registration request
// @access  Private (Manager only)
router.post('/:id/reject', auth, isManager, async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await RegistrationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Registration request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.rejectionReason = reason || 'No reason provided';
    await request.save();

    res.json({ message: 'Registration request rejected successfully' });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
