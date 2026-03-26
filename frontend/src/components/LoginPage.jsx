import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { AlertCircle, LockKeyhole, Moon, Sun, UserRound } from "lucide-react";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { apiFetch } from "../utils/api";

export default function LoginPage({ theme, onToggleTheme, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Login failed");
      }

      onLoginSuccess(result.user);
    } catch (submitError) {
      setError(submitError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginCard = (
    <Motion.div
      className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <img
              src="/images/expense-tracker-sidebar-badge.svg"
              alt="Expense Tracker logo"
              className="h-16 w-auto max-w-[220px] object-contain"
            />
            <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in with your account credentials.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Username</span>
            <div className="flex items-center gap-2 rounded-xl border px-3 py-3">
              <UserRound size={18} className="text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                className="w-full border-0 bg-transparent p-0 focus:outline-none"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <div className="flex items-center gap-2 rounded-xl border px-3 py-3">
              <LockKeyhole size={18} className="text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full border-0 bg-transparent p-0 focus:outline-none"
                autoComplete="current-password"
              />
            </div>
          </label>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
    </Motion.div>
  );

  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 py-10 ${
        theme === "dark" ? "theme-dark" : "theme-light"
      }`}
    >
      {theme === "dark" ? (
        <BorderGlow {...darkModeGlowProps}>{loginCard}</BorderGlow>
      ) : (
        loginCard
      )}
    </div>
  );
}
