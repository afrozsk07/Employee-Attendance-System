import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Pagination from '../components/Pagination';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination state for absent employees
  const [absentPage, setAbsentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/manager');
      const data = response.data;
      
      // Format dates in weekly trend to DD-MM-YYYY
      if (data.weeklyTrend) {
        data.weeklyTrend = data.weeklyTrend.map(item => ({
          ...item,
          date: formatDate(item.date)
        }));
      }
      
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setLoading(false);
    }
  };


  
  // Pagination calculations for absent employees
  const absentEmployees = dashboardData?.absentEmployeesToday || [];
  const paginatedAbsentEmployees = absentEmployees.slice(
    (absentPage - 1) * itemsPerPage,
    absentPage * itemsPerPage
  );
  const absentTotalPages = Math.ceil(absentEmployees.length / itemsPerPage);
  
  // Custom tooltip for better formatting with dark mode support
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Define colors for each data type to match the chart
      const getColorForEntry = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName === 'present') return '#4CAF50'; // Green
        if (lowerName === 'absent') return '#F44336'; // Red
        if (lowerName === 'late') return '#FFC107'; // Yellow
        return '#666'; // Default
      };

      return (
        <div 
          style={{
            backgroundColor: isDarkMode ? '#1a1f2e' : '#ffffff',
            padding: '14px 16px',
            border: isDarkMode ? '2px solid #4a5568' : '2px solid #d1d5db',
            borderRadius: '10px',
            boxShadow: isDarkMode 
              ? '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '180px',
            zIndex: 9999
          }}
        >
          <div style={{ 
            margin: '0 0 10px 0', 
            fontWeight: '700',
            fontSize: '15px',
            color: isDarkMode ? '#ffffff !important' : '#1a202c',
            borderBottom: isDarkMode ? '2px solid #4a5568' : '2px solid #e5e7eb',
            paddingBottom: '8px',
            letterSpacing: '0.3px'
          }}>
            {label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {payload.map((entry, index) => {
              const displayColor = getColorForEntry(entry.name);
              return (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '4px 0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      backgroundColor: displayColor,
                      borderRadius: '3px',
                      boxShadow: isDarkMode 
                        ? `0 0 8px ${displayColor}60` 
                        : `0 2px 4px ${displayColor}40`,
                      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                      flexShrink: 0
                    }}></span>
                    <span style={{ 
                      fontSize: '13px',
                      color: isDarkMode ? '#e2e8f0 !important' : '#4b5563',
                      fontWeight: '500'
                    }}>
                      {entry.name}
                    </span>
                  </div>
                  <strong style={{ 
                    fontSize: '15px',
                    color: isDarkMode ? '#ffffff !important' : '#1a202c',
                    fontWeight: '700',
                    minWidth: '30px',
                    textAlign: 'right'
                  }}>
                    {entry.value}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
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
        <p>Manager Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary" style={{ animationDelay: '0.1s' }}>
          <h3>Total Employees</h3>
          <div className="value">{dashboardData?.totalEmployees || 0}</div>
        </div>
        <div className="stat-card success" style={{ animationDelay: '0.2s' }}>
          <h3>Present Today</h3>
          <div className="value">{dashboardData?.todayStats?.present || 0}</div>
        </div>
        <div className="stat-card danger" style={{ animationDelay: '0.3s' }}>
          <h3>Absent Today</h3>
          <div className="value">{dashboardData?.todayStats?.absent || 0}</div>
        </div>
        <div className="stat-card warning" style={{ animationDelay: '0.4s' }}>
          <h3>Late Today</h3>
          <div className="value">{dashboardData?.todayStats?.late || 0}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Weekly Trend - Line Chart (Original Style) */}
        {dashboardData?.weeklyTrend && (
          <div className="card fade-in" style={{ animationDelay: '0.5s' }}>
            <h2 style={{ marginBottom: '20px' }}>📈 Weekly Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dashboardData.weeklyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#3d4451' : '#e0e0e0'} 
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: isDarkMode ? '#cbd5e0' : '#666', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke={isDarkMode ? '#3d4451' : '#ccc'}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#cbd5e0' : '#666', fontSize: 12 }}
                  stroke={isDarkMode ? '#3d4451' : '#ccc'}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    color: isDarkMode ? '#cbd5e0' : '#666'
                  }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#28a745" 
                  strokeWidth={3}
                  name="Present"
                  dot={{ fill: '#28a745', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: '#28a745', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#dc3545" 
                  strokeWidth={3}
                  name="Absent"
                  dot={{ fill: '#dc3545', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: '#dc3545', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke="#ffc107" 
                  strokeWidth={3}
                  name="Late"
                  dot={{ fill: '#ffc107', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: '#ffc107', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department Wise - Enhanced with Stacked Bar and Summary */}
        {dashboardData?.departmentWise && (
          <div className="card fade-in" style={{ animationDelay: '0.6s' }}>
            <h2 style={{ marginBottom: '20px' }}>🏢 Department-wise Attendance</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={dashboardData.departmentWise} 
                margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="gradientPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4CAF50" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#66BB6A" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#81C784" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradientAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F44336" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#EF5350" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#E57373" stopOpacity={1}/>
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#3d4451' : '#e0e0e0'} 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="department" 
                  tick={{ fill: isDarkMode ? '#cbd5e0' : '#666', fontSize: 11, fontWeight: 500 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke={isDarkMode ? '#3d4451' : '#ccc'}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#cbd5e0' : '#666', fontSize: 12 }}
                  interval={0}
                  tickMargin={8}
                  stroke={isDarkMode ? '#3d4451' : '#ccc'}
                  label={{ 
                    value: 'No. of Employees', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fill: isDarkMode ? '#cbd5e0' : '#666', textAnchor: 'middle' },
                    offset: 10
                  }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    color: isDarkMode ? '#cbd5e0' : '#666'
                  }}
                  iconType="square"
                  iconSize={12}
                />
                <Bar 
                  dataKey="present" 
                  stackId="a"
                  fill="url(#gradientPresent)" 
                  name="Present"
                  radius={[10, 10, 0, 0]}
                  filter="url(#shadow)"
                >
                  {dashboardData.departmentWise.map((entry, index) => (
                    <Cell 
                      key={`cell-present-${index}`} 
                      fill="url(#gradientPresent)"
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="absent" 
                  stackId="a"
                  fill="url(#gradientAbsent)" 
                  name="Absent"
                  radius={[0, 0, 10, 10]}
                  filter="url(#shadow)"
                >
                  {dashboardData.departmentWise.map((entry, index) => (
                    <Cell 
                      key={`cell-absent-${index}`} 
                      fill="url(#gradientAbsent)"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Absent Employees Today */}
      {absentEmployees.length > 0 ? (
        <div className="card">
          <h2>Absent Employees Today</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAbsentEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={absentPage}
            totalPages={absentTotalPages}
            onPageChange={setAbsentPage}
            itemsPerPage={itemsPerPage}
            totalItems={absentEmployees.length}
          />
        </div>
      ) : (
        <div className="card">
          <h2>Absent Employees Today</h2>
          <p>All employees are present today! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

