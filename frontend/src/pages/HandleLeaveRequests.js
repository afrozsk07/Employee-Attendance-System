import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeaves, approveLeave, rejectLeave, clearMessage } from '../store/slices/leaveSlice';
import { formatDate } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './HandleLeaveRequests.css';

const HandleLeaveRequests = () => {
  const dispatch = useDispatch();
  const { loading, message, error, leaves } = useSelector((state) => state.leave);

  const [filters, setFilters] = useState({ status: '' });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(getAllLeaves(filters));
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
    dispatch(getAllLeaves(filters));
  };

  const handleAction = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setComment('');
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      dispatch(approveLeave({ id: selectedLeave._id, comment })).then((result) => {
        if (!result.error) {
          setSelectedLeave(null);
          setActionType('');
          setComment('');
          dispatch(getAllLeaves(filters));
        }
      });
    } else if (actionType === 'reject') {
      dispatch(rejectLeave({ id: selectedLeave._id, comment })).then((result) => {
        if (!result.error) {
          setSelectedLeave(null);
          setActionType('');
          setComment('');
          dispatch(getAllLeaves(filters));
        }
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: 'Pending' },
      approved: { class: 'badge-success', text: 'Approved' },
      rejected: { class: 'badge-danger', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: 'Sick Leave',
      vacation: 'Vacation',
      personal: 'Personal',
      emergency: 'Emergency',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const otherLeaves = leaves.filter(l => l.status !== 'pending');

  return (
    <div className="page">
      <div className="page-header">
        <h1>Handle Leave Requests</h1>
        <p>Review and manage employee leave requests</p>
      </div>

      {message && <Toast message={message} type="success" onClose={() => dispatch(clearMessage())} />}
      {error && <Toast message={error} type="error" onClose={() => dispatch(clearMessage())} />}

      <div className="leave-requests-container">
        <div className="card fade-in">
          <div className="filters-section">
            <h2>Filters</h2>
            <div className="filters-row">
              <div className="filter-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {loading && leaves.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <>
            {pendingLeaves.length > 0 && (
              <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
                <h2>Pending Requests ({pendingLeaves.length})</h2>
                <div className="leaves-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.map((leave) => (
                        <tr key={leave._id}>
                          <td>{leave.userId?.name || 'N/A'}</td>
                          <td>{leave.userId?.employeeId || 'N/A'}</td>
                          <td>{leave.userId?.department || 'N/A'}</td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td>{getLeaveTypeLabel(leave.leaveType)}</td>
                          <td>{leave.reason}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAction(leave, 'approve')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleAction(leave, 'reject')}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="card fade-in" style={{ animationDelay: '0.4s' }}>
              <h2>All Leave Requests ({leaves.length})</h2>
              {leaves.length === 0 ? (
                <p className="no-data">No leave requests found</p>
              ) : (
                <div className="leaves-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Review Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((leave) => (
                        <tr key={leave._id}>
                          <td>{leave.userId?.name || 'N/A'}</td>
                          <td>{leave.userId?.employeeId || 'N/A'}</td>
                          <td>{leave.userId?.department || 'N/A'}</td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td>{getLeaveTypeLabel(leave.leaveType)}</td>
                          <td>{getStatusBadge(leave.status)}</td>
                          <td>{leave.reviewComment || '-'}</td>
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

      {selectedLeave && actionType && (
        <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request</h3>
            <div className="modal-body">
              <p><strong>Employee:</strong> {selectedLeave.userId?.name}</p>
              <p><strong>Date Range:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              <div className="form-group">
                <label htmlFor="comment">
                  {actionType === 'approve' ? 'Comment (Optional)' : 'Rejection Comment *'}
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  required={actionType === 'reject'}
                  placeholder={actionType === 'approve' ? 'Add a comment (optional)...' : 'Please provide a reason for rejection...'}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedLeave(null);
                  setActionType('');
                  setComment('');
                }}
              >
                Cancel
              </button>
              <button
                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmAction}
                disabled={actionType === 'reject' && !comment.trim()}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandleLeaveRequests;

