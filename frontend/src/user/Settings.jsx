import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useTheme();

    // User data
    const [userName, setUserName] = useState(localStorage.getItem("user_name") || "User");
    const [email] = useState("user@example.com");
    const [notifications, setNotifications] = useState(localStorage.getItem("app_notifications") !== "false");

    // Password state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleSaveProfile = () => {
        if (!userName.trim()) {
            setMessage({ text: "Name cannot be empty", type: "error" });
            return;
        }
        localStorage.setItem("user_name", userName);
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    const validatePassword = (pass) => {
        if (pass.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
        if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
        if (!/[!@#$%^&*]/.test(pass)) return "Password must contain at least one special character.";
        return "";
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();

        const error = validatePassword(newPassword);
        if (error) {
            setMessage({ text: error, type: "error" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Passwords do not match", type: "error" });
            return;
        }
        // Simulate API call
        setMessage({ text: "Password changed successfully!", type: "success" });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    const toggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem("app_notifications", newVal);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex justify-between items-center bg-white dark:bg-[#1b2531] shadow-sm rounded-2xl p-6 transition-colors border border-slate-100 dark:border-slate-800">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-[#1e293b] dark:text-slate-100">Settings</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your profile, preferences, and account security.
                    </p>
                </div>
                {message.text && (
                    <div className={`px-4 py-2 rounded-lg font-semibold animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {message.text}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PROFILE & SECURITY */}
                <div className="space-y-8">
                    {/* PROFILE SECTION */}
                    <section className="bg-white dark:bg-[#1b2531] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-6 transition-colors">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100">
                            <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl">person</span>
                            Profile Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-[#1e293b] dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition placeholder-slate-500"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none"
                                />
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition active:scale-95 shadow-md shadow-primary/20"
                            >
                                Update Profile
                            </button>
                        </div>
                    </section>

                    {/* ACCOUNT SECURITY */}
                    <section className="bg-white dark:bg-[#1b2531] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-6 transition-colors">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100">
                            <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl">security</span>
                            Account Security
                        </h3>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-[#1e293b] dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-slate-500"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-[#1e293b] dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-slate-500"
                                    placeholder="Retype password"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90 transition active:scale-95"
                                >
                                    Change Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/forgot-password")}
                                    className="text-sm font-semibold text-primary hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                {/* APP PREFERENCES */}
                <div className="space-y-8">
                    <section className="bg-white dark:bg-[#1b2531] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-6 transition-colors">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100">
                            <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl">palette</span>
                            App Preferences
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-transparent dark:border-slate-800 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">Dark Mode</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Enable dark theme for the interface</p>
                                </div>
                                <button
                                    onClick={toggleDarkMode}
                                    className={`w-14 h-7 rounded-full transition-all relative ${darkMode ? 'bg-indigo-600 shadow-inner' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 size-5 bg-white rounded-full shadow-md transition-all ${darkMode ? 'left-8' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-transparent dark:border-slate-800 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">Email Notifications</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Receive weekly stress analysis summary</p>
                                </div>
                                <button
                                    onClick={toggleNotifications}
                                    className={`w-14 h-7 rounded-full transition-all relative ${notifications ? 'bg-indigo-600 shadow-inner' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 size-5 bg-white rounded-full shadow-md transition-all ${notifications ? 'left-8' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ACCOUNT HELP */}
                    <section className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 border border-primary/20 dark:border-primary/20 space-y-4 transition-colors">
                        <h4 className="font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <span className="material-symbols-outlined text-indigo-600">help</span>
                            Need help?
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            If you're having trouble with your account or settings, please visit our Help Center or contact support.
                        </p>
                        <button
                            onClick={() => navigate("/help")}
                            className="text-sm font-bold text-primary hover:underline"
                        >
                            Go to Help Center →
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}


