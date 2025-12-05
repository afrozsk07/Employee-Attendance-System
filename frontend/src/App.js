import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MarkAttendance from './pages/MarkAttendance';
import MyAttendanceHistory from './pages/MyAttendanceHistory';
import ApplyLeave from './pages/ApplyLeave';
import ReportProblem from './pages/ReportProblem';
import ManagerDashboard from './pages/ManagerDashboard';
import AllEmployeesAttendance from './pages/AllEmployeesAttendance';
import TeamCalendar from './pages/TeamCalendar';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Approvals from './pages/Approvals';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/dashboard'} /> : <Home />}
        />
        <Route
          path="/login/:userType"
          element={isAuthenticated ? <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/dashboard'} /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />
        {isAuthenticated ? (
          <>
            {user?.role === 'employee' ? (
              <>
                <Route path="/dashboard" element={<EmployeeDashboard />} />
                <Route path="/mark-attendance" element={<MarkAttendance />} />
                <Route path="/my-attendance" element={<MyAttendanceHistory />} />
                <Route path="/apply-leave" element={<ApplyLeave />} />
                <Route path="/report-problem" element={<ReportProblem />} />
                <Route path="/profile" element={<Profile />} />
              </>
            ) : (
              <>
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/attendance" element={<AllEmployeesAttendance />} />
                <Route path="/manager/calendar" element={<TeamCalendar />} />
                <Route path="/manager/reports" element={<Reports />} />
                <Route path="/manager/approvals" element={<Approvals />} />
                <Route path="/profile" element={<Profile />} />
              </>
            )}
          </>
        ) : (
          <>
            <Route path="/login" element={<Navigate to="/login/employee" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;

