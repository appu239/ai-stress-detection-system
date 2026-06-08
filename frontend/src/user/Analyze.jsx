import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getUserInfo, getAuthToken } from "../utils/auth";
import { getApiUrl } from "../utils/api";

export default function Analyze() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setUserName(storedName);
    }

    return () => clearInterval(timer);
  }, []);
  const hour = currentTime.getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
        ? "Good Afternoon"
        : "Good Evening";

  const fileInputRef = useRef(null);

  const [audioBlob, setAudioBlob] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [stressLevel, setStressLevel] = useState("Low Stress");
  const [stressPercent, setStressPercent] = useState("0%");
  const [confidence, setConfidence] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [guidance, setGuidance] = useState([]);

  const stressConfig = {
    "Low Stress": {
      percent: "25%",
      color: "#10b981",
      bg: "#ecfdf5",
      guidance: [
        "You are emotionally balanced.",
        "Maintain hydration.",
        "Continue regular physical activity.",
        "Practice gratitude journaling."
      ],
    },
    "Moderate Stress": {
      percent: "55%",
      color: "#f59e0b",
      bg: "#fffbeb",
      guidance: [
        "Pause for 2 minutes and breathe deeply.",
        "Take short breaks between tasks.",
        "Avoid multitasking.",
        "Stretch every hour."
      ],
    },
    "High Stress": {
      percent: "75%",
      color: "#f43f5e",
      bg: "#fff1f2",
      guidance: [
        "Step away briefly from work.",
        "Practice 4-7-8 breathing technique.",
        "Take a 10-minute walk.",
        "Reduce screen time.",
        "Talk to someone you trust."
      ],
    },
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
      setTextInput("");
      setTranscription("Ready for upload...");
      triggerAnalysis(file, null);
    }
  };

  const startAIAnalysis = async () => {
    triggerAnalysis(audioBlob, textInput);
  };

  const triggerAnalysis = async (blob, text) => {
    try {
      setLoading(true);
      setTranscription("AI is listening and evaluating...");
      let res;

      if (blob) {
        const formData = new FormData();

        formData.append("audio", blob, "recording.wav");

        // ✅ FIX: ADD TEXT (MANDATORY FOR BACKEND)
        formData.append("text", text || "No text");

        formData.append("language", selectedLanguage);

        res = await fetch(getApiUrl("/predict"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${getAuthToken()}`
          },
          body: formData,
        });

      } else if (text && text.trim()) {

        // ✅ FIX: USE SAME /predict ENDPOINT
        const formData = new FormData();
        formData.append("text", text);

        res = await fetch(getApiUrl("/predict"), {
          method: "POST",
          body: formData,
        });

      } else {
        alert("Please upload or type text first");
        return;
      }

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      console.log("DEBUG: Backend response:", data);

      // ✅ FIX: USE YOUR BACKEND FIELD
      const result = data.prediction || "Low Stress";

      const config = stressConfig[result] || stressConfig["Low Stress"];

      setStressLevel(result);
      setStressPercent(config.percent);
      setConfidence(0);
      setGuidance(config.guidance);

      setTranscription(text || "[No speech text provided]");

    } catch (err) {
      console.error("ANALYSIS ERROR:", err);
      alert("Analysis failed. Check console or backend logs.");
      setTranscription("[Analysis Error]");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* UI UNCHANGED */}
    </div>
  );
}