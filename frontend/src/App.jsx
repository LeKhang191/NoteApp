import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import PreferencesPage from './pages/PreferencesPage';
import VerifyEmail from './pages/VerifyEmail';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SharedWithMe from './pages/SharedWithMe';

function App() {
  const isAuthenticated = () => {
    // Kiểm tra token (dùng sau khi có backend)
    // hoặc kiểm tra user trong localStorage
    return localStorage.getItem('token') !== null ||
      localStorage.getItem('user') !== null;
  };

  // Route bảo vệ - chưa login thì về trang chủ
  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/shared-with-me" element={
          <PrivateRoute><SharedWithMe /></PrivateRoute>
        } />

        {/* Private */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />
        <Route path="/preferences" element={
          <PrivateRoute><PreferencesPage /></PrivateRoute>
        } />
        <Route path="/verify-email/:token" element={
          <VerifyEmail />} />

        <Route path="/change-password" element={
          <PrivateRoute><ChangePassword /></PrivateRoute>
        } />
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;