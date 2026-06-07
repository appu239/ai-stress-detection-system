import { useState, useEffect } from "react";
import { downloadCSV } from "../utils/exportUtils";
import { getApiUrl } from "../utils/api";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    total_users: 0,
    active_users: 0,
    high_stress_percentage: "0%",
    total_assessments: 0,
    daily_counts: []
  });

  useEffect(() => {
    fetch(getApiUrl("/api/analytics"))
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Failed to fetch analytics:", err));
  }, []);

  const formatDateRange = () => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);
    const options = { month: 'short', day: 'numeric' };
    return `${weekAgo.toLocaleDateString('en-US', options)} - ${today.toLocaleDateString('en-US', options)}, ${today.getFullYear()}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Platform usage & stress monitoring insights
          </p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 bg-[#111722] border border-[#1f2633] rounded-lg text-xs font-bold text-slate-300">
            {formatDateRange()}
          </div>

          <button
            onClick={() => downloadCSV([analytics], "analytics_report")}
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-all"
          >
            Export Report
          </button>
        </div>
      </header>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ["Total Users", analytics.total_users, "+2.4%"],
          ["Active Users", analytics.active_users, "+1.2%"],
          ["High Stress Rate", analytics.high_stress_percentage, "-0.5%"],
          ["Analysis Volume", analytics.total_assessments, "+4.8%"],
        ].map(([label, value, delta]) => (
          <div
            key={label}
            className="bg-[#111722] border border-[#1f2633] rounded-xl p-6 hover:bg-[#1f2633] hover:border-slate-600 transition-all duration-300"
          >
            <p className="text-xs text-slate-400 mb-2">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p
              className={`text-xs mt-2 ${delta.startsWith("-")
                ? "text-orange-400"
                : "text-emerald-400"
                }`}
            >
              {delta}
            </p>
          </div>
        ))}
      </section>

      {/* CHARTS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* DAILY ANALYSIS BAR GRAPH */}
        <div className="lg:col-span-2 bg-[#111722] border border-[#1f2633] rounded-xl p-6">
          <h3 className="font-bold mb-1">Daily Session Volume</h3>
          <p className="text-xs text-slate-400 mb-6">
            Global analysis activity for the past 7 days
          </p>

          <div className="flex items-end justify-between h-56 w-full px-2 gap-3">
            {(analytics.daily_counts || []).map((day, i) => {
              const counts = (analytics.daily_counts || []).map(d => Number(d.count) || 0);
              const maxCount = Math.max(...counts, 1);
              const currentCount = Number(day.count) || 0;
              const heightPercentage = (currentCount / maxCount) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-600 text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap shadow-xl">
                    {currentCount} Sessions
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full bg-blue-500/10 group-hover:bg-blue-500/30 transition-all rounded-t-md relative overflow-hidden border-x border-t border-blue-500/20 group-hover:border-blue-500/40"
                    style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                  >
                    {/* Glow effect at top */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />

                    {/* Inner fill for data-rich look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent" />
                  </div>

                  {/* Date Label */}
                  <span className="text-[10px] font-black text-slate-500 mt-4 group-hover:text-blue-400 transition-colors uppercase tracking-widest">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DONUT CHART */}
        <div className="bg-[#111722] border border-[#1f2633] rounded-xl p-6">
          <h3 className="font-bold mb-4">Stress Distribution</h3>

          <div className="relative w-44 h-44 mx-auto">
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full rotate-[-90deg]"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#1f2633"
                strokeWidth="12"
                fill="transparent"
              />

              {/* Main percentage */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#22c55e"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset="110"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(34,197,94,0.7)]"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold">Global</p>
              <p className="text-sm text-slate-400">100%</p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-emerald-400">Low</span>
              <span>42%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Moderate</span>
              <span>31%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400">High</span>
              <span>18%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-500">Critical</span>
              <span>9%</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI INSIGHTS */}
      <section className="bg-[#111722] border border-[#1f2633] rounded-xl p-6">
        <h3 className="font-bold mb-6 text-slate-200 flex items-center gap-2">
          AI Insights
          <span className="text-[10px] bg-blue-600 font-black text-white px-2 py-0.5 rounded uppercase">
            BETA
          </span>
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            "Peak stress observed Tuesday mornings (9–11 AM).",
            "Audio confidence improved by 4.2% this week.",
            "15% rise in critical stress in Tech Support team.",
          ].map((text, i) => (
            <div
              key={i}
              className="bg-[#0b1220] p-5 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all"
            >
              <p className="text-sm text-slate-300 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}