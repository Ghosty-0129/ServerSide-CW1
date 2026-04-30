import axios from "axios";

const API = axios.create({ baseURL: "/api" });

// Attach JWT from localStorage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401 received, clear storage and redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

//AUTH
export const register        = (data) => API.post("/auth/register", data);
export const verifyEmail     = (data) => API.post("/auth/verify-email-otp", data);
export const resendOtp       = (data) => API.post("/auth/resend-email-otp", data);
export const login           = (data) => API.post("/auth/login", data);
export const forgotPassword  = (data) => API.post("/auth/forgot-password", data);
export const resetPassword   = (data) => API.post("/auth/reset-password", data);

//ANALYTICS
const ANALYTICS_KEY = process.env.REACT_APP_ANALYTICS_KEY || "";

const analyticsHeaders = () => ({
  headers: { Authorization: `Bearer ${ANALYTICS_KEY}` }
});

export const getOverviewStats   = () => axios.get("/api/analytics/overview",    analyticsHeaders());
export const getSkillsGap       = (limit=10) => axios.get(`/api/analytics/skills-gap?limit=${limit}`,   analyticsHeaders());
export const getEmploymentByIndustry = () => axios.get("/api/analytics/industry", analyticsHeaders());
export const getJobTitles       = (limit=10) => axios.get(`/api/analytics/job-titles?limit=${limit}`,   analyticsHeaders());
export const getTopEmployers    = (limit=10) => axios.get(`/api/analytics/employers?limit=${limit}`,    analyticsHeaders());
export const getProgrammes      = () => axios.get("/api/analytics/programmes",  analyticsHeaders());
export const getGraduation      = () => axios.get("/api/analytics/graduation",  analyticsHeaders());
export const getCertGrowth      = () => axios.get("/api/analytics/cert-growth", analyticsHeaders());
export const getRadar           = () => axios.get("/api/analytics/radar",       analyticsHeaders());
export const getFilteredAlumni  = (params) => axios.get("/api/analytics/alumni", { ...analyticsHeaders(), params });
export const getFilterOptions   = () => axios.get("/api/analytics/alumni/filters", analyticsHeaders());
