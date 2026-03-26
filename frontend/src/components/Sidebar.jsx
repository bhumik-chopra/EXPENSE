import React from "react";
import { motion as Motion } from "framer-motion";
import { Home, Upload, BarChart2, Settings } from "lucide-react";
import { useTheme } from "./ThemeContext";
import sidebarBadge from "../assets/expense-tracker-sidebar-badge.svg";
import sidebarBadgeDark from "../assets/expense-tracker-sidebar-badge-dark.svg";


const menu = [
  { name: "Dashboard", icon: <Home size={20} /> },
  { name: "Upload Receipt", icon: <Upload size={20} /> },
  { name: "Reports", icon: <BarChart2 size={20} /> },
  { name: "Settings", icon: <Settings size={20} /> },
];

export default function Sidebar({ setPage, activePage, isOpen, onClose }) {
  const { theme } = useTheme();

  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close navigation overlay"
          onClick={onClose}
        />
      )}
      <Motion.aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 max-w-[82vw] flex-col bg-white py-6 shadow-md transition-transform duration-300 md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-8 px-6 pt-10 md:pt-0">
          <img
            src={theme === "dark" ? sidebarBadgeDark : sidebarBadge}
            alt="Expense Tracker"
            className="w-full max-w-[220px] rounded-2xl object-contain"
          />
        </div>
        <nav className="flex-1 px-2">
          <ul className="space-y-2">
            {menu.map((item) => (
              <Motion.li
                key={item.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Motion.button
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-gray-100 ${
                    activePage === item.name ? "bg-gray-100 font-semibold" : "text-gray-700"
                  }`}
                  onClick={() => setPage(item.name)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </Motion.button>
              </Motion.li>
            ))}
          </ul>
        </nav>
      </Motion.aside>
    </>
  );
}
