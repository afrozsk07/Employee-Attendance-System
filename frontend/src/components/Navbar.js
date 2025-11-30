import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { getAllLeaves } from '../store/slices/leaveSlice';
import { getAllReports } from '../store/slices/problemSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leave);
  const { reports } = useSelector((state) => state.problem);

  // Fetch pending leaves and open reports for managers
  useEffect(() => {
    if (user?.role === 'manager') {
      dispatch(getAllLeaves({}));
      dispatch(getAllReports({}));
    }
  }, [dispatch, user?.role]);

  // Calculate notification counts
  const pendingLeavesCount = user?.role === 'manager' 
    ? leaves.filter(leave => leave.status === 'pending').length 
    : 0;
  
  const openReportsCount = user?.role === 'manager'
    ? reports.filter(report => report.status === 'open' || report.status === 'in-progress').length
    : 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">Attendance System</div>
        <div className="navbar-links">
          {user?.role === 'employee' ? (
            <>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link 
                to="/mark-attendance" 
                className={isActive('/mark-attendance') ? 'active' : ''}
              >
                Mark Attendance
              </Link>
              <Link 
                to="/my-attendance" 
                className={isActive('/my-attendance') ? 'active' : ''}
              >
                My Attendance
              </Link>
              <Link 
                to="/apply-leave" 
                className={isActive('/apply-leave') ? 'active' : ''}
              >
                Apply Leave
              </Link>
              <Link 
                to="/report-problem" 
                className={isActive('/report-problem') ? 'active' : ''}
              >
                Report Problem
              </Link>
              <Link 
                to="/profile" 
                className={isActive('/profile') ? 'active' : ''}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/manager/dashboard" 
                className={isActive('/manager/dashboard') ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link 
                to="/manager/attendance" 
                className={isActive('/manager/attendance') ? 'active' : ''}
              >
                All Attendance
              </Link>
              <Link 
                to="/manager/calendar" 
                className={isActive('/manager/calendar') ? 'active' : ''}
              >
                Calendar
              </Link>
              <Link 
                to="/manager/reports" 
                className={isActive('/manager/reports') ? 'active' : ''}
              >
                Reports
              </Link>
              <Link 
                to="/manager/leave-requests" 
                className={isActive('/manager/leave-requests') ? 'active' : ''}
              >
                Leave Requests
                {pendingLeavesCount > 0 && (
                  <span className="navbar-badge">{pendingLeavesCount}</span>
                )}
              </Link>
              <Link 
                to="/manager/troubleshoot" 
                className={isActive('/manager/troubleshoot') ? 'active' : ''}
              >
                Troubleshoot
                {openReportsCount > 0 && (
                  <span className="navbar-badge">{openReportsCount}</span>
                )}
              </Link>
              <Link 
                to="/profile" 
                className={isActive('/profile') ? 'active' : ''}
              >
                Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

