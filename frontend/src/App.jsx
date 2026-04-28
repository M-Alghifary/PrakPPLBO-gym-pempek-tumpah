import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MemberDashboard from './pages/dashboard/MemberDashboard';
import Schedule from './pages/schedule/Schedule';
import Booking from './pages/booking/Booking';
import Report from './pages/report/Report';
import Workout from './pages/workout/Workout';
import Membership from './pages/membership/Membership';
import Riwayat from './pages/Riwayat/Riwayat';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute><MemberDashboard /></PrivateRoute>
        } />
        <Route path="/schedule" element={
          <PrivateRoute><Schedule /></PrivateRoute>
        } />
        <Route path="/booking" element={
          <PrivateRoute><Booking /></PrivateRoute>
        } />
        <Route path="/report" element={
          <PrivateRoute><Report /></PrivateRoute>
        } />
        <Route path="/workout" element={
          <PrivateRoute><Workout /></PrivateRoute>
        } />
        <Route path="/membership" element={
          <PrivateRoute><Membership /></PrivateRoute>
        } />
        <Route path="/riwayat" element={
          <PrivateRoute><Riwayat /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;