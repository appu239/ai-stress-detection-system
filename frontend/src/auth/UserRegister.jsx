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
      const response = await fetch(getApiUrl("/register"), {   // ✅ FIXED
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
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      alert("Server error");
      console.error(error);
    }
  };

  return (
    <div className="bg-background-main min-h-screen flex flex-col font-display text-text-main">

      {/* HEADER */}
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

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-[440px] w-full bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">

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
                    const response = await fetch(getApiUrl("/google-login"), { // ✅ FIXED (or remove)
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
                      localStorage.setItem("auth_token", data.token);
                      localStorage.setItem("auth_role", data.role);
                      localStorage.setItem("user_name", data.name);
                      navigate("/user/analyze");
                    } else {
                      alert("Google login failed");
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

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleRegister}>

              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-input w-full h-12 border px-4"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="form-input w-full h-12 border px-4"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="form-input w-full h-12 border px-4"
              />

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-primary text-white rounded-lg"
              >
                Create Account
              </button>

            </form>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-12 text-center text-sm text-gray-400 bg-white border-t border-gray-100">
        <p>© 2024 StressAI Enterprise Wellness. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Register;