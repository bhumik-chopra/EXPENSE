import React from "react";
import { motion as Motion } from "framer-motion";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";

export default function Settings({ user, onLogout }) {
  const { theme } = useTheme();
  const initials = (user?.name || user?.username || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const settingsCard = (
    <Motion.div
      className="bg-white rounded-xl shadow p-6 max-w-md w-full mx-auto mb-4"
      whileHover={{ y: -2 }}
    >
      <h2 className="font-semibold mb-4">User Settings</h2>

      <div className="flex flex-col items-center mb-6">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
          {initials}
        </div>
        <span className="font-semibold text-lg">{user?.name}</span>
        <span className="text-sm text-gray-600">@{user?.username}</span>
      </div>

      <div className="mb-4 rounded-xl bg-gray-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <UserRound size={16} />
          <span className="text-sm font-medium">Username</span>
        </div>
        <input
          type="text"
          value={user?.username || ""}
          readOnly
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div className="mb-4 rounded-xl bg-gray-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={16} />
          <span className="text-sm font-medium">Email ID</span>
        </div>
        <input
          type="email"
          value={user?.email || ""}
          readOnly
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
        Active account is locked to the seeded demo user for now: `bhumik`.
      </div>
    </Motion.div>
  );

  return (
    <Motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {theme === "dark" ? (
        <BorderGlow {...darkModeGlowProps}>
          {settingsCard}
        </BorderGlow>
      ) : (
        settingsCard
      )}

      <Motion.button
        type="button"
        className="flex w-full max-w-md items-center justify-center gap-2 bg-red-500 px-4 py-2 text-white rounded shadow"
        onClick={onLogout}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <LogOut size={18} />
        Logout
      </Motion.button>
    </Motion.div>
  );
}
