import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { downloadCSV } from "../utils/exportUtils";
import { getApiUrl } from "../utils/api";

export default function AdminUserManagement() {
  const [statusOpen, setStatusOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch(getApiUrl("/api/users"))
      .then(res => res.json())
      .then(data => {
        const mappedUsers = data.map((u, index) => ({
          id: u._id || `u${index}`,
          initials: u.name ? u.name.substring(0, 2).toUpperCase() : "NA",
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status || "Active",
          last: "Recently",
          created: "N/A"
        }));
        setUsers(mappedUsers);
      })
      .catch(err => console.error(err));
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch(getApiUrl(`/api/users/${email}`), {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter(u => u.email !== email));
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === "Active" ? "Blocked" : "Active";
    // Optimistic update
    setUsers(users.map(u => u.email === user.email ? { ...u, status: newStatus } : u));

    try {
      await fetch(getApiUrl(`/api/users/${user.email}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error(err);
      // Revert if failed
      setUsers(users.map(u => u.email === user.email ? { ...u, status: user.status } : u));
    }
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== "All" && u.status !== statusFilter) return false;
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <header className="px-8 pt-4 pb-4">
        <h2 className="text-4xl font-black text-slate-900">User Management</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Manage user access, status, and platform activity.
        </p>
      </header>

      {/* Toolbar */}
      <section className="px-8 py-4 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative w-[320px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              placeholder="Search users..."
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Status: <span className="text-slate-900 font-bold">{statusFilter}</span>
              <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
            </button>

            {statusOpen && (
              <div className="absolute mt-2 bg-white border border-slate-200 rounded-xl shadow-xl w-40 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {["All", "Active", "Blocked"].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setStatusOpen(false);
                    }}
                    className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Filter */}
          <div className="relative">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Role: <span className="text-slate-900 font-bold">{roleFilter}</span>
              <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
            </button>

            {roleOpen && (
              <div className="absolute mt-2 bg-white border border-slate-200 rounded-xl shadow-xl w-40 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {["All", "ADMIN", "USER"].map((r) => (
                  <div
                    key={r}
                    onClick={() => {
                      setRoleFilter(r);
                      setRoleOpen(false);
                    }}
                    className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export */}
        <button
          onClick={() => downloadCSV(users, "users_list")}
          className="flex items-center gap-2 bg-[#135bec] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#135bec]/90 transition-opacity shadow-md shadow-blue-500/10"
        >
          <span className="material-symbols-outlined">download</span>
          Export CSV
        </button>
      </section>

      {/* Table */}
      <section className="px-8 pb-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["User Name", "Email", "Role", "Status", "Last Active", "Actions"].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm">
                      {u.initials}
                    </div>
                    <span className="font-bold text-slate-800">{u.name}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-tighter border ${u.role === 'ADMIN'
                      ? 'bg-purple-50 text-purple-600 border-purple-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => handleStatusToggle(u)}
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter border transition-all ${u.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                        : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                        }`}>
                      {u.status}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500">{u.last}</td>
                  <td className="px-6 py-5 flex items-center gap-2">
                    {/* View Button */}
                    <Link to={`/admin/users/${u.email}`} className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(u.email)}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                      title="Delete User"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-slate-400 italic font-medium">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}