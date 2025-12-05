import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [heatMapData, setHeatMapData] = useState(null);
  const [attendanceScore, setAttendanceScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    if (user?.role === 'employee') {
      fetchHeatMapData();
      fetchAttendanceScore();
    }
  }, [user, selectedYear]);

  const fetchHeatMapData = async () => {
    try {
      // Fetch data for last 6 months
      const response = await api.get(`/profile/attendance-heatmap?year=${selectedYear}`);
      setHeatMapData(response.data);
    } catch (error) {
      console.error('Failed to fetch heat map data:', error);
    }
  };

  const fetchAttendanceScore = async () => {
    try {
      const response = await api.get(`/profile/attendance-score?year=${selectedYear}`);
      setAttendanceScore(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch attendance score:', error);
      setLoading(false);
    }
  };

  const getHeatMapColor = (status) => {
    // Color scheme: green (present), yellow (late), red (absent), gray (no data)
    const lightColors = {
      present: '#4CAF50',    // Green
      late: '#FFC107',       // Yellow
      absent: '#F44336',     // Red
      'half-day': '#FF9800'  // Orange
    };
    
    const darkColors = {
      present: '#66BB6A',    // Lighter green for dark mode
      late: '#FFD54F',       // Lighter yellow for dark mode
      absent: '#EF5350',     // Lighter red for dark mode
      'half-day': '#FFA726'  // Lighter orange for dark mode
    };
    
    const colors = isDarkMode ? darkColors : lightColors;
    const noDataColor = isDarkMode ? '#2d3748' : '#EBEDF0';
    
    return colors[status] || noDataColor;
  };

  const generateMinimalHeatMap = useCallback(() => {
    if (!heatMapData) return { grid: [], monthLabels: [] };

    const today = new Date();
    const startDate = new Date();
    
    // Calculate start date for last 6 months
    startDate.setMonth(today.getMonth() - 6);
    
    startDate.setDate(1); // Start from first day of month
    startDate.setHours(0, 0, 0, 0);

    // Group dates by month (only up to current month)
    const months = [];
    const currentMonth = new Date(startDate);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    while (currentMonth <= todayMonth) {
      const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const monthName = currentMonth.toLocaleString('default', { month: 'short' });
      months.push({ key: monthKey, name: monthName, date: new Date(currentMonth) });
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    // Create grid: rows = days of week, columns = weeks
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grid = weekDays.map(() => []);

    // Fill grid with data (only up to today)
    const currentDate = new Date(startDate);
    const todayDate = new Date(today);
    todayDate.setHours(23, 59, 59, 999); // End of today
    
    while (currentDate <= todayDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];
      const attendance = heatMapData.data[dateStr];
      
      const status = attendance?.status || null;
      
      grid[dayOfWeek].push({
        date: dateStr,
        status,
        month: currentDate.getMonth()
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate month labels with proper column spans
    const monthLabels = [];
    let totalColumns = 0;
    
    months.forEach((month) => {
      const monthStart = new Date(month.date);
      const monthEnd = new Date(month.date);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of month
      
      // Count actual days in this month (only up to today if it's the current month)
      let daysInMonth = 0;
      const checkDate = new Date(monthStart);
      const endDate = monthEnd > todayDate ? todayDate : monthEnd;
      
      while (checkDate <= endDate) {
        daysInMonth++;
        checkDate.setDate(checkDate.getDate() + 1);
      }
      
      // Find the maximum number of columns for this month across all rows
      // This ensures the label spans correctly
      let maxColumnsForMonth = 0;
      grid.forEach(row => {
        let monthColumns = 0;
        row.forEach(cell => {
          if (cell && cell.date) {
            const cellDate = new Date(cell.date);
            const cellMonthKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}`;
            if (cellMonthKey === month.key) {
              monthColumns++;
            }
          }
        });
        maxColumnsForMonth = Math.max(maxColumnsForMonth, monthColumns);
      });
      
      // Use the actual days count, but ensure it matches the grid structure
      const columnCount = maxColumnsForMonth > 0 ? maxColumnsForMonth : daysInMonth;
      
      monthLabels.push({
        name: month.name,
        columnCount: columnCount,
        startColumn: totalColumns
      });
      
      totalColumns += columnCount;
    });

    return { grid, monthLabels };
  }, [heatMapData, isDarkMode]);


  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#8BC34A';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View your profile information and attendance statistics</p>
      </div>

      <div className="profile-container">
        <div className="card fade-in">
          <h2>Profile Information</h2>
          {user && (
            <div className="profile-info">
              <div className="info-item">
                <p><strong>Name:</strong> {user.name}</p>
              </div>
              <div className="info-item">
                <p><strong>Email:</strong> {user.email}</p>
              </div>
              <div className="info-item">
                <p><strong>Employee ID:</strong> {user.employeeId}</p>
              </div>
              <div className="info-item">
                <p><strong>Department:</strong> {user.department || 'N/A'}</p>
              </div>
              <div className="info-item">
                <p><strong>Role:</strong>
                  <span className={`badge badge-${user.role === 'manager' ? 'primary' : 'success'}`} style={{ marginLeft: '10px', border: '2px solid #000' }}>
                    {user.role}
                  </span>
                </p>
              </div>
              {user.lastLogin && (
                <div className="info-item">
                  <p><strong>Last Login:</strong> {formatDate(user.lastLogin)} at {new Date(user.lastLogin).toLocaleTimeString()}</p>
                </div>
              )}
              <div className="info-item" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {user?.role === 'employee' && (
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="profile-stats-container">
                <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="heatmap-header">
                    <h2>Attendance Heat Map</h2>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      Last 6 Months
                    </span>
                  </div>
                  {heatMapData && (() => {
                    const { grid, monthLabels } = generateMinimalHeatMap();
                    return (
                      <div className="minimal-heatmap-container">
                        <div className="minimal-heatmap-wrapper">
                          <div className="heatmap-grid-wrapper">
                            <div className="minimal-heatmap-grid">
                              {grid.map((row, rowIndex) => (
                                <div key={rowIndex} className="heatmap-row">
                                  {row.map((cell, cellIndex) => (
                                    <div
                                      key={cellIndex}
                                      className="minimal-heatmap-cell"
                                      style={{
                                        backgroundColor: getHeatMapColor(cell.status)
                                      }}
                                      title={cell.date ? `${formatDate(cell.date)}: ${cell.status || 'No data'}` : ''}
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                            <div className="heatmap-month-labels">
                              {monthLabels.map((month, index) => {
                                // Calculate width based on column count (16px cell + 3px gap)
                                const cellWidth = 16;
                                const gap = 3;
                                // Use consistent calculation: cells * cellWidth + gaps between cells
                                const width = (month.columnCount * cellWidth) + ((month.columnCount - 1) * gap);
                                return (
                                  <div 
                                    key={index} 
                                    className="month-label" 
                                    style={{ 
                                      width: `${width}px`, 
                                      flexShrink: 0,
                                      marginRight: index < monthLabels.length - 1 ? `${gap}px` : '0px'
                                    }}
                                  >
                                    {month.name}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="minimal-heatmap-legend">
                          <div className="legend-item">
                            <div className="legend-square" style={{ backgroundColor: '#4CAF50' }}></div>
                            <span>Present</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-square" style={{ backgroundColor: '#FFC107' }}></div>
                            <span>Late</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-square" style={{ backgroundColor: '#F44336' }}></div>
                            <span>Absent</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-square" style={{ backgroundColor: '#EBEDF0' }}></div>
                            <span>No Data</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="card fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="score-header">
                    <h2>Attendance Score</h2>
                    <div className="year-selector">
                      <label htmlFor="year">Year: </label>
                      <select
                        id="year"
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(parseInt(e.target.value));
                          setLoading(true);
                        }}
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 4 + i).map((y) => {
                          const currentYear = new Date().getFullYear();
                          const isFutureYear = y > currentYear;
                          return (
                            <option key={y} value={y} disabled={isFutureYear}>
                              {y}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  {attendanceScore && (
                    <div className="score-container">
                      <div className="score-circle-wrapper">
                        <div className="score-circle" style={{ borderColor: getScoreColor(attendanceScore.score) }}>
                          <div className="score-value" style={{ color: getScoreColor(attendanceScore.score) }}>
                            {attendanceScore.score.toFixed(1)}%
                          </div>
                        </div>
                        <div className="score-badge" style={{ backgroundColor: getScoreColor(attendanceScore.score) }}>
                          {getScoreLabel(attendanceScore.score)}
                        </div>
                      </div>
                      <div className="score-stats">
                        <div className="stat-box">
                          <div className="stat-value">{attendanceScore.present}</div>
                          <div className="stat-label">Present</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value">{attendanceScore.late}</div>
                          <div className="stat-label">Late</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value">{attendanceScore.absent}</div>
                          <div className="stat-label">Absent</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value">{attendanceScore.halfDay}</div>
                          <div className="stat-label">Half Day</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value">{attendanceScore.attendanceRate.toFixed(1)}%</div>
                          <div className="stat-label">Attendance Rate</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value">{attendanceScore.totalWorkingDays}</div>
                          <div className="stat-label">Working Days</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
