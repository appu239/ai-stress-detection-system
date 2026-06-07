import { useState, useEffect } from "react";

import { downloadCSV } from "../utils/exportUtils";
import { getApiUrl } from "../utils/api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    total_users: 0,
    active_users: 0,
    high_stress_percentage: "0%",
    total_assessments: 0
  });

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Fetch Analytics
    fetch(getApiUrl("/api/analytics"))
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error("Failed to fetch analytics:", err));

    // Fetch Recent Logs
    fetch(getApiUrl("/api/audit-logs"))
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Failed to fetch logs:", err));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Overview</h2>
          <p className="text-xs text-slate-500 font-medium">
            Live Data Overview ({new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })})
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-[#2a3242] rounded text-xs hover:bg-[#1f2633] transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={() => downloadCSV([analytics], "admin_summary")}
            className="px-4 py-2 bg-primary rounded text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Export Summary
          </button>
        </div>
      </header>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Total Users", analytics.total_users, "+2.4%", "text-emerald-400"],
          ["Active Users", analytics.active_users, "+1.2%", "text-emerald-400"],
          ["High-Stress Rate", analytics.high_stress_percentage, "-0.5%", "text-red-400"],
          ["Analysis Volume", analytics.total_assessments, "+5.8%", "text-emerald-400"],
        ].map(([label, value, delta, color]) => (
          <div
            key={label}
            className="bg-[#111722] border border-[#1f2633] rounded-xl p-5 hover:bg-[#1f2633] hover:border-slate-700 transition-all duration-300 cursor-default group"
          >
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 group-hover:text-slate-200 transition-colors">
              {label}
            </p>
            <div className="flex justify-between items-end">
              <p className="text-2xl font-bold">{value}</p>
              <span className={`text-xs font-bold ${color}`}>{delta}</span>
            </div>
          </div>
        ))}
      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Usage Trends */}
        <div className="bg-[#111722] border border-[#1f2633] rounded-xl p-6">
          <h4 className="text-sm font-bold mb-1">Usage Trends</h4>
          <p className="text-xs text-slate-400 mb-4">
            Real-time session activity (Last 30 Days)
          </p>

          <svg viewBox="0 0 500 200" className="w-full h-56">
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="M0 150 C60 110 100 60 140 90 C180 120 220 160 260 130
                   C300 100 330 50 370 80 C410 110 450 150 500 120
                   L500 200 L0 200 Z"
              fill="url(#trendFill)"
            />
            <path
              d="M0 150 C60 110 100 60 140 90 C180 120 220 160 260 130
                   C300 100 330 50 370 80 C410 110 450 150 500 120"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Stress Distribution */}
        <div className="bg-[#111722] border border-[#1f2633] rounded-xl p-6 relative">
          <h4 className="text-sm font-bold mb-6 text-slate-200">Stress Distribution</h4>

          <div className="flex items-center gap-10">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                <circle r="40" cx="50" cy="50" fill="none" stroke="#1f2633" strokeWidth="12" />
                <circle r="40" cx="50" cy="50" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="176 251" />
                <circle r="40" cx="50" cy="50" fill="none" stroke="#eab308" strokeWidth="12" strokeDasharray="50 251" strokeDashoffset="-176" />
                <circle r="40" cx="50" cy="50" fill="none" stroke="#fb923c" strokeWidth="12" strokeDasharray="20 251" strokeDashoffset="-226" />
                <circle r="40" cx="50" cy="50" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="5 251" strokeDashoffset="-246" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-black text-white">Global</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">100%</p>
              </div>
            </div>

            <div className="flex-1 space-y-3.5">
              {[
                { label: "Low", value: "70%", color: "text-emerald-400" },
                { label: "Moderate", value: "20%", color: "text-yellow-400" },
                { label: "High", value: "8%", color: "text-orange-400" },
                { label: "Critical", value: "2%", color: "text-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs font-bold">
                  <span className={item.color}>{item.label}</span>
                  <span className="text-slate-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM OPERATIONS LOG */}
      <section className="bg-[#111722] border border-[#1f2633] rounded-xl p-6">
        <h4 className="text-sm font-bold mb-4 tracking-wide">
          SYSTEM OPERATIONS LOG
        </h4>

        <table className="w-full table-fixed text-xs tabular-nums">
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[20%]" />
            <col className="w-[15%]" />
            <col className="w-[25%]" />
          </colgroup>

          <thead className="text-slate-400 border-b border-[#1f2633]">
            <tr className="h-10">
              <th className="text-left">EVENT</th>
              <th className="text-left">USER ID</th>
              <th className="text-center">STATUS</th>
              <th className="text-right">TIMESTAMP</th>
            </tr>
          </thead>

          <tbody>
            {logs.slice(0, 5).map((log, index) => (
              <tr key={index} className="h-11 border-b border-[#1f2633] hover:bg-white/5">
                <td>{log.event}</td>
                <td className="text-slate-300">{log.actor}</td>
                <td className="text-center">
                  <span
                    className={`inline-flex items-center justify-center min-w-[90px] h-6 rounded-full text-[10px] font-bold
                        ${log.status === "Success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                      }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="text-right text-slate-400 text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-slate-500">
                  No recent activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
