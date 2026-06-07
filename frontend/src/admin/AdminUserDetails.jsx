import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getApiUrl } from "../utils/api";

export default function AdminUserDetails() {
  const { userId } = useParams(); // This is the email
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl(`/api/users/${userId}`))
      .then(res => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then(data => {
        setUser({
          ...data,
          id: "UA-89234-X", // Placeholder ID as Mongo ID is hidden
          status: data.status || "Active",
          role: data.role || "User",
          lastModified: "Recently"
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  const handleBlock = async () => {
    const newStatus = "Blocked";
    try {
      await fetch(getApiUrl(`/api/users/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      setUser(prev => ({ ...prev, status: newStatus }));
      alert("User blocked successfully");
    } catch (err) {
      alert("Failed to block user");
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;
  if (!user) return <div className="p-10 text-white font-bold">User not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 font-mono">
          Administration / Users / <span className="text-blue-400 font-bold">{user.name}</span>
        </p>

        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-white tracking-tight">
            {user.name}
          </h1>
          <button className="px-5 py-2.5 bg-[#1c2333] border border-[#2d3748] rounded-xl text-xs font-bold text-slate-200 hover:bg-[#2d3748] transition-all">
            ✏️ Edit Profile
          </button>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <p className="text-sm font-medium text-slate-400">
            Email: <span className="text-slate-200 font-bold">{user.email}</span>
          </p>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
            {user.status}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">

        {/* Profile Overview */}
        <div className="lg:col-span-2 bg-[#111722] border border-[#1f2633] rounded-2xl p-8 shadow-2xl">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 px-1">Profile Overview</h3>

          <div className="space-y-1">
            <ProfileRow label="Email Address" value={user.email} />
            <ProfileRow label="Primary Role" value={user.role} />
            <ProfileRow label="Organization Unit" value="Engineering" />
            <ProfileRow label="Default Timezone" value="UTC+05:30 (IST)" />
            <ProfileRow label="Last Modified" value={user.lastModified} />
          </div>
        </div>

        {/* Security */}
        <div className="bg-[#111722] border border-[#1f2633] rounded-2xl p-8 shadow-2xl space-y-4">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 px-1">Security & Access</h3>

          <button className="w-full py-3 bg-[#1c2333] border border-[#2d3748] rounded-xl text-xs font-bold text-slate-200 hover:bg-[#2d3748] transition-all">
            🔒 Force Logout
          </button>
          <button className="w-full py-3 bg-[#1c2333] border border-[#2d3748] rounded-xl text-xs font-bold text-slate-200 hover:bg-[#2d3748] transition-all">
            🔑 Reset Password
          </button>
          <button
            onClick={handleBlock}
            className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
            ⛔ Block User Account
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between py-5 border-b border-[#1f2633] last:border-0 text-sm">
      <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{label}</span>
      <span className="text-slate-200 font-bold">{value}</span>
    </div>
  );
}
