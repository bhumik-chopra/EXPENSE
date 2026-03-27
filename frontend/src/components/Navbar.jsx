import React from "react";
import { motion as Motion } from "framer-motion";
import { Menu, Settings, X } from "lucide-react";
import LogoutButton from "./LogoutButton";
import StatusIndicator from "./StatusIndicator";
import ThemeToggle from "./ThemeToggle";
import smartspendLogo from "../assets/smartspend-logo.svg";
import expenseTrackerLogoDark from "../assets/expense-tracker-logo-dark.svg";

export default function Navbar({
  theme,
  onToggleTheme,
  onToggleSidebar,
  sidebarOpen,
  user,
  onOpenSettings,
  onLogout,
}) {
  const initials = (user?.name || user?.username || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Motion.nav
      className="flex items-center justify-between gap-3 px-4 py-3 md:h-16 md:px-6 bg-white shadow-sm"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Motion.button
          className="rounded-full p-2 hover:bg-gray-100 transition md:hidden"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Close navigation" : "Open navigation"}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </Motion.button>
        <div className="relative h-9 w-9 overflow-hidden rounded-xl">
          <Motion.img
            src={smartspendLogo}
            alt="Expense Tracker logo"
            className="absolute inset-0 h-full w-full object-contain p-[3px]"
            animate={{ opacity: theme === "dark" ? 0 : 1, scale: theme === "dark" ? 0.985 : 1 }}
            transition={{ duration: 0.42, ease: "easeInOut" }}
          />
          <Motion.img
            src={expenseTrackerLogoDark}
            alt="Expense Tracker logo dark"
            className="absolute inset-0 h-full w-full object-contain p-[3px]"
            animate={{ opacity: theme === "dark" ? 1 : 0, scale: theme === "dark" ? 1 : 0.985 }}
            transition={{ duration: 0.42, ease: "easeInOut" }}
          />
        </div>
        <h1 className="truncate text-lg font-bold tracking-tight md:text-xl">Expense Tracker</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <StatusIndicator />
        <Motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <ThemeToggle
            checked={theme === "dark"}
            onChange={onToggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          />
        </Motion.div>
        <Motion.button
          className="hidden items-center gap-3 rounded-full px-3 py-2 hover:bg-gray-100 transition sm:flex"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenSettings}
          title="Open settings"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {initials}
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-semibold">{user?.name}</span>
            <span className="block truncate text-xs text-gray-600">@{user?.username}</span>
          </span>
          <Settings size={18} />
        </Motion.button>
        <Motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <LogoutButton theme={theme} onClick={onLogout} />
        </Motion.div>
      </div>
    </Motion.nav>
  );
}
