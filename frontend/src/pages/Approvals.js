import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeaves, approveLeave, rejectLeave, clearMessage as clearLeaveMessage } from '../store/slices/leaveSlice';
import { getAllReports, resolveProblem, updateProblemStatus, clearMessage as clearProblemMessage } from '../store/slices/problemSlice';
import api from '../utils/api';
import { formatDate, formatDateTime, formatDateTimeFull } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import './Approvals.css';

const Approvals = () => {
  const dispatch = useDispatch();
  const { loading: leaveLoading, message: leaveMessage, error: leaveError, leaves } = useSelector((state) => state.leave);
  const { loading: problemLoading, message: problemMessage, error: problemError, reports } = useSelector((state) => state.problem);

  const [activeTab, setActiveTab] = useState('leaves');
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [allRegistrationRequests, setAllRegistrationRequests] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  // Pagination state
  const [leavesPage, setLeavesPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [registrationsPage, setRegistrationsPage] = useState(1);
  const itemsPerPage = 5; // Reduced for easier testing

  // Leave state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveAction, setLeaveAction] = useState('');
  const [leaveComment, setLeaveComment] = useState('');

  // Problem state
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');

  // Registration state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [regAction, setRegAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    dispatch(getAllLeaves({}));
    dispatch(getAllReports({}));
    fetchRegistrationRequests();

    return () => {
      dispatch(clearLeaveMessage());
      dispatch(clearProblemMessage());
    };
  }, [dispatch]);

  const fetchRegistrationRequests = async () => {
    setRegLoading(true);
    try {
      const [pendingResponse, allResponse] = await Promise.all([
        api.get('/registration-requests'),
        api.get('/registration-requests/all')
      ]);
      setRegistrationRequests(pendingResponse.data);
      setAllRegistrationRequests(allResponse.data);
    } catch (error) {
      console.error('Failed to fetch registration requests:', error);
    } finally {
      setRegLoading(false);
    }
  };

  // Leave handlers
  const handleLeaveAction = (leave, type) => {
    setSelectedLeave(leave);
    setLeaveAction(type);
    setLeaveComment('');
  };

  const handleConfirmLeaveAction = () => {
    if (leaveAction === 'approve') {
      dispatch(approveLeave({ id: selectedLeave._id, comment: leaveComment })).then((result) => {
        if (!result.error) {
          setSelectedLeave(null);
          setLeaveAction('');
          setLeaveComment('');
        }
      });
    } else if (leaveAction === 'reject') {
      dispatch(rejectLeave({ id: selectedLeave._id, comment: leaveComment })).then((result) => {
        if (!result.error) {
          setSelectedLeave(null);
          setLeaveAction('');
          setLeaveComment('');
        }
      });
    }
  };

  // Problem handlers
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

  const handleConfirmProblemAction = () => {
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
          }
        });
      }
    }
  };

  // Registration handlers
  const handleRegAction = (request, actionType) => {
    setSelectedRequest(request);
    setRegAction(actionType);
    setRejectionReason('');
  };

  const handleConfirmRegAction = async () => {
    if (regAction === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      if (regAction === 'approve') {
        await api.post(`/registration-requests/${selectedRequest._id}/approve`);
        alert('Registration request approved successfully!');
      } else {
        await api.post(`/registration-requests/${selectedRequest._id}/reject`, {
          reason: rejectionReason
        });
        alert('Registration request rejected');
      }
      
      setSelectedRequest(null);
      setRegAction(null);
      setRejectionReason('');
      fetchRegistrationRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  // Badge helpers
  const getStatusBadge = (status, type = 'leave') => {
    const leaveBadges = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected'
    };
    
    const problemBadges = {
      open: 'badge-open',
      'in-progress': 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed'
    };

    const badgeClass = type === 'leave' ? leaveBadges[status] : problemBadges[status];
    return <span className={`badge ${badgeClass}`}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-open',
      medium: 'badge-pending',
      high: 'badge-rejected',
      urgent: 'badge-rejected'
    };
    return <span className={`badge ${badges[priority]}`}>{priority}</span>;
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const processedLeaves = leaves.filter(l => l.status !== 'pending');
  const openReports = reports.filter(r => r.status === 'open' || r.status === 'in-progress');
  const closedReports = reports.filter(r => r.status === 'resolved' || r.status === 'closed');
  const processedRegistrations = allRegistrationRequests.filter(r => r.status !== 'pending');

  // Pagination calculations
  const paginatedProcessedLeaves = processedLeaves.slice(
    (leavesPage - 1) * itemsPerPage,
    leavesPage * itemsPerPage
  );
  const leavesTotalPages = Math.ceil(processedLeaves.length / itemsPerPage);

  const paginatedClosedReports = closedReports.slice(
    (reportsPage - 1) * itemsPerPage,
    reportsPage * itemsPerPage
  );
  const reportsTotalPages = Math.ceil(closedReports.length / itemsPerPage);

  const paginatedProcessedRegistrations = processedRegistrations.slice(
    (registrationsPage - 1) * itemsPerPage,
    registrationsPage * itemsPerPage
  );
  const registrationsTotalPages = Math.ceil(processedRegistrations.length / itemsPerPage);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Approvals</h1>
        <p>Manage leave requests, problem reports, and registration requests</p>
      </div>

      {leaveMessage && <Toast message={leaveMessage} type="success" onClose={() => dispatch(clearLeaveMessage())} />}
      {leaveError && <Toast message={leaveError} type="error" onClose={() => dispatch(clearLeaveMessage())} />}
      {problemMessage && <Toast message={problemMessage} type="success" onClose={() => dispatch(clearProblemMessage())} />}
      {problemError && <Toast message={problemError} type="error" onClose={() => dispatch(clearProblemMessage())} />}

      {/* Tabs */}
      <div className="approvals-tabs">
        <button
          className={`tab-button ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          Leave Requests
          {pendingLeaves.length > 0 && <span className="tab-badge">{pendingLeaves.length}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          Problem Reports
          {openReports.length > 0 && <span className="tab-badge">{openReports.length}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          Registrations
          {registrationRequests.length > 0 && <span className="tab-badge">{registrationRequests.length}</span>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Leave Requests Tab */}
        {activeTab === 'leaves' && (
          <div className="tab-panel">
            {leaveLoading && leaves.length === 0 ? (
              <LoadingSpinner />
            ) : (
              <>
                {pendingLeaves.length > 0 && (
                  <div className="card" style={{ marginBottom: '20px' }}>
                    <h2>Pending Leave Requests ({pendingLeaves.length})</h2>
                    <div className="table-container">
                      <table>
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
                              <td>{leave.leaveType}</td>
                              <td>{leave.reason}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleLeaveAction(leave, 'approve')}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleLeaveAction(leave, 'reject')}
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

                <div className="card">
                  <h2>Past Leave Requests ({processedLeaves.length})</h2>
                  {processedLeaves.length === 0 ? (
                    <p className="no-data">No past leave requests</p>
                  ) : (
                    <>
                      <div className="table-container">
                        <table>
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
                            {paginatedProcessedLeaves.map((leave) => (
                              <tr key={leave._id}>
                                <td>{leave.userId?.name || 'N/A'}</td>
                                <td>{leave.userId?.employeeId || 'N/A'}</td>
                                <td>{leave.userId?.department || 'N/A'}</td>
                                <td>{formatDate(leave.startDate)}</td>
                                <td>{formatDate(leave.endDate)}</td>
                                <td>{leave.leaveType}</td>
                                <td>{getStatusBadge(leave.status, 'leave')}</td>
                                <td>{leave.reviewComment || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {processedLeaves.length > 0 && (
                        <Pagination
                          currentPage={leavesPage}
                          totalPages={leavesTotalPages}
                          onPageChange={setLeavesPage}
                          itemsPerPage={itemsPerPage}
                          totalItems={processedLeaves.length}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Problem Reports Tab */}
        {activeTab === 'problems' && (
          <div className="tab-panel">
            {problemLoading && reports.length === 0 ? (
              <LoadingSpinner />
            ) : (
              <>
                {openReports.length > 0 && (
                  <div className="card" style={{ marginBottom: '20px' }}>
                    <h2>Open Problem Reports ({openReports.length})</h2>
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
                              {getStatusBadge(report.status, 'problem')}
                              {getPriorityBadge(report.priority)}
                            </div>
                          </div>
                          <p className="report-description">{report.description}</p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
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

                <div className="card">
                  <h2>Resolved/Closed Reports ({closedReports.length})</h2>
                  {closedReports.length === 0 ? (
                    <p className="no-data">No resolved or closed reports</p>
                  ) : (
                    <>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Employee</th>
                              <th>Subject</th>
                              <th>Category</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Submitted</th>
                              <th>Resolution</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedClosedReports.map((report) => (
                              <tr key={report._id}>
                                <td>{report.userId?.name || 'N/A'}</td>
                                <td>{report.subject}</td>
                                <td>{report.category}</td>
                                <td>{getPriorityBadge(report.priority)}</td>
                                <td>{getStatusBadge(report.status, 'problem')}</td>
                                <td>{formatDate(report.createdAt)}</td>
                                <td>{report.resolution || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {closedReports.length > 0 && (
                        <Pagination
                          currentPage={reportsPage}
                          totalPages={reportsTotalPages}
                          onPageChange={setReportsPage}
                          itemsPerPage={itemsPerPage}
                          totalItems={closedReports.length}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Registration Requests Tab */}
        {activeTab === 'registrations' && (
          <div className="tab-panel">
            {regLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {registrationRequests.length > 0 && (
                  <div className="card" style={{ marginBottom: '20px' }}>
                    <h2>Pending Registration Requests ({registrationRequests.length})</h2>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Employee ID</th>
                            <th>Department</th>
                            <th>Requested On</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrationRequests.map((request) => (
                            <tr key={request._id}>
                              <td>{request.name}</td>
                              <td>{request.email}</td>
                              <td>{request.employeeId}</td>
                              <td>{request.department}</td>
                              <td>{formatDateTime(request.createdAt)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleRegAction(request, 'approve')}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRegAction(request, 'reject')}
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

                <div className="card">
                  <h2>Past Registration Requests ({processedRegistrations.length})</h2>
                  {processedRegistrations.length === 0 ? (
                    <p className="no-data">No past registration requests</p>
                  ) : (
                    <>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Employee ID</th>
                              <th>Department</th>
                              <th>Status</th>
                              <th>Reviewed On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedProcessedRegistrations.map((request) => (
                              <tr key={request._id}>
                                <td>{request.name}</td>
                                <td>{request.email}</td>
                                <td>{request.employeeId}</td>
                                <td>{request.department}</td>
                                <td>
                                  <span className={`badge ${request.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`}>
                                    {request.status}
                                  </span>
                                </td>
                                <td>{request.reviewedAt ? formatDateTime(request.reviewedAt) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {processedRegistrations.length > 0 && (
                        <Pagination
                          currentPage={registrationsPage}
                          totalPages={registrationsTotalPages}
                          onPageChange={setRegistrationsPage}
                          itemsPerPage={itemsPerPage}
                          totalItems={processedRegistrations.length}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Leave Modal */}
      {selectedLeave && leaveAction && (
        <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{leaveAction === 'approve' ? 'Approve' : 'Reject'} Leave Request</h3>
            <div className="modal-body">
              <p><strong>Employee:</strong> {selectedLeave.userId?.name}</p>
              <p><strong>Date Range:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              <div className="form-group">
                <label>
                  {leaveAction === 'approve' ? 'Comment (Optional)' : 'Rejection Comment *'}
                </label>
                <textarea
                  value={leaveComment}
                  onChange={(e) => setLeaveComment(e.target.value)}
                  rows="4"
                  required={leaveAction === 'reject'}
                  placeholder={leaveAction === 'approve' ? 'Add a comment (optional)...' : 'Please provide a reason for rejection...'}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedLeave(null);
                  setLeaveAction('');
                  setLeaveComment('');
                }}
              >
                Cancel
              </button>
              <button
                className={`btn ${leaveAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmLeaveAction}
                disabled={leaveAction === 'reject' && !leaveComment.trim()}
              >
                {leaveAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Manage Problem Report</h3>
            <div className="modal-body">
              <p><strong>Employee:</strong> {selectedReport.userId?.name} ({selectedReport.userId?.employeeId})</p>
              <p><strong>Subject:</strong> {selectedReport.subject}</p>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Category:</strong> {selectedReport.category}</p>
              <p><strong>Priority:</strong> {getPriorityBadge(selectedReport.priority)}</p>
              <p><strong>Current Status:</strong> {getStatusBadge(selectedReport.status, 'problem')}</p>
              
              <div className="form-group">
                <label>Update Status</label>
                <select
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
                <label>
                  Resolution {(newStatus === 'resolved' || newStatus === 'closed') ? '*' : '(Optional)'}
                </label>
                <textarea
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
                onClick={handleConfirmProblemAction}
                disabled={(newStatus === 'resolved' || newStatus === 'closed') && !resolution.trim()}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{regAction === 'approve' ? 'Approve Registration' : 'Reject Registration'}</h3>
            
            <div className="modal-body">
              <p><strong>Name:</strong> {selectedRequest.name}</p>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              <p><strong>Employee ID:</strong> {selectedRequest.employeeId}</p>
              <p><strong>Department:</strong> {selectedRequest.department}</p>

              {regAction === 'reject' && (
                <div className="form-group">
                  <label>Reason for Rejection *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    rows="4"
                  />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedRequest(null);
                  setRegAction(null);
                  setRejectionReason('');
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className={`btn ${regAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmRegAction}
                disabled={processing}
              >
                {processing ? 'Processing...' : regAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
