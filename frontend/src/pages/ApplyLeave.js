import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyLeave, getMyLeaves, clearMessage } from '../store/slices/leaveSlice';
import { formatDate } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './ApplyLeave.css';

const ApplyLeave = () => {
  const dispatch = useDispatch();
  const { loading, message, error, leaves } = useSelector((state) => state.leave);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'personal',
    reason: ''
  });

  useEffect(() => {
    dispatch(getMyLeaves());
    return () => {
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(applyLeave(formData)).then((result) => {
      if (!result.error) {
        setFormData({
          startDate: '',
          endDate: '',
          leaveType: 'personal',
          reason: ''
        });
        dispatch(getMyLeaves());
      }
    });
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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Apply for Leave</h1>
        <p>Submit a leave request</p>
      </div>

      {message && <Toast message={message} type="success" onClose={() => dispatch(clearMessage())} />}
      {error && <Toast message={error} type="error" onClose={() => dispatch(clearMessage())} />}

      <div className="apply-leave-container">
        <div className="card fade-in">
          <h2>New Leave Request</h2>
          <form onSubmit={handleSubmit} className="leave-form">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="leaveType">Leave Type *</label>
              <select
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
              >
                <option value="personal">Personal</option>
                <option value="sick">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason *</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Please provide a reason for your leave request..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Submit Leave Request'}
            </button>
          </form>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
          <h2>My Leave Requests</h2>
          {loading && leaves.length === 0 ? (
            <LoadingSpinner />
          ) : leaves.length === 0 ? (
            <p className="no-data">No leave requests found</p>
          ) : (
            <div className="leaves-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Review Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{getLeaveTypeLabel(leave.leaveType)}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td>{leave.reason}</td>
                      <td>{leave.reviewComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;

