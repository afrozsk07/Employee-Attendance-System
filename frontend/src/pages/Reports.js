import React, { useState } from 'react';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleExport = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert('Please select start date and end date');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/attendance/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('Report exported successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to export report');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance Reports</h1>
        <p>Export attendance data to CSV</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Export Report</h2>
        <div className="form-group">
          <label>Start Date *</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date *</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Employee ID (Optional - leave empty for all employees)</label>
          <input
            type="text"
            name="employeeId"
            value={filters.employeeId}
            onChange={handleFilterChange}
            placeholder="e.g., EMP001"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={loading || !filters.startDate || !filters.endDate}
          style={{ width: '100%' }}
        >
          {loading ? 'Exporting...' : 'Export to CSV'}
        </button>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          The exported CSV file will contain all attendance records within the selected date range.
        </p>
      </div>
    </div>
  );
};

export default Reports;

