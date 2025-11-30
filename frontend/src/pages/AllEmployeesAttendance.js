import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../store/slices/attendanceSlice';
import { getBestEmployees } from '../store/slices/dashboardSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import './AllEmployeesAttendance.css';

const AllEmployeesAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance, loading } = useSelector((state) => state.attendance);
  const { bestEmployees, loading: bestEmployeesLoading } = useSelector((state) => state.dashboard);
  const [showBestEmployees, setShowBestEmployees] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Only fetch on initial load, not when filters change
    dispatch(getAllAttendance({}));
    dispatch(getBestEmployees({ month, year }));
  }, [dispatch, month, year]);


  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    dispatch(getAllAttendance(filters));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      employeeId: '',
      startDate: '',
      endDate: '',
      status: ''
    };
    setFilters(clearedFilters);
    dispatch(getAllAttendance(clearedFilters));
  };

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
        <h1>All Employees Attendance</h1>
        <p>View and filter attendance records</p>
      </div>

      {/* Toggle Switch */}
      <div className="card">
        <div className="toggle-container">
          <label className="toggle-label">
            <span>Show Best Employees</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={showBestEmployees}
                onChange={(e) => setShowBestEmployees(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>
      </div>

      <div className="attendance-view-container">
        {/* Attendance Filters and Table */}
        <div className={`attendance-section ${showBestEmployees ? 'faded' : ''}`}>
          {/* Filters */}
          <div className="card">
            <h2>Filters</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={filters.employeeId}
                  onChange={handleFilterChange}
                  placeholder="e.g., EMP001"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handleApplyFilters}>
                Apply Filters
              </button>
              <button className="btn btn-secondary" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card">
            <h2>Attendance Records</h2>
            {loading ? (
              <LoadingSpinner />
            ) : allAttendance.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAttendance.map((attendance) => (
                      <tr key={attendance._id || attendance.id}>
                        <td>{formatDate(attendance.date)}</td>
                        <td>{attendance.userId?.employeeId || 'N/A'}</td>
                        <td>{attendance.userId?.name || 'N/A'}</td>
                        <td>{attendance.userId?.department || 'N/A'}</td>
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
              <p>No attendance records found.</p>
            )}
          </div>
        </div>

        {/* Best Employees Section */}
        {showBestEmployees && (
          <div className="best-employees-section">
            <div className="card fade-in">
              <div className="filters-section">
                <h2>Select Period</h2>
                <div className="filters-row">
                  <div className="filter-group">
                    <label htmlFor="month">Month</label>
                    <select
                      id="month"
                      value={month}
                      onChange={(e) => {
                        setMonth(parseInt(e.target.value));
                        dispatch(getBestEmployees({ month: parseInt(e.target.value), year }));
                      }}
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
                      onChange={(e) => {
                        setYear(parseInt(e.target.value));
                        dispatch(getBestEmployees({ month, year: parseInt(e.target.value) }));
                      }}
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

            {bestEmployeesLoading && showBestEmployees ? (
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
        )}
      </div>
    </div>
  );
};

export default AllEmployeesAttendance;

