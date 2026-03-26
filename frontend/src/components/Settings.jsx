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
      className="w-full rounded-[2rem] bg-white p-6 shadow"
      whileHover={{ y: -2 }}
    >
      <div className="rounded-[1.75rem] bg-blue-50 p-6">
        <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-blue-100 text-2xl font-bold text-blue-700 shadow-sm">
          {initials}
        </div>
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">
          Account
        </span>
        <h2 className="mt-2 text-2xl font-bold">{user?.name}</h2>
        <span className="mt-1 text-sm text-gray-600">@{user?.username}</span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-gray-50 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <UserRound size={18} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                Username
              </p>
              <p className="text-base font-semibold">{user?.username || "-"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-gray-50 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                Email
              </p>
              <p className="text-base font-semibold break-all">{user?.email || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );

  const logoutCard = (
    <Motion.div
      className="w-full rounded-xl bg-white p-5 shadow"
      whileHover={{ y: -2 }}
    >
      <div className="mb-4">
        <h3 className="font-semibold">Session</h3>
        <p className="mt-1 text-sm text-gray-600">
          Sign out from this account on this device.
        </p>
      </div>

      <Motion.button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-white shadow"
        onClick={onLogout}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <LogOut size={18} />
        Logout
      </Motion.button>
    </Motion.div>
  );

  return (
    <Motion.div
      className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="min-w-0">
        {theme === "dark" ? (
          <BorderGlow {...darkModeGlowProps}>
            {settingsCard}
          </BorderGlow>
        ) : (
          settingsCard
        )}
      </div>

      <div className="w-full">
        {theme === "dark" ? (
          <BorderGlow {...darkModeGlowProps}>
            {logoutCard}
          </BorderGlow>
        ) : (
          logoutCard
        )}
      </div>
    </Motion.div>
  );
}
