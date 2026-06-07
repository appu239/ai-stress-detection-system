// src/utils/api.js
// The backend URL is read from the REACT_APP_API_URL environment variable.
// In Vercel: set REACT_APP_API_URL = your Render backend URL
// In local dev: create a .env file with REACT_APP_API_URL=http://localhost:5000
// src/utils/api.js

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://stress-backend-w7nb.onrender.com";

// ✅ REGISTER API
export const registerUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

// ✅ LOGIN API
export const loginUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};