import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>📊 AR Alumni</h2>
        <p>University Analytics Dashboard</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/"       className={({isActive}) => isActive ? "active" : ""}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/charts" className={({isActive}) => isActive ? "active" : ""}>
          📈 Charts & Analytics
        </NavLink>
        <NavLink to="/alumni" className={({isActive}) => isActive ? "active" : ""}>
          👥 View Alumni
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div>{user?.email}</div>
        <div style={{ fontSize: 11, marginTop: 2, opacity: 0.6 }}>
          {user?.role?.replace("_", " ")}
        </div>
        <button onClick={handleLogout}>Sign Out</button>
      </div>
    </aside>
  );
}
