import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import VerifyEmail    from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword  from "./pages/ResetPassword";
import Dashboard      from "./pages/Dashboard";
import Charts         from "./pages/Charts";
import Alumni         from "./pages/Alumni";

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading-screen">Loading...</div>;
  if (!user)  return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/"       element={<Protected><Dashboard /></Protected>} />
          <Route path="/charts" element={<Protected><Charts /></Protected>} />
          <Route path="/alumni" element={<Protected><Alumni /></Protected>} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
