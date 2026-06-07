import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuthSession } from "../utils/auth";

export default function UserSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem("user_name");
        if (storedName) {
            setUserName(storedName);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        clearAuthSession();
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 bg-white dark:bg-[#1b2531] border-r border-[#e5e7eb] dark:border-slate-800 p-6 flex flex-col transition-colors min-h-screen sticky top-0">
            <div className="flex items-center gap-3 mb-10">
                <div className="size-8">
                    <img src="/logo.png" alt="StressAI Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-bold tracking-tight text-[#1e293b] dark:text-slate-100">StressAI</h1>
                    <p className="text-xs text-slate-500 font-semibold uppercase">User Dashboard</p>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                <button
                    onClick={() => navigate("/user/analyze")}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${isActive("/user/analyze")
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                >
                    Analyze
                </button>
                <button
                    onClick={() => navigate("/user/history")}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${isActive("/user/history")
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                >
                    History
                </button>
                <button
                    onClick={() => navigate("/user/settings")}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${isActive("/user/settings")
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                >
                    Settings
                </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="font-semibold text-sm text-[#1e293b] dark:text-slate-100">{userName || "User"}</p>
                        <p className="text-xs text-slate-500">Premium User</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full py-2.5 flex items-center gap-2 text-sm text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg px-3 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
