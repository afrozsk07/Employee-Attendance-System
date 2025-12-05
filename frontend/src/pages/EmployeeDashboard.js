import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTodayStatus, checkIn, checkOut } from '../store/slices/attendanceSlice';
import api from '../utils/api';
import { formatDate, formatTime, formatDateTime } from '../utils/dateFormatter';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { todayStatus } = useSelector((state) => state.attendance);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchDashboard();
    dispatch(getTodayStatus());
  }, [dispatch]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/employee');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await dispatch(checkIn()).unwrap();
      fetchDashboard();
      dispatch(getTodayStatus());
    } catch (error) {
      alert(error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await dispatch(checkOut()).unwrap();
      fetchDashboard();
      dispatch(getTodayStatus());
    } catch (error) {
      alert(error);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-spinner-container">
          <div className="spinner spinner-medium">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Employee Dashboard</p>
      </div>

      {/* Today's Status Card */}
      <div className="card fade-in">
        <h2>Today's Status</h2>
        {todayStatus ? (
          <div>
            <p><strong>Status:</strong> 
              <span className={`badge badge-${todayStatus.status}`} style={{ marginLeft: '10px' }}>
                {todayStatus.status}
              </span>
            </p>
            {todayStatus.checkInTime && (
              <p><strong>Check In:</strong> {formatDateTime(todayStatus.checkInTime)}</p>
            )}
            {todayStatus.checkOutTime && (
              <p><strong>Check Out:</strong> {formatDateTime(todayStatus.checkOutTime)}</p>
            )}
            {todayStatus.totalHours && (
              <p><strong>Total Hours:</strong> {todayStatus.totalHours} hours</p>
            )}
          </div>
        ) : (
          <p>Not checked in today</p>
        )}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          {!todayStatus?.checkInTime && (
            <button className="btn btn-success" onClick={handleCheckIn}>
              Check In
            </button>
          )}
          {todayStatus?.checkInTime && !todayStatus?.checkOutTime && (
            <button className="btn btn-danger" onClick={handleCheckOut}>
              Check Out
            </button>
          )}
        </div>
      </div>

      {/* Monthly Stats */}
      {dashboardData?.monthlyStats && (
        <div className="stats-grid">
          <div className="stat-card success" style={{ animationDelay: '0.1s' }}>
            <h3>Present Days</h3>
            <div className="value">{dashboardData.monthlyStats.present}</div>
          </div>
          <div className="stat-card danger" style={{ animationDelay: '0.2s' }}>
            <h3>Absent Days</h3>
            <div className="value">{dashboardData.monthlyStats.absent}</div>
          </div>
          <div className="stat-card warning" style={{ animationDelay: '0.3s' }}>
            <h3>Late Days</h3>
            <div className="value">{dashboardData.monthlyStats.late}</div>
          </div>
          <div className="stat-card primary" style={{ animationDelay: '0.4s' }}>
            <h3>Total Hours</h3>
            <div className="value">{dashboardData.monthlyStats.totalHours || 0}</div>
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      {dashboardData?.recentAttendance && dashboardData.recentAttendance.length > 0 && (
        <div className="card">
          <h2>Recent Attendance (Last 7 Days)</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentAttendance.map((attendance) => (
                  <tr key={attendance.date}>
                    <td>{formatDate(attendance.date)}</td>
                    <td>{attendance.checkInTime ? formatTime(attendance.checkInTime) : '-'}</td>
                    <td>{attendance.checkOutTime ? formatTime(attendance.checkOutTime) : '-'}</td>
                    <td>
                      <span className={`badge badge-${attendance.status}`}>
                        {attendance.status}
                      </span>
                    </td>
                    <td>{attendance.totalHours || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/my-attendance" className="btn btn-primary btn-animated btn-lg">
          <span>View Full Attendance History</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '8px' }}>
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

