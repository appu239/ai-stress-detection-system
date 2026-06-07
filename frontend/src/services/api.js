import axios from "axios";

const API = axios.create({
  baseURL: "https://stress-backend-w7nb.onrender.com",
});

// ✅ REGISTER
export const registerUser = (data) =>
  API.post("/register", data);

// ✅ LOGIN
export const loginUser = (data) =>
  API.post("/login", data);

// ✅ AUDIO ANALYSIS
export const analyzeAudio = (formData) =>
  API.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default API;