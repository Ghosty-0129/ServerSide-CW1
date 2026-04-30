import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ExportButton from "../components/ExportButton";
import SkillsGapChart     from "../components/charts/SkillsGapChart";
import IndustryChart      from "../components/charts/IndustryChart";
import JobTitlesChart     from "../components/charts/JobTitlesChart";
import TopEmployersChart  from "../components/charts/TopEmployersChart";
import ProgrammeDistChart from "../components/charts/ProgrammeDistChart";
import GraduationTrendsChart from "../components/charts/GraduationTrendsChart";
import CertGrowthChart    from "../components/charts/CertGrowthChart";
import ProfDevRadarChart  from "../components/charts/ProfDevRadarChart";

import {
  getSkillsGap, getEmploymentByIndustry, getJobTitles, getTopEmployers,
  getProgrammes, getGraduation, getCertGrowth, getRadar
} from "../services/api";

export default function Charts() {
  const [skillsGap,  setSkillsGap]  = useState([]);
  const [industry,   setIndustry]   = useState([]);
  const [jobTitles,  setJobTitles]  = useState([]);
  const [employers,  setEmployers]  = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [graduation, setGraduation] = useState([]);
  const [certGrowth, setCertGrowth] = useState([]);
  const [radar,      setRadar]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [limit,      setLimit]      = useState(10);

  useEffect(() => {
    loadAll();
  }, [limit]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [sg, ind, jt, emp, prog, grad, cg, rad] = await Promise.all([
        getSkillsGap(limit),
        getEmploymentByIndustry(),
        getJobTitles(limit),
        getTopEmployers(limit),
        getProgrammes(),
        getGraduation(),
        getCertGrowth(),
        getRadar()
      ]);
      setSkillsGap(sg.data);
      setIndustry(ind.data);
      setJobTitles(jt.data);
      setEmployers(emp.data);
      setProgrammes(prog.data);
      setGraduation(grad.data);
      setCertGrowth(cg.data);
      setRadar(rad.data);
    } catch {
      setError("Failed to load chart data. Check your analytics API key.");
    } finally {
      setLoading(false);
    }
  }

  const allData = [
    ...skillsGap.map(d  => ({ chart: "Skills Gap",      label: d.skill,     count: d.count })),
    ...industry.map(d   => ({ chart: "Industry",         label: d.industry,  count: d.count })),
    ...jobTitles.map(d  => ({ chart: "Job Titles",       label: d.job_title, count: d.count })),
    ...employers.map(d  => ({ chart: "Top Employers",    label: d.company,   count: d.count })),
    ...programmes.map(d => ({ chart: "Programmes",       label: d.programme, count: d.count })),
    ...graduation.map(d => ({ chart: "Graduation Trends",label: d.year,      count: d.count })),
    ...certGrowth.map(d => ({ chart: "Cert Growth",      label: d.month,     count: d.count })),
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>Charts & Analytics</h1>
          <p>Actionable intelligence from alumni professional data</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Controls */}
        <div className="filter-bar" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div className="filter-group">
              <label>Top N Results</label>
              <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={loadAll}>Refresh</button>
          </div>
          <ExportButton data={allData} filename="alumni_analytics" pdfTargetId="charts-container" />
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading charts...</p></div>
        ) : (
          <div id="charts-container">

            {/* Row 1 */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>🎯 Skills Gap Detection</h3>
                <p>Top certifications alumni acquire post-graduation — reveals curriculum gaps</p>
                <SkillsGapChart data={skillsGap} />
              </div>
              <div className="chart-card">
                <h3>🏭 Employment by Industry Sector</h3>
                <p>Where alumni are working — industry distribution</p>
                <IndustryChart data={industry} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>💼 Most Common Job Titles</h3>
                <p>The roles alumni are filling in industry</p>
                <JobTitlesChart data={jobTitles} />
              </div>
              <div className="chart-card">
                <h3>🏢 Top Employers</h3>
                <p>Companies hiring the most Eastminster graduates</p>
                <TopEmployersChart data={employers} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>🎓 Programme Distribution</h3>
                <p>Breakdown of alumni by academic programme</p>
                <ProgrammeDistChart data={programmes} />
              </div>
              <div className="chart-card">
                <h3>📅 Graduation Trends</h3>
                <p>Number of graduates per year</p>
                <GraduationTrendsChart data={graduation} />
              </div>
            </div>

            {/* Row 4 */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>📈 Certification Growth</h3>
                <p>New certifications added each month (last 12 months)</p>
                <CertGrowthChart data={certGrowth} />
              </div>
              <div className="chart-card">
                <h3>🕸 Professional Development Radar</h3>
                <p>Overall spread of post-graduation professional activity</p>
                <ProfDevRadarChart data={radar} />
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
