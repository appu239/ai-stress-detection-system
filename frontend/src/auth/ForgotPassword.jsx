import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import { getApiUrl } from "../utils/api";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(getApiUrl("/api/forgot-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                alert(data.error || "Something went wrong");
            }
        } catch (err) {
            alert("Backend not reachable");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white min-h-screen flex flex-col">
            <header className="flex items-center justify-between border-b border-[#dbe0e6] dark:border-[#2d3a4a] bg-white dark:bg-[#101922] px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="size-8 cursor-pointer" onClick={() => navigate("/")}>
                        <img src="/logo.png" alt="StressAI Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight cursor-pointer" onClick={() => navigate("/")}>StressAI</h2>
                </div>
                <button
                    onClick={() => navigate("/login")}
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    Back to Login
                </button>
            </header>

            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <section className="w-full max-w-[480px] rounded-xl bg-white dark:bg-[#1b2531] p-8 shadow-xl border">
                    <div className="text-center mb-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                            <span className="material-symbols-outlined text-3xl">mail</span>
                        </div>
                        <h1 className="text-2xl font-bold">Forgot Password?</h1>
                        <p className="text-[#617589] dark:text-gray-400 mt-2">
                            {submitted
                                ? "If an account exists for this email, you will receive reset instructions shortly."
                                : "Enter your email address and we'll send you instructions to reset your password."}
                        </p>
                    </div>

                    {!submitted ? (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="text-sm font-semibold">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 rounded-lg border bg-white dark:bg-[#101922] text-slate-900 dark:text-white"
                                    placeholder="you@company.com"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition"
                            >
                                Send Reset Link
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:opacity-90 transition"
                        >
                            Return to Login
                        </button>
                    )}
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
