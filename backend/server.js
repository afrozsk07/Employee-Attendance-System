const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// Simple CORS config for production
app.use(cors({
  origin: true, // Allow all origins in production (or specify your frontend URL)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/problem', require('./routes/problem'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/registration-requests', require('./routes/registrationRequests'));

app.get('/', (req, res) => {
  res.send('Employee Attendance System API - Backend is running.');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB immediately
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }
};

// Connect on startup
connectDB();

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

