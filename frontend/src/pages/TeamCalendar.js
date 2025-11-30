import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../utils/api';
import { formatDate, formatTime } from '../utils/dateFormatter';
import './TeamCalendar.css';

const TeamCalendar = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchAttendance = React.useCallback(async () => {
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      
      const response = await api.get('/attendance/all', {
        params: { startDate, endDate }
      });
      setAttendance(response.data.attendance);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const getAttendanceForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendance.filter(a => {
      const attDate = new Date(a.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayAttendance = getAttendanceForDate(date);
      if (dayAttendance.length > 0) {
        const present = dayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
        const total = dayAttendance.length;
        return (
          <div style={{ fontSize: '10px', marginTop: '5px' }}>
            {present}/{total}
          </div>
        );
      }
    }
    return null;
  };

  const selectedDayAttendance = getAttendanceForDate(selectedDate);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Team Calendar View</h1>
        <p>View team attendance on calendar</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Calendar */}
        <div className="card">
          <h2>Calendar</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="team-calendar"
              />
              <div style={{ marginTop: '20px', fontSize: '14px' }}>
                <p><strong>Legend:</strong> Numbers show present/total employees for each day</p>
              </div>
            </>
          )}
        </div>

        {/* Selected Date Details */}
        <div className="card">
          <h2>Attendance for {formatDate(selectedDate)}</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : selectedDayAttendance.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayAttendance.map((att) => (
                    <tr key={att._id || att.id}>
                      <td>{att.userId?.employeeId || 'N/A'}</td>
                      <td>{att.userId?.name || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${att.status}`}>
                          {att.status}
                        </span>
                      </td>
                      <td>{att.checkInTime ? formatTime(att.checkInTime) : '-'}</td>
                      <td>{att.checkOutTime ? formatTime(att.checkOutTime) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No attendance records for this date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;

