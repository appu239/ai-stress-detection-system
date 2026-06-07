import { useState, useEffect } from "react";
import { downloadCSV } from "../utils/exportUtils";
import { getApiUrl } from "../utils/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch(getApiUrl("/api/audit-logs"))
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setFilteredLogs(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const results = logs.filter(log =>
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ip && log.ip.includes(searchTerm))
    );
    setFilteredLogs(results);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, logs]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Real-time system activity and compliance monitoring
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="bg-[#135bec] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#135bec]/90 transition-all shadow-lg shadow-blue-500/10"
            onClick={() => downloadCSV(logs, "audit_logs")}
          >
            Export CSV
          </button>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Kpi title="Total Events" value={logs.length} trend="Live" />
        <Kpi title="Admin Actions" value={logs.filter(l => l.actor === 'Admin').length} sub="Total" />
        <Kpi title="Success Rate" value={`${Math.round((logs.filter(l => l.status === 'Success').length / logs.length) * 100 || 0)}%`} trend="Overall" />
        <Kpi title="Recent Events" value={logs.length > 0 ? "Active" : "Idle"} danger={logs.length === 0 ? "No Data" : ""} />
      </div>

      {/* SEARCH + FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-400"
            placeholder="Search by actor, IP, or event type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-blue-600 text-sm font-bold hover:underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden auto-rows-min">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-black uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-5 text-left">Timestamp</th>
              <th className="px-8 py-5 text-left">Event Type</th>
              <th className="px-8 py-5 text-left">Actor</th>
              <th className="px-8 py-5 text-left">Target</th>
              <th className="px-8 py-5 text-left">IP Address</th>
              <th className="px-8 py-5 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {currentLogs.map((log, index) => (
              <Row
                key={index}
                event={log.event}
                color={log.status === 'Success' ? 'blue' : 'red'}
                actor={log.actor}
                target={log.target}
                ip={log.ip}
                status={log.status}
                time={new Date(log.timestamp).toLocaleString()}
              />
            ))}
            {currentLogs.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-24 text-slate-400 font-bold italic">
                  No logs found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-between items-center px-8 py-6 text-xs text-slate-500 font-black tracking-widest bg-slate-50 border-t border-slate-200">
          <span className="uppercase">SHOWING {filteredLogs.length === 0 ? 0 : indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredLogs.length)} OF {filteredLogs.length}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 text-slate-600 hover:bg-slate-100 transition-all font-bold"
            >
              PREVIOUS
            </button>
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 font-bold">PAGE {currentPage} OF {totalPages || 1}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 text-slate-600 hover:bg-slate-100 transition-all font-bold"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-400 font-bold space-y-1 opacity-80">
        <p>SOC2 COMPLIANT · GDPR READY · 90-DAY RETENTION</p>
        <p>StressAI audit logs are tamper-proof and cryptographically signed.</p>
      </footer>
    </div >
  );
}

function Kpi({ title, value, trend, sub, warn, danger }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm group hover:border-blue-500/30 transition-all">
      <p className="text-xs uppercase font-black text-slate-400 tracking-widest mb-2 group-hover:text-slate-600 transition-colors">{title}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      {trend && <p className="text-emerald-600 text-xs font-black uppercase mt-2 tracking-tighter">{trend}</p>}
      {sub && <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-tighter">{sub}</p>}
      {warn && <p className="text-amber-600 text-xs font-black uppercase mt-2 tracking-tighter">{warn}</p>}
      {danger && <p className="text-rose-600 text-xs font-black uppercase mt-2 tracking-tighter">{danger}</p>}
    </div>
  );
}

function Row({ event, color, actor, target, ip, status, time }) {
  const badge = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-rose-50 text-rose-600 border-rose-100 font-bold",
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-8 py-5 text-sm text-slate-500 font-mono">
        {time}
      </td>
      <td className="px-8 py-5">
        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase shadow-sm border ${badge[color] || badge.blue}`}>
          {event}
        </span>
      </td>
      <td className="px-8 py-5 font-bold text-slate-800">{actor}</td>
      <td className="px-8 py-5 text-slate-600">{target}</td>
      <td className="px-8 py-5 text-sm font-mono text-slate-400">{ip}</td>
      <td className="px-8 py-5 text-center">
        <span className={`font-black text-sm ${status === "Success" ? "text-emerald-600" : "text-rose-600"}`}>
          {status.toUpperCase()}
        </span>
      </td>
    </tr>
  );
}
