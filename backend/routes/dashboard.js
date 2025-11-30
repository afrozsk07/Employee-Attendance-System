const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');
const Leave = require('../models/Leave');

const router = express.Router();

// Helper function to get start and end of day
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper function to get start and end of month
const getMonthBounds = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Helper function to get start and end of week
const getWeekBounds = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard stats
// @access  Private (Employee)
router.get('/employee', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ message: 'Use /api/dashboard/manager for manager access' });
    }

    const today = new Date();
    const { start: todayStart, end: todayEnd } = getDayBounds(today);
    const { start: monthStart, end: monthEnd } = getMonthBounds(today);
    const { start: weekStart, end: weekEnd } = getWeekBounds(today);

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // This month's attendance
    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    // Recent attendance (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: todayEnd }
    }).sort({ date: -1 }).limit(7);

    // Calculate stats
    const present = monthAttendance.filter(a => a.status === 'present').length;
    const absent = monthAttendance.filter(a => a.status === 'absent').length;
    const late = monthAttendance.filter(a => a.status === 'late').length;
    const totalHours = Math.round(monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) * 100) / 100;

    res.json({
      todayStatus: {
        checkedIn: !!todayAttendance?.checkInTime,
        checkedOut: !!todayAttendance?.checkOutTime,
        status: todayAttendance?.status || 'absent',
        checkInTime: todayAttendance?.checkInTime,
        checkOutTime: todayAttendance?.checkOutTime
      },
      monthlyStats: {
        present,
        absent,
        late,
        totalHours
      },
      recentAttendance: recentAttendance.map(a => ({
        date: a.date,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        status: a.status,
        totalHours: a.totalHours
      }))
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard stats
// @access  Private (Manager)
router.get('/manager', auth, isManager, async (req, res) => {
  try {
    const today = new Date();
    const { start: todayStart, end: todayEnd } = getDayBounds(today);
    const { start: weekStart, end: weekEnd } = getWeekBounds(today);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd }
    }).populate('userId', 'name employeeId department');

    const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;

    // Absent employees today
    const allEmployees = await User.find({ role: 'employee' });
    const absentEmployees = allEmployees.filter(emp => {
      return !todayAttendance.some(a => a.userId._id.toString() === emp._id.toString());
    }).map(emp => ({
      id: emp._id,
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department
    }));

    // Weekly attendance trend (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo, $lte: todayEnd }
    });

    // Group by date
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const { start, end } = getDayBounds(date);
      
      const dayAttendance = weeklyAttendance.filter(a => {
        const aDate = new Date(a.date);
        return aDate >= start && aDate <= end;
      });

      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter(a => a.status === 'present' || a.status === 'late').length,
        absent: totalEmployees - dayAttendance.filter(a => a.status === 'present' || a.status === 'late').length,
        late: dayAttendance.filter(a => a.status === 'late').length
      });
    }

    // Department-wise attendance
    const departmentStats = {};
    allEmployees.forEach(emp => {
      const dept = emp.department || 'General';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { total: 0, present: 0 };
      }
      departmentStats[dept].total++;
      
      const empAttendance = todayAttendance.find(a => 
        a.userId._id.toString() === emp._id.toString()
      );
      if (empAttendance && (empAttendance.status === 'present' || empAttendance.status === 'late')) {
        departmentStats[dept].present++;
      }
    });

    const departmentWise = Object.keys(departmentStats).map(dept => ({
      department: dept,
      total: departmentStats[dept].total,
      present: departmentStats[dept].present,
      absent: departmentStats[dept].total - departmentStats[dept].present
    }));

    res.json({
      totalEmployees,
      todayStats: {
        present: presentToday,
        absent: absentToday,
        late: lateToday
      },
      absentEmployeesToday: absentEmployees,
      weeklyTrend,
      departmentWise
    });
  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/best-employees
// @desc    Get best employee stats (Manager)
// @access  Private (Manager)
router.get('/best-employees', auth, isManager, async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Get all employees
    const employees = await User.find({ role: 'employee' });

    // Get attendance for the month
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name email employeeId department');

    // Calculate stats for each employee
    const employeeStats = employees.map(emp => {
      const empAttendance = attendance.filter(a => 
        a.userId._id.toString() === emp._id.toString()
      );

      const present = empAttendance.filter(a => a.status === 'present').length;
      const late = empAttendance.filter(a => a.status === 'late').length;
      const absent = empAttendance.filter(a => a.status === 'absent').length;
      const totalHours = empAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

      // Calculate score (Present = 1, Late = 0.7, Absent = 0)
      const workingDays = getWorkingDaysInMonth(targetYear, targetMonth);
      const score = workingDays > 0 
        ? ((present * 1 + late * 0.7) / workingDays) * 100 
        : 0;

      return {
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        present,
        late,
        absent,
        totalHours: Math.round(totalHours * 100) / 100,
        score: Math.round(score * 100) / 100,
        attendanceRate: workingDays > 0 
          ? Math.round(((present + late) / workingDays) * 100 * 100) / 100 
          : 0
      };
    });

    // Sort by score (descending)
    employeeStats.sort((a, b) => b.score - a.score);

    // Get top performers
    const topPerformers = employeeStats.slice(0, 5);

    res.json({
      month: targetMonth,
      year: targetYear,
      topPerformers,
      allEmployees: employeeStats
    });
  } catch (error) {
    console.error('Get best employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate working days in a month
function getWorkingDaysInMonth(year, month) {
  let workingDays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
}

module.exports = router;

