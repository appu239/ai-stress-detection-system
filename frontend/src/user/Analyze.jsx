import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import { getApiUrl } from "../utils/api";

export default function Analyze() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [audioBlob, setAudioBlob] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [moodContext, setMoodContext] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const getFormattedDateTime = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const datePart = currentTime.toLocaleDateString("en-US", options);
    const timePart = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return { datePart, timePart };
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
      setFileName(file.name);
    }
  };

  // Start analysis
  const startAnalysis = async () => {
    if (!audioBlob && !moodContext.trim()) {
      alert("Please upload audio or enter mood context");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      if (audioBlob) {
        formData.append("audio", audioBlob, fileName);
      }

      formData.append("text", moodContext || "No text");

      const res = await fetch(getApiUrl("/predict"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend error:", data);
        return;
      }

      // Add to results
      const newResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        stressLevel: data.predicted_stress_level || "N/A",
        transcription: data.speech_text || "No transcription",
        guidance: data.guidance || "No guidance available",
      };

      setAnalysisResults([newResult, ...analysisResults]);
      setAudioBlob(null);
      setFileName("No file chosen");
      setMoodContext("");
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const { datePart, timePart } = getFormattedDateTime();

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "48px", margin: "0 0 10px 0" }}>
            Good Afternoon, User
          </h1>
          <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
            Review your current stress indicators and analysis results.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", color: "#666" }}>{datePart}</div>
          <div style={{ fontSize: "14px", color: "#666" }}>{timePart}</div>
        </div>
      </div>

      {/* New Analysis Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "30px" }}>New Analysis</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
          }}
        >
          {/* Audio Analysis */}
          <div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                Audio Analysis
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  float: "right",
                }}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
              <div style={{ clear: "both" }} />
            </div>

            <div
              style={{
                border: "2px dashed #ddd",
                borderRadius: "8px",
                padding: "40px 20px",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                Ready to upload
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: "#0066cc",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                📁 Upload Audio File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                style={{ display: "none" }}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginTop: "12px",
                }}
              >
                {fileName}
              </div>
            </div>
          </div>

          {/* Mood Context */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Mood Context
            </label>
            <textarea
              placeholder="Describe how you are feeling or use voice input..."
              value={moodContext}
              onChange={(e) => setMoodContext(e.target.value)}
              style={{
                width: "100%",
                height: "150px",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        {/* Start Analysis Button */}
        <button
          onClick={startAnalysis}
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#0066cc",
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "30px",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "⏳ Analyzing..." : "Start AI analysis"}
        </button>
      </div>

      {/* Latest Analysis Results */}
      <div>
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          Latest Analysis Results
        </h2>

        {analysisResults.length > 0 ? (
          <div
            style={{
              overflowX: "auto",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Stress Score
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Transcription
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    AI Well-being Guidance
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysisResults.map((result) => (
                  <tr key={result.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{result.timestamp}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          backgroundColor: "#e6f2ff",
                          color: "#0066cc",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {result.stressLevel}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#666" }}>
                      {result.transcription.substring(0, 50)}...
                    </td>
                    <td style={{ padding: "12px", color: "#666" }}>
                      {result.guidance.substring(0, 50)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              color: "#999",
            }}
          >
            No analysis results yet. Start a new analysis above.
          </div>
        )}
      </div>
    </div>
  );
}