import axios from "axios";

const API = axios.create({
  baseURL: "https://stress-backend-w7nb.onrender.com",
});

export const analyzeAudio = (formData) =>
  API.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default API;