import React, { useState } from "react";
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

  // ✅ ONLY ONE FUNCTION (FIXED)
  const handleRegister = async (e) => {
    e.preventDefault();

    const error = validatePassword(formData.password);
    if (error) {
      setPasswordError(error);
      return;
    }
    setPasswordError("");

    try {
      const res = await fetch(getApiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("Registration successful!");
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert("Server error");
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

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-[440px] w-full bg-white rounded-2xl shadow-xl border p-8">

          <h1 className="text-2xl font-bold text-center mb-4">
            Create Account
          </h1>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={() => {}}
              onError={() => {}}
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
              className="w-full h-12 bg-primary text-white rounded-lg"
            >
              Create Account
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