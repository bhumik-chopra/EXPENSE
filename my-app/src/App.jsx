import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import UploadCard from "./components/UploadCard";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import { ThemeContext } from "./components/ThemeContext";

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("expense-tracker-theme") || "light";
  });

  useEffect(() => {
    document.body.classList.toggle("theme-dark-body", theme === "dark");
    window.localStorage.setItem("expense-tracker-theme", theme);

    return () => {
      document.body.classList.remove("theme-dark-body");
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    setSidebarOpen(false);
  };

  let content;
  if (page === "Dashboard") content = <Dashboard />;
  else if (page === "Upload Receipt") content = <UploadCard />;
  else if (page === "Reports") content = <Reports />;
  else if (page === "Settings") content = <Settings />;

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div className={`app-shell flex min-h-screen bg-gray-50 ${theme === "dark" ? "theme-dark" : ""}`}>
        <Sidebar
          setPage={handlePageChange}
          activePage={page}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onToggleSidebar={() => setSidebarOpen((current) => !current)}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {content}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
