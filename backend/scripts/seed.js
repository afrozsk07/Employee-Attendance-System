const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system');

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Create manager
    const manager = new User({
      name: 'John Morgan',
      email: 'manager@example.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management'
    });
    await manager.save();
    console.log('Created manager:', manager.email);

    // Create employees
    const employees = [
      // Engineering
      { name: 'Alice Johnson', email: 'alice@example.com', password: 'employee123', employeeId: 'EMP001', department: 'Engineering' },
      { name: 'Bob Smith', email: 'bob@example.com', password: 'employee123', employeeId: 'EMP002', department: 'Engineering' },
      { name: 'Xavier Reed', email: 'xavier@example.com', password: 'employee123', employeeId: 'EMP003', department: 'Engineering' },
      // HR
      { name: 'Eve Wilson', email: 'eve@example.com', password: 'employee123', employeeId: 'EMP004', department: 'HR' },
      { name: 'Kevin Lee', email: 'kevin@example.com', password: 'employee123', employeeId: 'EMP005', department: 'HR' },
      { name: 'Rachel Green', email: 'rachel@example.com', password: 'employee123', employeeId: 'EMP006', department: 'HR' },
      // Marketing
      { name: 'Diana Prince', email: 'diana@example.com', password: 'employee123', employeeId: 'EMP007', department: 'Marketing' },
      { name: 'Mona Evans', email: 'mona@example.com', password: 'employee123', employeeId: 'EMP008', department: 'Marketing' },
      { name: 'Sophie Turner', email: 'sophie@example.com', password: 'employee123', employeeId: 'EMP009', department: 'Marketing' },
      // Sales
      { name: 'Charlie Brown', email: 'charlie@example.com', password: 'employee123', employeeId: 'EMP010', department: 'Sales' },
      { name: 'Oscar Clark', email: 'oscar@example.com', password: 'employee123', employeeId: 'EMP011', department: 'Sales' },
      { name: 'Wendy Banks', email: 'wendy@example.com', password: 'employee123', employeeId: 'EMP012', department: 'Sales' },
      // Finance
      { name: 'Priya Kapoor', email: 'priya@example.com', password: 'employee123', employeeId: 'EMP013', department: 'Finance' },
      { name: 'George Stone', email: 'george@example.com', password: 'employee123', employeeId: 'EMP014', department: 'Finance' },
      { name: 'Isabel Diaz', email: 'isabel@example.com', password: 'employee123', employeeId: 'EMP015', department: 'Finance' }
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const employee = new User(empData);
      await employee.save();
      createdEmployees.push(employee);
      console.log('Created employee:', employee.email);
    }

    // Create attendance records for the last 30 days
    const today = new Date();
    const attendanceRecords = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      for (const employee of createdEmployees) {
        // Randomly decide if employee was present (80% chance)
        const isPresent = Math.random() > 0.2;

        if (isPresent) {
          // Random check-in time between 8:00 AM and 10:00 AM
          const checkInHour = 8 + Math.floor(Math.random() * 2);
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          // Determine if late (after 9:00 AM)
          const isLate = checkInTime.getHours() > 9 || 
                        (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 0);

          // Random check-out time between 5:00 PM and 7:00 PM
          const checkOutHour = 17 + Math.floor(Math.random() * 2);
          const checkOutMinute = Math.floor(Math.random() * 60);
          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

          const attendance = new Attendance({
            userId: employee._id,
            date: date,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            status: isLate ? 'late' : 'present'
          });

          attendanceRecords.push(attendance);
        } else {
          // Mark as absent
          const attendance = new Attendance({
            userId: employee._id,
            date: date,
            status: 'absent'
          });
          attendanceRecords.push(attendance);
        }
      }
    }

    // Insert attendance records in batches
    for (const record of attendanceRecords) {
      try {
        await record.save();
      } catch (error) {
        // Skip duplicate key errors
        if (error.code !== 11000) {
          console.error('Error saving attendance:', error);
        }
      }
    }

    console.log(`Created ${attendanceRecords.length} attendance records`);

    console.log('\n=== Seed Data Summary ===');
    console.log('Manager:');
    console.log('  Email: manager@example.com');
    console.log('  Password: manager123');
    console.log('\nEmployees:');
    employees.forEach(emp => {
      console.log(`  Email: ${emp.email}, Password: employee123`);
    });

    console.log('\nSeed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

