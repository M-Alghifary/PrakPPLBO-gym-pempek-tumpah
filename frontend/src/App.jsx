import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MemberDashboard from './pages/dashboard/MemberDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMemberPage from './pages/admin/AdminMemberPage';
import AdminClassPage from './pages/admin/AdminClassPage';
import AdminFinancePage from './pages/admin/AdminFinancePage';
        <Route path="/admin/finance" element={
          <PrivateRoute allowedRoles={['ADMIN', 'OWNER']}><AdminFinancePage /></PrivateRoute>
        } />
import Schedule from './pages/schedule/Schedule';
import Booking from './pages/booking/Booking';
import Report from './pages/report/Report';
import Workout from './pages/workout/Workout';
import Membership from './pages/membership/Membership';
import Riwayat from './pages/Riwayat/Riwayat';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'ADMIN' || userRole === 'OWNER' ? '/admin/dashboard' : '/dashboard'} />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Member Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute allowedRoles={['MEMBER']}><MemberDashboard /></PrivateRoute>
        } />
        <Route path="/schedule" element={
          <PrivateRoute allowedRoles={['MEMBER']}><Schedule /></PrivateRoute>
        } />
        <Route path="/booking" element={
          <PrivateRoute allowedRoles={['MEMBER']}><Booking /></PrivateRoute>
        } />
        <Route path="/report" element={
          <PrivateRoute allowedRoles={['MEMBER']}><Report /></PrivateRoute>
        } />
        <Route path="/workout" element={
          <PrivateRoute allowedRoles={['MEMBER']}><Workout /></PrivateRoute>
        } />
        <Route path="/membership" element={
          <PrivateRoute allowedRoles={['MEMBER']}><Membership /></PrivateRoute>
        } />
        <Route path="/riwayat" element={
          <PrivateRoute allowedRoles={['MEMBER']}><Riwayat /></PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute allowedRoles={['ADMIN', 'OWNER']}><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/admin/members" element={
          <PrivateRoute allowedRoles={['ADMIN', 'OWNER']}><AdminMemberPage /></PrivateRoute>
        } />
        <Route path="/admin/classes" element={
          <PrivateRoute allowedRoles={['ADMIN', 'OWNER']}><AdminClassPage /></PrivateRoute>
        } />
        <Route path="/admin/finance" element={
          <PrivateRoute allowedRoles={['ADMIN', 'OWNER']}><AdminFinancePage /></PrivateRoute>
        } />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;