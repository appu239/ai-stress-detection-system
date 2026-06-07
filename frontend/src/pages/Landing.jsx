import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import { motion } from "framer-motion";
import { getApiUrl } from "../utils/api";

const Landing = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(50);
  useEffect(() => {
    fetch(getApiUrl("/api/user-count"))
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setUserCount(50 + data.count);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user count", err);
      });
  }, []);
  return (
    <motion.div
      className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white transition-colors duration-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 backdrop-blur-md bg-white/70 dark:bg-black/70 transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="size-9 flex items-center justify-center">
              <img src="/logo.png" alt="StressAI Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              StressAI <span className="text-primary text-sm ml-1">College</span>
            </h2>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </nav>

          <div className="hidden md:flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all border border-slate-200">
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
              Get Started
            </button>
          </div>

        </div>
      </header>


      {/* ================= HERO ================= */}
      <section className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row gap-12 items-center">

          {/* LEFT SIDE */}
          <div className="flex-1 space-y-6">
            <span className="inline-block bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full">
              Academic Wellness & Mental Health
            </span>

            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              AI-Powered Stress Detection Platform
            </h1>

            <p className="text-[#617589] dark:text-gray-400 max-w-xl text-lg">
              Detect stress markers in real-time using advanced speech signal analysis and contextual intelligence.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-primary text-white px-8 h-14 rounded-xl font-bold shadow-xl shadow-primary/30 hover:translate-y-[-2px] transition-all"
              >
                Start Free Trial
              </button>

              <button
                onClick={() => navigate("/demo")}
                className="border border-gray-200 dark:border-gray-700 px-8 h-14 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 w-full">
            <div
              className="rounded-2xl shadow-2xl h-[320px] md:h-[380px] bg-cover bg-center border-4 border-white dark:border-gray-800"
              style={{
                backgroundImage:
                  "url(https://lh3.googleusercontent.com/aida-public/AB6AXuB84_AwEBjLO5Bdgo5einiDffZbgL0idM4DE5OHUKjNUq2EQXNxYFSB9CVrEKSGY3QfxvNW6k2LXEQoMyrgM4bWIoKVSxwcQ8VQvtGFTwf76UlTSeMDGjqbk6z2hq3Jfw_tjMKsnXyZmEg3hNuPDhV-dvKNNj0ArezzR5vcjnhxKK74LdlFGAdneaVJkiRuNbYmL9-Q5SQcpObl_lib6aTNbgc_zGDuE_cKM5YoEVIbH5WQ6YsF_5befU-cVnMxwAIJKkvRaQHyJQ)"
              }}
            />
          </div>

        </div>
      </section>
      {/* ================= STATS ================= */}
      <section className="bg-white dark:bg-gray-900 py-14 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-6 text-center">
          <div className="p-8 rounded-xl border bg-background-light/30 dark:bg-gray-900/40">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Active Users</p>
            <p className="text-4xl font-black mt-2">{userCount}+</p>
          </div>
          <div className="p-8 rounded-xl border bg-background-light/30 dark:bg-gray-900/40">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Analysis Accuracy</p>
            <p className="text-4xl font-black mt-2">98.5%</p>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 py-24 text-center">
        <h2 className="text-primary font-bold uppercase tracking-widest text-sm">
          Platform Capabilities
        </h2>
        <h3 className="text-4xl font-black mt-4 tracking-tight">
          Advanced Well-being Features
        </h3>

        <div className="grid md:grid-cols-3 gap-8 mt-14">
          <div className="p-8 border rounded-2xl hover:shadow-xl transition-all">
            <h4 className="text-xl font-bold">Direct Signal Extraction</h4>
            <p className="text-gray-500 mt-2">
              Objective stress analysis directly from speech signals.
            </p>
          </div>
          <div className="p-8 border rounded-2xl hover:shadow-xl transition-all">
            <h4 className="text-xl font-bold">Multi-format Analysis</h4>
            <p className="text-gray-500 mt-2">
              Speech-to-text and text-to-text stress detection.
            </p>
          </div>
          <div className="p-8 border rounded-2xl hover:shadow-xl transition-all">
            <h4 className="text-xl font-bold">Multilingual Support</h4>
            <p className="text-gray-500 mt-2">
              Native-level processing across multiple languages.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="bg-[#111418] dark:bg-primary/10 text-white rounded-3xl p-16 text-center">
          <h2 className="text-4xl font-black">
            Ready to transform student well-being?
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Start your AI-powered mental health initiative today.
          </p>
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => navigate("/register")}
              className="bg-primary px-10 h-14 rounded-xl font-bold shadow-xl shadow-primary/20">
              Get Started
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="border border-white/20 px-10 h-14 rounded-xl font-bold hover:bg-white/10 transition-all">
              Contact Admissions
            </button>
          </div>
        </div>
      </motion.section>

      <PublicFooter />

    </motion.div>
  );
};

export default Landing;