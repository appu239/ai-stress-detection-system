import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import { getApiUrl } from "../utils/api";

export default function Analyze() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [audioBlob, setAudioBlob] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [stressLevel, setStressLevel] = useState("");
  const [transcription, setTranscription] = useState("");

  // =========================
  // FILE UPLOAD
  // =========================
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
    }
  };

  // =========================
  // MAIN ANALYSIS FUNCTION
  // =========================
  const startAnalysis = async () => {
    if (!audioBlob && !textInput.trim()) {
      alert("Please upload audio or enter text");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // ✅ FIX 1: Always send BOTH
      if (audioBlob) {
        formData.append("audio", audioBlob, "recording.wav");
      }

      formData.append("text", textInput || "No text");

      const res = await fetch(getApiUrl("/predict"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      const data = await res.json();

      // ❌ REMOVE ALERTS
      if (!res.ok) {
        console.error("Backend error:", data);
        return;
      }

      // ✅ FIX 2: Correct response keys
      setStressLevel(data.predicted_stress_level);
      setTranscription(data.speech_text);

    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Stress Analysis</h2>

      {/* AUDIO */}
      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      <br /><br />

      {/* TEXT */}
      <textarea
        placeholder="Enter how you feel..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        style={{ width: "300px", height: "100px" }}
      />

      <br /><br />

      <button onClick={startAnalysis} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      <br /><br />

      {/* RESULT */}
      {stressLevel && (
        <div>
          <h3>Stress Level: {stressLevel}</h3>
          <p>Text: {transcription}</p>
        </div>
      )}
    </div>
  );
}