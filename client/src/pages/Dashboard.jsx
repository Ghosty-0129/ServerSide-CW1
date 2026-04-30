import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getOverviewStats, getSkillsGap, getEmploymentByIndustry, getGraduation
} from "../services/api";
import SkillsGapChart     from "../components/charts/SkillsGapChart";
import IndustryChart      from "../components/charts/IndustryChart";
import GraduationTrendsChart from "../components/charts/GraduationTrendsChart";

export default function Dashboard() {
  const [stats,      setStats]      = useState(null);
  const [skillsGap,  setSkillsGap]  = useState([]);
  const [industry,   setIndustry]   = useState([]);
  const [graduation, setGraduation] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [s, sg, ind, grad] = await Promise.all([
          getOverviewStats(),
          getSkillsGap(5),
          getEmploymentByIndustry(),
          getGraduation()
        ]);
        setStats(s.data);
        setSkillsGap(sg.data);
        setIndustry(ind.data);
        setGraduation(grad.data);
      } catch {
        setError("Failed to load dashboard data. Check your analytics API key in .env");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>Analytics Dashboard</h1>
          <p>University of Eastminster — Graduate outcomes overview</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="empty-state"><p>Loading dashboard...</p></div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats?.total_alumni ?? 0}</div>
                <div className="stat-label">Total Alumni</div>
              </div>
              <div className="stat-card green">
                <div className="stat-value">{stats?.total_profiles ?? 0}</div>
                <div className="stat-label">Active Profiles</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-value">{stats?.total_certifications ?? 0}</div>
                <div className="stat-label">Certifications</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-value">{stats?.total_degrees ?? 0}</div>
                <div className="stat-label">Degrees</div>
              </div>
              <div className="stat-card teal">
                <div className="stat-value">{stats?.total_courses ?? 0}</div>
                <div className="stat-label">Short Courses</div>
              </div>
              <div className="stat-card red">
                <div className="stat-value">{stats?.total_employment_records ?? 0}</div>
                <div className="stat-label">Employment Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.active_bids ?? 0}</div>
                <div className="stat-label">Active Bids Today</div>
              </div>
              <div className="stat-card green">
                <div className="stat-value">{stats?.featured_today ?? 0}</div>
                <div className="stat-label">Featured Today</div>
              </div>
            </div>

            {/* ── Charts Row 1 ── */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Top Skills Gap</h3>
                <p>Most common certifications acquired post-graduation</p>
                <SkillsGapChart data={skillsGap} />
              </div>
              <div className="chart-card">
                <h3>Employment by Industry</h3>
                <p>Distribution of alumni across industry sectors</p>
                <IndustryChart data={industry} />
              </div>
            </div>

            {/* ── Charts Row 2 ── */}
            <div className="charts-grid single">
              <div className="chart-card">
                <h3>Graduation Trends</h3>
                <p>Number of graduates per year</p>
                <GraduationTrendsChart data={graduation} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
