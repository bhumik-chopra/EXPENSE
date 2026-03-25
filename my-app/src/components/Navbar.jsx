import React from "react";
import { motion as Motion } from "framer-motion";
import { Menu, Moon, Sun, UserCircle, X } from "lucide-react";
import StatusIndicator from "./StatusIndicator";

export default function Navbar({ theme, onToggleTheme, onToggleSidebar, sidebarOpen }) {
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
        <Motion.img
          src={theme === "dark" ? "/images/expense-tracker-logo-dark.svg" : "/images/smartspend-logo.svg"}
          alt="Expense Tracker logo"
          className="h-9 w-9 rounded-xl object-contain"
        />
        <h1 className="truncate text-lg font-bold tracking-tight md:text-xl">Expense Tracker</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <StatusIndicator />
        <Motion.button
          className="rounded-full p-2 hover:bg-gray-100 transition"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
        </Motion.button>
        <span className="hidden text-gray-600 sm:inline">Hello, User</span>
        <Motion.button
          className="rounded-full p-2 hover:bg-gray-100 transition"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          <UserCircle size={28} />
        </Motion.button>
      </div>
    </Motion.nav>
  );
}
