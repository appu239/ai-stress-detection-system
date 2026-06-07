import React, { useState } from "react";
import PublicFooter from "../components/PublicFooter";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*]/.test(pass)) return "Password must contain at least one special character.";
    return "";
  };
  const handleRegister = async (e) => {
    e.preventDefault();

    const error = validatePassword(formData.password);
    if (error) {
      setPasswordError(error);
      return;
    }
    setPasswordError("");

    try {
      const response = await fetch(getApiUrl("/api/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Server error");
    }
  };
  return (
    <div className="bg-background-main min-h-screen flex flex-col font-display text-text-main">

      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between border-b border-gray-100 px-6 md:px-12 py-4 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="size-7">
            <img src="/logo.png" alt="StressAI Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-gray-900 text-xl font-bold tracking-tight">
            StressAI
          </h2>
        </div>


      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-[440px] w-full bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">

          {/* Title */}
          <div className="pt-10 pb-6 px-10 text-center">
            <h1 className="text-gray-900 text-3xl font-bold tracking-tight">
              Create account
            </h1>
            <p className="text-gray-500 text-base mt-2">
              Start your enterprise wellness journey
            </p>
          </div>

          <div className="px-10 pb-10 space-y-6">

            {/* Google Signup */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const response = await fetch(getApiUrl("/api/google-login"), {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        token: credentialResponse.credential,
                      }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                      // Save backend JWT token
                      localStorage.setItem("auth_token", data.token);
                      localStorage.setItem("auth_role", data.role);
                      localStorage.setItem("user_name", data.name);
                      navigate("/user/analyze");
                    } else {
                      alert("Google login failed");
                      console.log(data);
                    }
                  } catch (error) {
                    console.error("Error:", error);
                  }
                }}
                onError={() => {
                  console.log("Google Login Failed");
                }}
              />
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="mx-4 text-[13px] font-medium text-gray-400">
                or
              </span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Form */}
            <form className="space-y-4"
              onSubmit={handleRegister} >

              <div className="space-y-1.5">
                <label className="text-gray-700 text-sm font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input w-full h-12 rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-700 text-sm font-semibold">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="form-input w-full h-12 rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-700 text-sm font-semibold">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="form-input w-full h-12 rounded-lg border border-gray-200 px-4 pr-10 text-base text-gray-900 outline-none"
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 cursor-pointer select-none"
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1 animate-in slide-in-from-top-1">
                    {passwordError}
                  </p>
                )}

                {/* Password Strength */}
                <div className="flex gap-1 pt-1">
                  <div className="password-strength-segment strength-strong" />
                  <div className="password-strength-segment strength-strong" />
                  <div className="password-strength-segment strength-medium" />
                  <div className="password-strength-segment" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-primary text-white rounded-lg text-base font-semibold hover:bg-blue-600 transition-all shadow-sm"
              >
                Create Account
              </button>
              <p className="text-sm text-center mt-4 text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-primary font-semibold hover:underline">
                  Login
                </a>
              </p>

              <p className="text-[12px] text-gray-500 text-center leading-relaxed mt-4">
                By signing up, you agree to our{" "}
                <a href="#" className="text-primary font-medium hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary font-medium hover:underline">
                  Privacy Policy
                </a>.
              </p>

            </form>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 text-center text-sm text-gray-400 bg-white border-t border-gray-100">
        <div className="flex justify-center gap-8 mb-6 font-medium text-gray-500">
          <button onClick={() => alert("Help Center not implemented yet")} className="hover:text-primary transition-colors">Help Center</button>
          <button onClick={() => alert("Security policy not implemented yet")} className="hover:text-primary transition-colors">Security</button>
          <button onClick={() => alert("FAQ not implemented yet")} className="hover:text-primary transition-colors">Enterprise FAQ</button>
        </div>
        <p>© 2024 StressAI Enterprise Wellness. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Register;
