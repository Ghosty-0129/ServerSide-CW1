import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ExportButton from "../components/ExportButton";
import { getFilteredAlumni, getFilterOptions } from "../services/api";

export default function Alumni() {
  const [alumni,    setAlumni]    = useState([]);
  const [options,   setOptions]   = useState({ programmes: [], industries: [] });
  const [filters,   setFilters]   = useState({
    programme: "", graduation_date_from: "", graduation_date_to: "",
    industry_sector: "", search: ""
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Load filter options once
  useEffect(() => {
    getFilterOptions()
      .then(res => setOptions(res.data))
      .catch(() => {});
    fetchAlumni();
  }, []);

  async function fetchAlumni(customFilters) {
    setLoading(true);
    setError("");
    try {
      const params = customFilters || filters;
      // Remove empty strings
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "")
      );
      const res = await getFilteredAlumni(clean);
      setAlumni(res.data.alumni);
    } catch {
      setError("Failed to load alumni. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e) {
    e.preventDefault();
    fetchAlumni();
  }

  function clearFilters() {
    const empty = { programme: "", graduation_date_from: "", graduation_date_to: "", industry_sector: "", search: "" };
    setFilters(empty);
    fetchAlumni(empty);
  }

  // Flatten for CSV
  const csvData = alumni.map(a => ({
    name:            `${a.first_name || ""} ${a.last_name || ""}`.trim() || "—",
    email:           a.email,
    programme:       a.programme || "—",
    graduation_date: a.graduation_date || "—",
    industry:        a.industry_sector || "—",
    certifications:  a.cert_count,
    degrees:         a.degree_count,
    employment:      a.employment_count,
    linkedin:        a.linkedin_url || "—"
  }));

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>View Alumni</h1>
          <p>Filter and explore graduate profiles by programme, graduation date and industry</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filter Bar */}
        <form className="filter-bar" onSubmit={handleFilter}>
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Name or email..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Programme</label>
            <select value={filters.programme} onChange={e => setFilters({ ...filters, programme: e.target.value })}>
              <option value="">All programmes</option>
              {options.programmes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Graduated from</label>
            <input
              type="date"
              value={filters.graduation_date_from}
              onChange={e => setFilters({ ...filters, graduation_date_from: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Graduated to</label>
            <input
              type="date"
              value={filters.graduation_date_to}
              onChange={e => setFilters({ ...filters, graduation_date_to: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Industry Sector</label>
            <select value={filters.industry_sector} onChange={e => setFilters({ ...filters, industry_sector: e.target.value })}>
              <option value="">All industries</option>
              {options.industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Apply Filters</button>
          <button type="button" className="btn btn-outline" onClick={clearFilters}>Clear</button>
        </form>

        {/* Table */}
        <div className="table-card">
          <div className="table-header">
            <h3>
              {loading ? "Loading..." : `${alumni.length} alumni found`}
            </h3>
            <div className="table-actions">
              <ExportButton data={csvData} filename="alumni_export" pdfTargetId="alumni-table-container" />
            </div>
          </div>

          <div id="alumni-table-container">
            {loading ? (
              <div className="empty-state"><p>Loading alumni...</p></div>
            ) : alumni.length === 0 ? (
              <div className="empty-state"><p>No alumni match the selected filters</p></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Programme</th>
                    <th>Graduated</th>
                    <th>Industry</th>
                    <th>Certs</th>
                    <th>Degrees</th>
                    <th>Jobs</th>
                    <th>LinkedIn</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.map(a => (
                    <tr key={a.id}>
                      <td>
                        <strong>
                          {[a.first_name, a.last_name].filter(Boolean).join(" ") || "—"}
                        </strong>
                        {a.is_active_today === 1 && (
                          <span className="badge badge-orange" style={{ marginLeft: 6 }}>
                            ⭐ Featured
                          </span>
                        )}
                      </td>
                      <td>{a.email}</td>
                      <td>
                        {a.programme
                          ? <span className="badge badge-blue">{a.programme}</span>
                          : <span style={{ color: "#aaa" }}>—</span>}
                      </td>
                      <td>{a.graduation_date
                        ? new Date(a.graduation_date).getFullYear()
                        : <span style={{ color: "#aaa" }}>—</span>}
                      </td>
                      <td>
                        {a.industry_sector
                          ? <span className="badge badge-green">{a.industry_sector}</span>
                          : <span style={{ color: "#aaa" }}>—</span>}
                      </td>
                      <td><span className="badge badge-orange">{a.cert_count}</span></td>
                      <td><span className="badge badge-blue">{a.degree_count}</span></td>
                      <td><span className="badge badge-grey">{a.employment_count}</span></td>
                      <td>
                        {a.linkedin_url
                          ? <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer"
                               style={{ color: "#2E75B6", textDecoration: "none", fontSize: 12 }}>
                              View ↗
                            </a>
                          : <span style={{ color: "#aaa" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
