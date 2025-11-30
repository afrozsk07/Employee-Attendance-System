import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReports, resolveProblem, updateProblemStatus, clearMessage } from '../store/slices/problemSlice';
import { formatDate, formatDateTimeFull } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './TroubleshootReports.css';

const TroubleshootReports = () => {
  const dispatch = useDispatch();
  const { loading, message, error, reports } = useSelector((state) => state.problem);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');

  useEffect(() => {
    dispatch(getAllReports(filters));
    return () => {
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    dispatch(getAllReports(filters));
  };

  const handleResolve = (report) => {
    setSelectedReport(report);
    setResolution('');
    setNewStatus('resolved');
  };

  const handleUpdateStatus = (report) => {
    setSelectedReport(report);
    setResolution(report.resolution || '');
    setNewStatus(report.status);
  };

  const handleConfirmAction = () => {
    if (selectedReport) {
      if (newStatus === 'resolved' || newStatus === 'closed') {
        dispatch(resolveProblem({
          id: selectedReport._id,
          resolution,
          status: newStatus
        })).then((result) => {
          if (!result.error) {
            setSelectedReport(null);
            setResolution('');
            dispatch(getAllReports(filters));
          }
        });
      } else {
        dispatch(updateProblemStatus({
          id: selectedReport._id,
          status: newStatus,
          resolution: resolution || undefined
        })).then((result) => {
          if (!result.error) {
            setSelectedReport(null);
            setResolution('');
            dispatch(getAllReports(filters));
          }
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'badge-info', text: 'Open' },
      'in-progress': { class: 'badge-warning', text: 'In Progress' },
      resolved: { class: 'badge-success', text: 'Resolved' },
      closed: { class: 'badge-secondary', text: 'Closed' }
    };
    const badge = badges[status] || badges.open;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { class: 'badge-info', text: 'Low' },
      medium: { class: 'badge-warning', text: 'Medium' },
      high: { class: 'badge-danger', text: 'High' },
      urgent: { class: 'badge-urgent', text: 'Urgent' }
    };
    const badge = badges[priority] || badges.medium;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      attendance: 'Attendance',
      technical: 'Technical',
      account: 'Account',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const openReports = reports.filter(r => r.status === 'open' || r.status === 'in-progress');

  return (
    <div className="page">
      <div className="page-header">
        <h1>Troubleshoot Reports</h1>
        <p>Manage and resolve employee problem reports</p>
      </div>

      {message && <Toast message={message} type="success" onClose={() => dispatch(clearMessage())} />}
      {error && <Toast message={error} type="error" onClose={() => dispatch(clearMessage())} />}

      <div className="troubleshoot-container">
        <div className="card fade-in">
          <div className="filters-section">
            <h2>Filters</h2>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="attendance">Attendance</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>

        {loading && reports.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <>
            {openReports.length > 0 && (
              <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
                <h2>Open Reports ({openReports.length})</h2>
                <div className="reports-list">
                  {openReports.map((report) => (
                    <div key={report._id} className="report-card">
                      <div className="report-header">
                        <div>
                          <h3>{report.subject}</h3>
                          <div className="report-meta">
                            <span><strong>Employee:</strong> {report.userId?.name} ({report.userId?.employeeId})</span>
                            <span><strong>Department:</strong> {report.userId?.department || 'N/A'}</span>
                            <span><strong>Submitted:</strong> {formatDateTimeFull(report.createdAt)}</span>
                          </div>
                        </div>
                        <div className="report-badges">
                          {getStatusBadge(report.status)}
                          {getPriorityBadge(report.priority)}
                        </div>
                      </div>
                      <p className="report-description">{report.description}</p>
                      <div className="report-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateStatus(report)}
                        >
                          Update Status
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleResolve(report)}
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card fade-in" style={{ animationDelay: '0.4s' }}>
              <h2>All Reports ({reports.length})</h2>
              {reports.length === 0 ? (
                <p className="no-data">No problem reports found</p>
              ) : (
                <div className="reports-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Employee ID</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report._id}>
                          <td>{report.userId?.name || 'N/A'}</td>
                          <td>{report.userId?.employeeId || 'N/A'}</td>
                          <td>{report.subject}</td>
                          <td>{getCategoryLabel(report.category)}</td>
                          <td>{getPriorityBadge(report.priority)}</td>
                          <td>{getStatusBadge(report.status)}</td>
                          <td>{formatDate(report.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUpdateStatus(report)}
                              >
                                Update
                              </button>
                              {(report.status === 'open' || report.status === 'in-progress') && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleResolve(report)}
                                >
                                  Resolve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Manage Problem Report</h3>
            <div className="modal-body">
              <p><strong>Employee:</strong> {selectedReport.userId?.name} ({selectedReport.userId?.employeeId})</p>
              <p><strong>Subject:</strong> {selectedReport.subject}</p>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Category:</strong> {getCategoryLabel(selectedReport.category)}</p>
              <p><strong>Priority:</strong> {getPriorityBadge(selectedReport.priority)}</p>
              <p><strong>Current Status:</strong> {getStatusBadge(selectedReport.status)}</p>
              
              <div className="form-group">
                <label htmlFor="newStatus">Update Status</label>
                <select
                  id="newStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="resolution">
                  Resolution {(newStatus === 'resolved' || newStatus === 'closed') ? '*' : '(Optional)'}
                </label>
                <textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows="5"
                  required={newStatus === 'resolved' || newStatus === 'closed'}
                  placeholder="Enter resolution details..."
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedReport(null);
                  setResolution('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmAction}
                disabled={(newStatus === 'resolved' || newStatus === 'closed') && !resolution.trim()}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TroubleshootReports;

