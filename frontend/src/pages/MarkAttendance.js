import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodayStatus, checkIn, checkOut } from '../store/slices/attendanceSlice';
import { formatDate, formatDateTime } from '../utils/dateFormatter';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayStatus, loading, error } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    try {
      await dispatch(checkIn()).unwrap();
      dispatch(getTodayStatus());
      alert('Checked in successfully!');
    } catch (error) {
      alert(error || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await dispatch(checkOut()).unwrap();
      dispatch(getTodayStatus());
      alert('Checked out successfully!');
    } catch (error) {
      alert(error || 'Failed to check out');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Check in and check out for today</p>
      </div>

      <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Today's Attendance</h2>
        {error && <div className="error slide-in">{error}</div>}
        
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner spinner-medium">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Loading...</p>
          </div>
        ) : (
          <>
            {todayStatus ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Date:</strong> {formatDate(todayStatus.date || new Date())}</p>
                  <p><strong>Status:</strong> 
                    <span className={`badge badge-${todayStatus.status}`} style={{ marginLeft: '10px' }}>
                      {todayStatus.status}
                    </span>
                  </p>
                  {todayStatus.checkInTime && (
                    <p><strong>Check In Time:</strong> {formatDateTime(todayStatus.checkInTime)}</p>
                  )}
                  {todayStatus.checkOutTime && (
                    <p><strong>Check Out Time:</strong> {formatDateTime(todayStatus.checkOutTime)}</p>
                  )}
                  {todayStatus.totalHours && (
                    <p><strong>Total Hours:</strong> {todayStatus.totalHours} hours</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {!todayStatus.checkInTime && (
                    <button className="btn btn-success" onClick={handleCheckIn} disabled={loading}>
                      Check In
                    </button>
                  )}
                  {todayStatus.checkInTime && !todayStatus.checkOutTime && (
                    <button className="btn btn-danger" onClick={handleCheckOut} disabled={loading}>
                      Check Out
                    </button>
                  )}
                  {todayStatus.checkOutTime && (
                    <p style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Attendance completed for today</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p>You haven't checked in today.</p>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button className="btn btn-success" onClick={handleCheckIn} disabled={loading}>
                    Check In Now
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;

