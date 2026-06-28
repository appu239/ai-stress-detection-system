import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { getApiUrl, wakeUpBackend } from "../utils/api";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [waking, setWaking] = useState(true);

  // Wake up Render backend on page load
  useEffect(() => {
    const wake = async () => {
      setWaking(true);
      await wakeUpBackend();
      setWaking(false);
    };
    wake();
  }, []);

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*]/.test(pass)) return "Password must contain at least one special character.";
    return "";
  };

  // ✅ ONLY ONE FUNCTION (FIXED)
  const handleRegister = async (e) => {
    e.preventDefault();

    const error = validatePassword(formData.password);
    if (error) {
      setPasswordError(error);
      return;
    }
    setPasswordError("");
    setRegisterLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(getApiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (!res.ok) {
        alert(data.error || "Registration failed");
        setRegisterLoading(false);
        return;
      }

      alert("Registration successful!");
      navigate("/login");

    } catch (err) {
      console.error(err);
      if (err.name === "AbortError") {
        alert("Server is taking too long to respond. It may be waking up — please try again in a few seconds.");
      } else {
        alert("Cannot reach server. Please check your internet connection and try again.");
      }
      setRegisterLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col font-display">

      {/* HEADER */}
      <header className="flex items-center justify-between border-b px-6 py-4 bg-white">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo" className="w-7 h-7" />
          <h2 className="text-xl font-bold">StressAI</h2>
        </div>
      </header>

      {/* SERVER WAKING BANNER */}
      {waking && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium text-amber-700">
              Connecting to server... This may take 20-30 seconds on first visit.
            </span>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-[440px] w-full bg-white rounded-2xl shadow-xl border p-8">

          <h1 className="text-2xl font-bold text-center mb-4">
            Create Account
          </h1>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  // Decode Google JWT to get user info
                  const token = credentialResponse.credential;
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const googleName = payload.name || payload.given_name || "Google User";
                  const googleEmail = payload.email;

                  // Register user with a secure default password (they logged in via Google)
                  const res = await fetch(getApiUrl("/register"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: googleName,
                      email: googleEmail,
                      password: `Google_${googleEmail}_${Date.now()}`
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok && !data.error?.includes("already")) {
                    alert(data.error || "Google registration failed");
                    return;
                  }

                  // Auto-login after Google registration
                  const loginRes = await fetch(getApiUrl("/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: googleEmail,
                      password: `Google_${googleEmail}_${Date.now()}`
                    }),
                  });

                  if (loginRes.ok) {
                    const loginData = await loginRes.json();
                    localStorage.setItem("auth_token", loginData.token);
                    localStorage.setItem("auth_role", loginData.role || "USER");
                    localStorage.setItem("user_name", googleName);
                    navigate("/user/analyze");
                  } else {
                    alert("Google registration successful! Please login with your Google email.");
                    navigate("/login");
                  }
                } catch (err) {
                  console.error("Google login error:", err);
                  alert("Google sign-in failed. Please register with email and password instead.");
                }
              }}
              onError={() => {
                alert("Google sign-in is not available. Please register with email and password.");
              }}
            />
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">

            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full h-12 border px-4 rounded-lg"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-12 border px-4 rounded-lg"
            />

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-12 border px-4 rounded-lg"
            />

            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}

            <button
              type="submit"
              disabled={registerLoading}
              className={`w-full h-12 rounded-lg font-bold transition-all ${
                registerLoading
                  ? "bg-primary/60 text-white/80 cursor-not-allowed"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {registerLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>

          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center text-sm text-gray-400">
        © 2024 StressAI
      </footer>

    </div>
  );
};

export default Register;