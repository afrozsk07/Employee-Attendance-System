import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import api from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Pagination from '../components/Pagination';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
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
  
  // Custom tooltip for better formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#666', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip 
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis 
                  dataKey="department" 
                  tick={{ fill: '#666', fontSize: 11, fontWeight: 500 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  tick={{ fill: '#666', fontSize: 12 }}
                  interval={0}
                  tickMargin={8}
                  label={{ 
                    value: 'No. of Employees', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fill: '#666', textAnchor: 'middle' },
                    offset: 10
                  }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    padding: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
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

