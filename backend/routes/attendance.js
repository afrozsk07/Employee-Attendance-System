const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

const router = express.Router();

// Helper function to get start and end of day
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @route   POST /api/attendance/checkin
// @desc    Check in for the day
// @access  Private (Employee)
router.post('/checkin', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Managers cannot check in' });
    }

    const today = new Date();
    const { start, end } = getDayBounds(today);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Determine if late (assuming 9 AM is standard check-in time)
    const checkInTime = new Date();
    const standardCheckIn = new Date(today);
    standardCheckIn.setHours(9, 0, 0, 0);
    const isLate = checkInTime > standardCheckIn;

    if (attendance) {
      attendance.checkInTime = checkInTime;
      attendance.status = isLate ? 'late' : 'present';
    } else {
      attendance = new Attendance({
        userId: req.user._id,
        date: today,
        checkInTime: checkInTime,
        status: isLate ? 'late' : 'present'
      });
    }

    await attendance.save();

    res.json({
      message: 'Checked in successfully',
      attendance: {
        id: attendance._id,
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out for the day
// @access  Private (Employee)
router.post('/checkout', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Managers cannot check out' });
    }

    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json({
      message: 'Checked out successfully',
      attendance: {
        id: attendance._id,
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        totalHours: attendance.totalHours,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get my attendance history
// @access  Private (Employee)
router.get('/my-history', auth, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000 })
], async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Use /api/attendance/all for manager access' });
    }

    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get monthly summary
// @access  Private (Employee)
router.get('/my-summary', auth, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000 })
], async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Use /api/attendance/summary for manager access' });
    }

    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const halfDay = attendance.filter(a => a.status === 'half-day').length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

    res.json({
      month,
      year,
      present,
      absent,
      late,
      halfDay,
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays: attendance.length
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee)
router.get('/today', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Use /api/attendance/today-status for manager access' });
    }

    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (!attendance) {
      return res.json({
        checkedIn: false,
        checkedOut: false,
        attendance: null
      });
    }

    res.json({
      checkedIn: !!attendance.checkInTime,
      checkedOut: !!attendance.checkOutTime,
      attendance: {
        id: attendance._id,
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status,
        totalHours: attendance.totalHours
      }
    });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all employees attendance
// @access  Private (Manager)
router.get('/all', auth, isManager, [
  query('employeeId').optional().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('status').optional().isIn(['present', 'absent', 'late', 'half-day'])
], async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;

    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.json({ attendance: [] });
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/employee/:id
// @desc    Get specific employee attendance
// @access  Private (Manager)
router.get('/employee/:id', auth, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let query = { userId: id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get team attendance summary
// @access  Private (Manager)
router.get('/summary', auth, isManager, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000 })
], async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    const summary = {
      month,
      year,
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      totalRecords: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: Math.round(attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) * 100) / 100
    };

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance to CSV
// @access  Private (Manager)
router.get('/export', auth, isManager, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('employeeId').optional().trim()
], async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.status(404).json({ message: 'Employee not found' });
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const csvWriter = createCsvWriter({
      header: [
        { id: 'date', title: 'Date' },
        { id: 'employeeId', title: 'Employee ID' },
        { id: 'name', title: 'Name' },
        { id: 'department', title: 'Department' },
        { id: 'checkInTime', title: 'Check In' },
        { id: 'checkOutTime', title: 'Check Out' },
        { id: 'status', title: 'Status' },
        { id: 'totalHours', title: 'Total Hours' }
      ]
    });

    const records = attendance.map(a => ({
      date: a.date.toISOString().split('T')[0],
      employeeId: a.userId.employeeId,
      name: a.userId.name,
      department: a.userId.department || 'N/A',
      checkInTime: a.checkInTime ? a.checkInTime.toISOString() : 'N/A',
      checkOutTime: a.checkOutTime ? a.checkOutTime.toISOString() : 'N/A',
      status: a.status,
      totalHours: a.totalHours || 0
    }));

    const csv = csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for all employees
// @access  Private (Manager)
router.get('/today-status', auth, isManager, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate('userId', 'name email employeeId department');

    const allEmployees = await User.find({ role: 'employee' });

    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = allEmployees.length - present;
    const late = attendance.filter(a => a.status === 'late').length;

    const absentEmployees = allEmployees.filter(emp => {
      return !attendance.some(a => a.userId._id.toString() === emp._id.toString());
    }).map(emp => ({
      id: emp._id,
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department
    }));

    res.json({
      date: today,
      totalEmployees: allEmployees.length,
      present,
      absent,
      late,
      absentEmployees
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

