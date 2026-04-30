import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Check your email</h1>
        <p>If that address is registered, a reset OTP has been sent.</p>
        <div className="alert alert-success" style={{ marginTop: 16 }}>
          OTP sent — check your inbox
        </div>
        <button
          className="form-submit"
          style={{ marginTop: 16 }}
          onClick={() => navigate("/reset-password", { state: { email } })}
        >
          Enter Reset OTP
        </button>
        <div className="form-link"><Link to="/login">Back to login</Link></div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p>Enter your university email to receive a reset OTP</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>University Email</label>
            <input
              type="email"
              placeholder="you@westminster.ac.uk"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset OTP"}
          </button>
        </form>
        <div className="form-link"><Link to="/login">Back to login</Link></div>
      </div>
    </div>
  );
}
