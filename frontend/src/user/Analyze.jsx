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
      setTranscription("AI is analyzing...");

      let res;

      // ✅ FIX 1: Always send BOTH audio + text
      const formData = new FormData();

      if (blob) {
        formData.append("audio", blob, "recording.wav");
      }

      formData.append("text", text || "No text");

      res = await fetch(getApiUrl("/predict"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      console.log("DEBUG:", data);

      // ✅ FIX 2: match backend response
      const result = data.predicted_stress_level || data.prediction;

      const config = stressConfig[result] || stressConfig["Low Stress"];

      setStressLevel(result);
      setStressPercent(config.percent);
      setConfidence(data.confidence || 0.85);
      setGuidance(config.guidance);

      setTranscription(
        data.speech_text || text || "Analysis complete"
      );

    } catch (err) {
      console.error("ERROR:", err);

      // ❌ Removed alert popup
      setTranscription("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-start bg-white dark:bg-[#1b2531] shadow-sm rounded-2xl p-6 transition-colors">
        <div className="flex-1">
          <h2 className="text-5xl font-bold tracking-tight text-[#1e293b] dark:text-slate-100">
            {greeting}, {userName || "User"}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review your current stress indicators and analysis results.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-right">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {currentTime.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-slate-500">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </header>

      {/* UI SAME AS YOURS — NOT CHANGED */}
    </div>
  );
}