import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBestEmployees } from '../store/slices/dashboardSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/dateFormatter';
import './BestEmployeeStats.css';

const BestEmployeeStats = () => {
  const dispatch = useDispatch();
  const { bestEmployees, loading } = useSelector((state) => state.dashboard);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getBestEmployees({ month, year }));
  }, [dispatch, month, year]);

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#8BC34A';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Best Employee Stats</h1>
        <p>Top performing employees based on attendance</p>
      </div>

      <div className="best-employees-container">
        <div className="card fade-in">
          <div className="filters-section">
            <h2>Select Period</h2>
            <div className="filters-row">
              <div className="filter-group">
                <label htmlFor="month">Month</label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(year, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="year">Year</label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : bestEmployees?.topPerformers?.length > 0 ? (
          <>
            <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
              <h2>🏆 Top 5 Performers</h2>
              <div className="top-performers-grid">
                {bestEmployees.topPerformers.map((emp, index) => (
                  <div key={emp.employeeId} className="performer-card" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                    <div className="performer-rank">#{index + 1}</div>
                    <div className="performer-info">
                      <h3>{emp.name}</h3>
                      <p className="performer-id">{emp.employeeId}</p>
                      <p className="performer-dept">{emp.department}</p>
                    </div>
                    <div className="performer-stats">
                      <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value" style={{ color: 'black' }}>
                          {emp.score.toFixed(1)}%
                        </span>
                        <span className="stat-badge" style={{ backgroundColor: getScoreColor(emp.score) }}>
                          {getScoreBadge(emp.score)}
                        </span>
                      </div>
                      <div className="stat-row">
                        <div className="stat-mini">
                          <span className="stat-mini-label">Present</span>
                          <span className="stat-mini-value">{emp.present}</span>
                        </div>
                        <div className="stat-mini">
                          <span className="stat-mini-label">Late</span>
                          <span className="stat-mini-value">{emp.late}</span>
                        </div>
                        <div className="stat-mini">
                          <span className="stat-mini-label">Absent</span>
                          <span className="stat-mini-value">{emp.absent}</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Hours</span>
                        <span className="stat-value">{emp.totalHours.toFixed(1)}h</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Attendance Rate</span>
                        <span className="stat-value">{emp.attendanceRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card fade-in" style={{ animationDelay: '0.6s' }}>
              <h2>All Employees Ranking</h2>
              <div className="all-employees-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Score</th>
                      <th>Present</th>
                      <th>Late</th>
                      <th>Absent</th>
                      <th>Total Hours</th>
                      <th>Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestEmployees.allEmployees.map((emp, index) => (
                      <tr key={emp.employeeId}>
                        <td>
                          <span className="rank-badge" style={{ backgroundColor: getScoreColor(emp.score) }}>
                            #{index + 1}
                          </span>
                        </td>
                        <td><strong>{emp.name}</strong></td>
                        <td>{emp.employeeId}</td>
                        <td>{emp.department}</td>
                        <td>
                          <span style={{ color: getScoreColor(emp.score), fontWeight: 'bold' }}>
                            {emp.score.toFixed(1)}%
                          </span>
                        </td>
                        <td>{emp.present}</td>
                        <td>{emp.late}</td>
                        <td>{emp.absent}</td>
                        <td>{emp.totalHours.toFixed(1)}h</td>
                        <td>{emp.attendanceRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="card fade-in">
            <p className="no-data">No employee data available for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestEmployeeStats;

