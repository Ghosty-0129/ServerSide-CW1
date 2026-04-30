import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const location = useLocation();
  const [form,    setForm]    = useState({ email: location.state?.email || "", otp: "", newPassword: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await resetPassword({ email: form.email, otp: form.otp, newPassword: form.newPassword });
      navigate("/login", { state: { message: "Password reset successfully. Please log in." } });
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set new password</h1>
        <p>Enter the OTP from your email and choose a new password</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>OTP</label>
            <input
              type="text" placeholder="6-digit code" maxLength={6}
              value={form.otp}
              onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
              style={{ letterSpacing: "6px", fontSize: "18px", textAlign: "center" }}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Min 10 chars, upper, lower, number, special"
              value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" placeholder="Repeat new password"
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="form-link"><Link to="/login">Back to login</Link></div>
      </div>
    </div>
  );
}
