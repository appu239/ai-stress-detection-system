import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import { getApiUrl, wakeUpBackend } from "../utils/api";

function UserLogin() {
  const navigate = useNavigate();
  const [backendReady, setBackendReady] = useState(false);
  const [waking, setWaking] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Wake up Render backend on page load
  useEffect(() => {
    const wake = async () => {
      setWaking(true);
      const ok = await wakeUpBackend();
      setBackendReady(ok);
      setWaking(false);
    };
    wake();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(getApiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || data.message || "Login failed");
        setLoginLoading(false);
        return;
      }

      console.log("Login Response Data:", data); // DEBUG LOG

      // ✅ FIXED: use keys expected by auth.js
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_role", data.role);
      if (data.name) {
        localStorage.setItem("user_name", data.name);
      }

      // ✅ Redirect based on role
      if (data.role === "ADMIN") {
        console.log("Redirecting to ADMIN dashboard"); // DEBUG LOG
        navigate("/admin/dashboard");
      } else {
        console.log("Redirecting to USER analytics"); // DEBUG LOG
        navigate("/user/analyze");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        alert("Server is taking too long to respond. It may be waking up — please try again in a few seconds.");
      } else {
        alert("Cannot reach server. Please check your internet connection and try again.");
      }
      setLoginLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white min-h-screen flex flex-col">

      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-[#dbe0e6] dark:border-[#2d3a4a] bg-white dark:bg-[#101922] px-6 py-3">

        {/* LEFT SIDE (Logo + Title) */}
        <div className="flex items-center gap-3">
          <div className="size-8">
            <img src="/logo.png" alt="StressAI Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">StressAI</h2>
        </div>

        {/* RIGHT SIDE (Signup Button) */}
        <button
          onClick={() => navigate("/register")}
          className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
        >
          Sign Up
        </button>

      </header>

      {/* SERVER WAKING BANNER */}
      {waking && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-6 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Connecting to server... This may take 20-30 seconds on first visit.
            </span>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-[480px] rounded-xl bg-white dark:bg-[#1b2531] p-8 shadow-xl border">

          <div className="text-center mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-[#617589] dark:text-gray-400 mt-2">
              Sign in to access your StressAI dashboard.
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-sm font-semibold">Email or Username</label>
              <input
                name="email"
                type="text"
                required
                className="w-full h-12 px-4 rounded-lg border bg-white dark:bg-[#101922] text-slate-900 dark:text-white"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full h-12 px-4 rounded-lg border bg-white dark:bg-[#101922] text-slate-900 dark:text-white"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className={`w-full h-12 font-bold rounded-lg transition-all ${
                loginLoading
                  ? "bg-primary/60 text-white/80 cursor-not-allowed"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {loginLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>
        </section>
      </main>
      <PublicFooter />

    </div>
  );
}

export default UserLogin;