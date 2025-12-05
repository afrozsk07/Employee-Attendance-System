import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { getAllLeaves } from '../store/slices/leaveSlice';
import { getAllReports } from '../store/slices/problemSlice';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leave);
  const { reports } = useSelector((state) => state.problem);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

  //const handleLogout = () => {
  //  dispatch(logout());
  //  navigate('/login');
  //};

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">Attendance System</div>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            {isMobileMenuOpen ? (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            ) : (
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            )}
          </svg>
        </button>
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                to="/manager/approvals" 
                className={isActive('/manager/approvals') ? 'active' : ''}
              >
                Approvals
                {(pendingLeavesCount + openReportsCount) > 0 && (
                  <span className="navbar-badge">{pendingLeavesCount + openReportsCount}</span>
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
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

