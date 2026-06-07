// src/utils/api.js
// The backend URL is read from the REACT_APP_API_URL environment variable.
// In Vercel: set REACT_APP_API_URL = your Render backend URL
// In local dev: create a .env file with REACT_APP_API_URL=http://localhost:5000
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
