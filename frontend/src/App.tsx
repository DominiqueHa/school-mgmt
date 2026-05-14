import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import Dashboard from './pages/dashboard/Dashboard';
import Students from './pages/students/Students';
import Teachers from './pages/teachers/Teachers';
import Structure from './pages/structure/Structure';
import Staff from './pages/staff/Staff';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Layout><Students /></Layout></PrivateRoute>} />
        <Route path="/teachers" element={<PrivateRoute><Layout><Teachers /></Layout></PrivateRoute>} />
        <Route path="/structure" element={<PrivateRoute><Layout><Structure /></Layout></PrivateRoute>} />
        <Route path="/staff" element={<PrivateRoute><Layout><Staff /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
