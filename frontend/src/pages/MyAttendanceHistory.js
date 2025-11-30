import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getMyHistory, getMySummary } from '../store/slices/attendanceSlice';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import './MyAttendanceHistory.css';

const MyAttendanceHistory = () => {
  const dispatch = useDispatch();
  const { myHistory, mySummary, loading } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getMyHistory({ month: selectedMonth, year: selectedYear }));
    dispatch(getMySummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  const getAttendanceForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return myHistory.find(a => {
      const attDate = new Date(a.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const attendance = getAttendanceForDate(date);
      if (attendance) {
        return `calendar-day-${attendance.status}`;
      }
    }
    return null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const selectedAttendance = getAttendanceForDate(selectedDate);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Attendance History</h1>
        <p>View your attendance records</p>
      </div>

      {/* Month/Year Selector */}
      <div className="card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      {mySummary && (
        <div className="stats-grid">
          <div className="stat-card success">
            <h3>Present</h3>
            <div className="value">{mySummary.present}</div>
          </div>
          <div className="stat-card danger">
            <h3>Absent</h3>
            <div className="value">{mySummary.absent}</div>
          </div>
          <div className="stat-card warning">
            <h3>Late</h3>
            <div className="value">{mySummary.late}</div>
          </div>
          <div className="stat-card primary">
            <h3>Total Hours</h3>
            <div className="value">{mySummary.totalHours || 0}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Calendar */}
        <div className="card">
          <h2>Calendar View</h2>
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileClassName={tileClassName}
            className="attendance-calendar"
          />
          <div style={{ marginTop: '20px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div><span className="legend present"></span> Present</div>
              <div><span className="legend absent"></span> Absent</div>
              <div><span className="legend late"></span> Late</div>
              <div><span className="legend half-day"></span> Half Day</div>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="card">
          <h2>Date Details</h2>
          {selectedAttendance ? (
            <div>
              <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
              <p><strong>Status:</strong> 
                <span className={`badge badge-${selectedAttendance.status}`} style={{ marginLeft: '10px' }}>
                  {selectedAttendance.status}
                </span>
              </p>
              {selectedAttendance.checkInTime && (
                <p><strong>Check In:</strong> {formatDateTime(selectedAttendance.checkInTime)}</p>
              )}
              {selectedAttendance.checkOutTime && (
                <p><strong>Check Out:</strong> {formatDateTime(selectedAttendance.checkOutTime)}</p>
              )}
              {selectedAttendance.totalHours && (
                <p><strong>Total Hours:</strong> {selectedAttendance.totalHours} hours</p>
              )}
            </div>
          ) : (
            <p>No attendance record for this date.</p>
          )}
        </div>
      </div>

      {/* Table View */}
      <div className="card">
        <h2>Attendance Table</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : myHistory.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {myHistory.map((attendance) => (
                  <tr key={attendance._id || attendance.id}>
                    <td>{formatDate(attendance.date)}</td>
                    <td>{attendance.checkInTime ? formatDateTime(attendance.checkInTime) : '-'}</td>
                    <td>{attendance.checkOutTime ? formatDateTime(attendance.checkOutTime) : '-'}</td>
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
        ) : (
          <p>No attendance records found for this month.</p>
        )}
      </div>
    </div>
  );
};

export default MyAttendanceHistory;

