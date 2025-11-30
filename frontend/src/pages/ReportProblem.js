import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitProblem, getMyReports, clearMessage } from '../store/slices/problemSlice';
import { formatDate, formatDateTimeFull } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './ReportProblem.css';

const ReportProblem = () => {
  const dispatch = useDispatch();
  const { loading, message, error, reports } = useSelector((state) => state.problem);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium'
  });

  useEffect(() => {
    dispatch(getMyReports());
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
    dispatch(submitProblem(formData)).then((result) => {
      if (!result.error) {
        setFormData({
          subject: '',
          description: '',
          category: 'other',
          priority: 'medium'
        });
        dispatch(getMyReports());
      }
    });
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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Report Problem</h1>
        <p>Submit a problem or issue report</p>
      </div>

      {message && <Toast message={message} type="success" onClose={() => dispatch(clearMessage())} />}
      {error && <Toast message={error} type="error" onClose={() => dispatch(clearMessage())} />}

      <div className="report-problem-container">
        <div className="card fade-in">
          <h2>New Problem Report</h2>
          <form onSubmit={handleSubmit} className="problem-form">
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief description of the problem"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Please provide detailed information about the problem..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="other">Other</option>
                  <option value="attendance">Attendance</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Submit Report'}
            </button>
          </form>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
          <h2>My Problem Reports</h2>
          {loading && reports.length === 0 ? (
            <LoadingSpinner />
          ) : reports.length === 0 ? (
            <p className="no-data">No problem reports found</p>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <div key={report._id} className="report-item">
                  <div className="report-header">
                    <h3>{report.subject}</h3>
                    <div className="report-badges">
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                    </div>
                  </div>
                  <div className="report-meta">
                    <span><strong>Category:</strong> {getCategoryLabel(report.category)}</span>
                    <span><strong>Submitted:</strong> {formatDateTimeFull(report.createdAt)}</span>
                  </div>
                  <p className="report-description">{report.description}</p>
                  {report.resolution && (
                    <div className="report-resolution">
                      <strong>Resolution:</strong>
                      <p>{report.resolution}</p>
                      {report.resolvedAt && (
                        <span className="resolved-date">
                          Resolved on: {formatDateTimeFull(report.resolvedAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportProblem;

