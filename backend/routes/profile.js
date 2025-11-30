const express = require('express');
const Attendance = require('../models/Attendance');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/profile/attendance-heatmap
// @desc    Get attendance heat map data (Employee)
// @access  Private (Employee)
router.get('/attendance-heatmap', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'This endpoint is for employees only' });
    }

    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    // Get all attendance records for the year
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Create heat map data (date -> status)
    const heatMapData = {};
    attendance.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      heatMapData[dateStr] = {
        status: record.status,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        totalHours: record.totalHours
      };
    });

    res.json({
      year: targetYear,
      data: heatMapData,
      totalDays: attendance.length
    });
  } catch (error) {
    console.error('Get heat map error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/profile/attendance-score
// @desc    Get attendance score (Employee)
// @access  Private (Employee)
router.get('/attendance-score', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'This endpoint is for employees only' });
    }

    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    // Get all attendance records for the year
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate working days (excluding weekends)
    const totalWorkingDays = getWorkingDaysInYear(targetYear);
    const present = attendance.filter(a => a.status === 'present').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const halfDay = attendance.filter(a => a.status === 'half-day').length;

    // Calculate score (Present = 1, Late = 0.7, Half-day = 0.5, Absent = 0)
    const score = (present * 1 + late * 0.7 + halfDay * 0.5) / totalWorkingDays * 100;
    const attendanceRate = ((present + late + halfDay) / totalWorkingDays) * 100;

    res.json({
      year: targetYear,
      score: Math.round(score * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      present,
      late,
      absent,
      halfDay,
      totalWorkingDays,
      totalDays: attendance.length
    });
  } catch (error) {
    console.error('Get attendance score error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate working days in a year
function getWorkingDaysInYear(year) {
  let workingDays = 0;
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
  }
  return workingDays;
}

module.exports = router;

