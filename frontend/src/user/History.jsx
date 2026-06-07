import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { downloadCSV } from "../utils/exportUtils";
import { getApiUrl } from "../utils/api";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [activeTab, setActiveTab] = useState("All"); // All, Audio, Text
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl("/api/history"), {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;
    try {
      await axios.delete(getApiUrl(`/api/history/${id}`), {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleExport = () => {
    const exportData = filteredItems.map(item => ({
      Type: item.type,
      Level: item.prediction,
      Confidence: (item.confidence * 100).toFixed(1) + "%",
      Transcription: item.speech_text || item.text,
      Date: new Date(item.timestamp).toLocaleString()
    }));
    downloadCSV(exportData, "stress_history");
  };

  // FILTERING LOGIC
  const filteredItems = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = (item.speech_text || item.text || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === "All" || item.prediction.toLowerCase().includes(filterLevel.toLowerCase());

      let matchesTab = true;
      if (activeTab === "Audio Sessions") matchesTab = item.type === "audio";
      if (activeTab === "Text Logs") matchesTab = item.type === "text";
      if (activeTab === "Prioritized") matchesTab = item.prediction === "High Stress";

      return matchesSearch && matchesLevel && matchesTab;
    });
  }, [history, searchTerm, filterLevel, activeTab]);

  // PAGINATION
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getLevelColor = (level) => {
    if (level === "High Stress") return "red";
    if (level === "Moderate Stress") return "orange";
    return "emerald";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">
            Personal Stress History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mt-2">
            Reflect on your journey toward mental clarity. Your well-being history is private and secured.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-white/80 dark:hover:bg-slate-800 transition-all"
          >
            <span className="material-symbols-outlined">download</span>
            Export Data
          </button>
          <button
            onClick={() => navigate("/user/analyze")}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <span className="material-symbols-outlined">add</span>
            New Analysis
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white dark:bg-[#1b2531] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search insights, keywords, or mood patterns..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="flex gap-3">
            <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 font-bold text-sm text-slate-600 dark:text-slate-400">
              {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 font-bold text-sm text-slate-600 dark:text-slate-400 outline-none"
            >
              <option value="All">All Stress Levels</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 border-t border-slate-100 dark:border-slate-800 flex gap-10">
          {["All Analyses", "Audio Sessions", "Text Logs", "Prioritized"].map(tab => (
            <span
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`py-4 font-bold cursor-pointer transition-all border-b-2 ${activeTab === tab
                ? "text-indigo-700 dark:text-indigo-400 border-indigo-600"
                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
                }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white dark:bg-[#1b2531] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-8 py-4 text-sm uppercase text-slate-900 dark:text-slate-400 text-left font-bold opacity-70">Source Type</th>
              <th className="px-8 py-4 text-sm uppercase text-slate-900 dark:text-slate-400 text-left font-bold opacity-70">Therapy Insight</th>
              <th className="px-8 py-4 text-sm uppercase text-slate-900 dark:text-slate-400 text-left font-bold opacity-70">Analysis Snippet</th>
              <th className="px-8 py-4 text-sm uppercase text-slate-900 dark:text-slate-400 text-left font-bold opacity-70">Timestamp</th>
              <th className="px-8 py-4 text-sm uppercase text-slate-900 dark:text-slate-400 text-right font-bold opacity-70">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold">
                  Loading your history...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold">
                  No records found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${item.type === 'audio' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'} p-2 rounded-xl`}>
                        {item.type === 'audio' ? 'mic' : 'edit_note'}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {item.type === 'audio' ? 'Audio Analysis' : 'Text Entry'}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-black flex items-center gap-2 w-fit ${item.prediction === 'High Stress'
                      ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                      : item.prediction === 'Moderate Stress'
                        ? "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
                        : "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                      }`}>
                      {item.prediction === 'High Stress' && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                      {item.prediction.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-8 py-6 italic text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    “{item.speech_text || item.text}”
                  </td>

                  <td className="px-8 py-6">
                    <div>
                      <div className="font-bold text-slate-700 dark:text-slate-200">
                        {new Date(item.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <span
                      onClick={() => navigate("/user/analyze")} // Could navigate back or show a detail view
                      className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 mr-3 cursor-pointer hover:scale-110 transition-transform"
                    >
                      analytics
                    </span>
                    <span
                      onClick={() => deleteItem(item._id)}
                      className="material-symbols-outlined text-slate-400 hover:text-rose-500 cursor-pointer hover:scale-110 transition-transform"
                    >
                      delete
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-8 py-6 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-400">PAGE {currentPage} OF {totalPages}</span>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl font-bold transition-all ${currentPage === i + 1
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-500">
            verified_user
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-400">
            Secure AES-256 Cloud Storage Enabled
          </span>
        </div>
      </div>
    </div>
  );
}
