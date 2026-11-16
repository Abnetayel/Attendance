import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminLeavePage from './pages/AdminLeavePage';
import AttendanceManagePage from './pages/AttendanceManagePage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LeavePage from './pages/LeavePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetPasswordPage from './pages/SetPasswordPage';
import UsersPage from './pages/UsersPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/set-password" element={<SetPasswordPage />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={
          user?.role === 'Admin' || user?.role === 'Manager'
            ? <AdminDashboard />
            : user?.role === 'AttendanceManager'
              ? <AttendanceManagePage />
              : <EmployeeDashboard />
        } />
        <Route path="my-attendance" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="leaves" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
        <Route
          path="admin/attendance"
          element={<ProtectedRoute roles={['Admin', 'Manager', 'AttendanceManager']}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="manage-attendance"
          element={<ProtectedRoute roles={['AttendanceManager', 'Admin']}><AttendanceManagePage /></ProtectedRoute>}
        />
        <Route
          path="admin/leaves"
          element={<ProtectedRoute roles={['Admin', 'Manager']}><AdminLeavePage /></ProtectedRoute>}
        />
        <Route
          path="admin/users"
          element={<ProtectedRoute roles={['Admin']}><UsersPage /></ProtectedRoute>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
