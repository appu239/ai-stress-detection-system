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

  /* =========================
     STATE & REFS (LOGIC ONLY)
     ========================= */

  const fileInputRef = useRef(null);

  const [audioBlob, setAudioBlob] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [stressLevel, setStressLevel] = useState("Low Stress"); // Default to low instead of high
  const [stressPercent, setStressPercent] = useState("0%");
  const [confidence, setConfidence] = useState(0);
  const [transcription, setTranscription] = useState(""); // Clear hardcoded placeholder
  const [guidance, setGuidance] = useState([]);

  /* =========================
     STRESS CONFIG
     ========================= */
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

  /* =========================
     FILE SELECT
     ========================= */

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
      setTextInput("");
      setTranscription("Ready for upload...");
      // Auto trigger analysis on file select
      triggerAnalysis(file, null);
    }
  };

  /* =========================
     BACKEND CALL (AUDIO + TEXT)
     ========================= */

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
        // EXPLICIT FILENAME ensures backend identifies binary data correctly
        formData.append("audio", blob, "recording.wav");
        formData.append("language", selectedLanguage);

        res = await fetch(getApiUrl("/predict"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${getAuthToken()}`
          },
          body: formData,
        });
      } else if (text && text.trim()) {
        res = await fetch(getApiUrl("/predict-text"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ text: text }),
        });
      } else {
        alert("Please upload or type text first");
        return;
      }

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      console.log("DEBUG: Backend response:", data);

      const config =
        stressConfig[data.predicted_stress_level] ||
        stressConfig["Low Stress"]; // Fallback to Low but correctly map
      setStressLevel(data.predicted_stress_level || "Low Stress");
      setStressPercent(config.percent);
      setConfidence(data.confidence || 0);
      setGuidance(config.guidance);

      // Ensure transcription is visible and formatted
      const finalTranscript = data.speech_text || data.text || text || "[No speech text provided]";
      setTranscription(finalTranscript);

      // Log results for easy debugging
      if (data.debug_probs) {
        console.table({
          "Stress Level": data.predicted_stress_level,
          "Confidence": (data.confidence * 100).toFixed(2) + "%",
          "Raw Probs": data.debug_probs.map(p => p.toFixed(4)).join(", ")
        });
      }
    } catch (err) {
      console.error("ANALYSIS ERROR:", err);
      alert("Analysis failed. Check console or backend logs.");
      setTranscription("[Analysis Error]");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI (UNCHANGED)
     ========================= */

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

          <button
            onClick={() => navigate("/user/history")}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/5 transition-all border border-slate-100 dark:border-slate-800"
            title="History"
          >
            <span className="material-symbols-outlined">history</span>
          </button>

          <button
            onClick={() => navigate("/user/settings")}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/5 transition-all border border-slate-100 dark:border-slate-800"
            title="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>



      {/* NEW ANALYSIS */}
      <section className="space-y-4">
        <h3 className="font-bold text-2xl text-slate-900 dark:text-white">New Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Audio Analysis */}
          <div className="bg-white dark:bg-[#1b2531] rounded-xl p-8 border border-slate-100 dark:border-slate-800 space-y-6 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Audio Analysis</h4>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-full px-3 py-1 outline-none text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-4 transition-colors">
              <p className="font-semibold text-[#1e293b] dark:text-slate-100">
                Ready to upload
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${loading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95"
                    }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {loading ? "sync" : "upload_file"}
                  </span>
                  {loading ? "Analyzing..." : "Upload Audio File"}
                </button>

                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>

          {/* Mood Context */}
          <div className="bg-white dark:bg-[#1b2531] rounded-xl p-8 border border-slate-100 dark:border-slate-800 space-y-6 transition-colors flex flex-col h-full">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Mood Context</h4>

            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setAudioBlob(null);
              }}
              className="w-full min-h-[150px] rounded-lg p-4 bg-slate-50 dark:bg-slate-900 text-[#1e293b] dark:text-slate-100 outline-none resize-none border border-slate-100 dark:border-slate-800 transition-colors"
              placeholder="Describe how you are feeling or use voice input…"
            />

            <button
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold"
              onClick={startAIAnalysis}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Start AI analysis"}
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="space-y-4">
        <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Latest Analysis Results</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-[#1b2531] rounded-xl p-8 border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8 transition-colors">
            <div className="text-center">
              <p className="text-sm font-bold tracking-[0.15em] text-slate-900 dark:text-slate-400 mb-4 opacity-80">
                LIVE STRESS SCORE
              </p>

              <div className="relative w-36 h-36 mx-auto">
                <svg className="-rotate-90 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={stressConfig[stressLevel]?.color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="264"
                    strokeDashoffset={264 - parseInt(stressPercent) * 2.64}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: stressConfig[stressLevel]?.color }}
                  >
                    {stressLevel}
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-tight">Confidence</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-200">
                      {(confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <p className="text-sm font-bold tracking-[0.15em] text-slate-900 dark:text-slate-400 opacity-80">
                TRANSCRIPTION
              </p>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 italic text-slate-900 dark:text-slate-200 border border-slate-100 dark:border-slate-800 transition-colors min-h-[100px] flex items-center shadow-inner">
                {transcription || (loading ? "Analyzing..." : "Your speech will appear here after analysis.")}
              </div>
            </div>
          </div>
          <aside
            className="rounded-xl p-6 border border-slate-100 dark:border-slate-800"
            style={{ backgroundColor: stressConfig[stressLevel]?.bg }}
          >
            <h4
              className="font-semibold mb-2"
              style={{ color: stressConfig[stressLevel]?.color }}
            >
              AI Well-being Guidance
            </h4>

            <ul className="space-y-2">
              {Array.isArray(guidance) ? guidance.map((item, index) => (
                <li key={index} className="text-base text-slate-800 dark:text-slate-300 font-medium leading-relaxed flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 rounded-full bg-slate-500 shrink-0" />
                  {item}
                </li>
              )) : (
                <li className="text-sm text-slate-600 leading-relaxed">{guidance}</li>
              )}
            </ul>
          </aside>

        </div>
      </section>
    </div>
  );
}