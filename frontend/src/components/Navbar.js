import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeaves } from '../store/slices/leaveSlice';
import { getAllReports } from '../store/slices/problemSlice';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const dispatch = useDispatch();
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
        <div className="navbar-right">
          <div className="theme-toggle-mobile">
            <ThemeToggle />
          </div>
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {user?.role === 'employee' ? (
            <>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/mark-attendance" 
                className={isActive('/mark-attendance') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Mark Attendance
              </Link>
              <Link 
                to="/my-attendance" 
                className={isActive('/my-attendance') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Attendance
              </Link>
              <Link 
                to="/apply-leave" 
                className={isActive('/apply-leave') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Apply Leave
              </Link>
              <Link 
                to="/report-problem" 
                className={isActive('/report-problem') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Report Problem
              </Link>
              <Link 
                to="/profile" 
                className={isActive('/profile') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/manager/dashboard" 
                className={isActive('/manager/dashboard') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/manager/attendance" 
                className={isActive('/manager/attendance') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Attendance
              </Link>
              <Link 
                to="/manager/calendar" 
                className={isActive('/manager/calendar') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calendar
              </Link>
              <Link 
                to="/manager/reports" 
                className={isActive('/manager/reports') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reports
              </Link>
              <Link 
                to="/manager/approvals" 
                className={isActive('/manager/approvals') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Approvals
                {(pendingLeavesCount + openReportsCount) > 0 && (
                  <span className="navbar-badge">{pendingLeavesCount + openReportsCount}</span>
                )}
              </Link>
              <Link 
                to="/profile" 
                className={isActive('/profile') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </>
          )}
          <div className="theme-toggle-desktop">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

