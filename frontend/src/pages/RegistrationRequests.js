import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatDateTime } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';

const RegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/registration-requests');
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch registration requests:', error);
      setLoading(false);
    }
  };

  const handleAction = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      if (action === 'approve') {
        await api.post(`/registration-requests/${selectedRequest._id}/approve`);
        alert('Registration request approved successfully!');
      } else {
        await api.post(`/registration-requests/${selectedRequest._id}/reject`, {
          reason: rejectionReason
        });
        alert('Registration request rejected');
      }
      
      setSelectedRequest(null);
      setAction(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Registration Requests</h1>
        <p>Review and approve employee registration requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No pending registration requests</p>
        </div>
      ) : (
        <div className="card">
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
                {requests.map((request) => (
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
                          onClick={() => handleAction(request, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAction(request, 'reject')}
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

      {/* Confirmation Modal */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>
              {action === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Name:</strong> {selectedRequest.name}</p>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              <p><strong>Employee ID:</strong> {selectedRequest.employeeId}</p>
              <p><strong>Department:</strong> {selectedRequest.department}</p>
            </div>

            {action === 'reject' && (
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows="4"
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedRequest(null);
                  setAction(null);
                  setRejectionReason('');
                }}
                disabled={processing}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmAction}
                disabled={processing}
                style={{ flex: 1 }}
              >
                {processing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRequests;
