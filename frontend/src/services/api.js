import axios from "axios";

const API = axios.create({
  baseURL: "https://multimodal-stress-detection-4.onrender.com",
});

export const analyzeAudio = (formData) =>
  API.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const analyzeText = (text) =>
  API.post("/predict_text", { text });

export default API;
