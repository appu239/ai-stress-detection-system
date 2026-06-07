import React from "react";
import { useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import { getApiUrl } from "../utils/api";

function UserLogin() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(getApiUrl("/api/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      console.log("Login Response Data:", data); // DEBUG LOG

      // ✅ FIXED: use keys expected by auth.js
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_role", data.role);

      // ✅ Redirect based on role
      if (data.role === "ADMIN") {
        console.log("Redirecting to ADMIN dashboard"); // DEBUG LOG
        navigate("/admin/dashboard");
      } else {
        console.log("Redirecting to USER analytics"); // DEBUG LOG
        navigate("/user/analyze");
      }
    } catch (error) {
      alert("Backend not reachable");
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
              className="w-full h-12 bg-primary text-white font-bold rounded-lg"
            >
              Sign in
            </button>
          </form>
        </section>
      </main>
      <PublicFooter />

    </div>
  );
}

export default UserLogin;