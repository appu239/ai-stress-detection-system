import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../utils/auth";

export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { label: "Overview", icon: "grid_view", path: "/admin/dashboard" },
        { label: "Analytics", icon: "analytics", path: "/admin/analytics" },
        { label: "User Management", icon: "group", path: "/admin/users" },
        { label: "Audit Logs", icon: "history", path: "/admin/audit-logs" },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        clearAuthSession();
        navigate("/");
    };

    return (
        <aside className="w-64 sticky top-0 h-screen bg-[#0b0e14] border-r border-[#1f2633] flex flex-col z-10 transition-colors">
            {/* HEADER */}
            <div className="p-6 pb-8 flex items-center gap-3 border-b border-[#1f2633]/50">
                <div className="size-10 rounded-xl bg-blue-600/10 flex items-center justify-center p-2 border border-blue-500/20">
                    <img src="/logo.png" alt="StressAI Logo" className="w-full h-full object-contain brightness-110" />
                </div>
                <div>
                    <h1 className="text-[13px] font-black tracking-tighter text-white leading-none mb-1">STRESSAI ADMIN</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        Enterprise Console
                    </p>
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-8">
                {navItems.map(({ label, icon, path }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-xs transition-all duration-300 group
              ${isActive(path)
                                ? "bg-[#135bec] text-white font-bold shadow-lg shadow-blue-600/20"
                                : "text-slate-500 hover:text-slate-200 hover:bg-white/5 font-bold"
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive(path) ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>
                            {icon}
                        </span>
                        <span className="tracking-wide">{label}</span>
                    </Link>
                ))}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-[#1f2633] space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                        AD
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">System Admin</p>
                        <p className="text-[10px] text-slate-400">admin@stressai.com</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-2 flex items-center gap-2 text-sm text-rose-500 font-bold hover:bg-rose-500/10 rounded-lg px-3 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg font-bold">logout</span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
