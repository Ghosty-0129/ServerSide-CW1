import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifyEmail, resendOtp } from "../services/api";

export default function VerifyEmail() {
  const location = useLocation();
  const [email,   setEmail]   = useState(location.state?.email || "");
  const [otp,     setOtp]     = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleVerify(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await verifyEmail({ email, otp });
      setSuccess("Email verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(""); setSuccess("");
    try {
      await resendOtp({ email });
      setSuccess("New OTP sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify your email</h1>
        <p>Enter the 6-digit OTP sent to {email || "your email"}</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleVerify}>
          {!location.state?.email && (
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>6-Digit OTP</label>
            <input
              type="text"
              placeholder="e.g. 482910"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              style={{ letterSpacing: "8px", fontSize: "20px", textAlign: "center" }}
            />
          </div>
          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="form-link">
          Didn't receive it?{" "}
          <button
            onClick={handleResend}
            style={{ background: "none", border: "none", color: "#2E75B6", cursor: "pointer", fontWeight: 600 }}
          >
            Resend OTP
          </button>
        </div>
        <div className="form-link">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
