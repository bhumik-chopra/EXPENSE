import React, { useEffect, useLayoutEffect, useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import UploadCard from "./components/UploadCard";
import Charts from "./components/Charts";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import LoginPage from "./components/LoginPage";
import Bhavishyvani from "./components/Bhavishyvani";
import { ThemeContext } from "./components/ThemeContext";
import { clearCurrentUser, persistCurrentUser } from "./utils/api";

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const [page, setPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("expense-tracker-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light-body", theme === "light");
    document.documentElement.classList.toggle("theme-dark-body", theme === "dark");
    document.body.classList.toggle("theme-light-body", theme === "light");
    document.body.classList.toggle("theme-dark-body", theme === "dark");
    window.localStorage.setItem("expense-tracker-theme", theme);

    return () => {
      document.documentElement.classList.remove("theme-light-body");
      document.documentElement.classList.remove("theme-dark-body");
      document.body.classList.remove("theme-light-body");
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

  const handleLoginSuccess = () => {
    setPage("Dashboard");
  };

  const handleLogout = async () => {
    await signOut();
    setPage("Dashboard");
    setSidebarOpen(false);
  };

  const user = clerkUser
    ? {
        id: clerkUser.id,
        username:
          clerkUser.username ||
          clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          "user",
        name: clerkUser.fullName || clerkUser.firstName || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        dob: clerkUser.unsafeMetadata?.dob || "",
      }
    : null;

  useLayoutEffect(() => {
    if (user?.id) {
      persistCurrentUser(user);
      return;
    }

    clearCurrentUser();
  }, [user]);

  let content;
  if (page === "Dashboard") content = <Dashboard />;
  else if (page === "Upload Receipt") content = <UploadCard />;
  else if (page === "Charts") content = <Charts />;
  else if (page === "BHAVISHYVANI") content = <Bhavishyvani />;
  else if (page === "Reports") content = <Reports />;
  else if (page === "Settings") {
    content = <Settings user={user} onLogout={handleLogout} />;
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          theme === "dark" ? "theme-dark" : "theme-light"
        }`}
      >
        <div className="rounded-2xl bg-white px-6 py-4 shadow">Checking session...</div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <ThemeContext.Provider value={{ theme }}>
        <LoginPage
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoginSuccess={handleLoginSuccess}
        />
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        className={`app-shell flex min-h-screen min-h-dvh overflow-x-hidden bg-gray-50 ${
          theme === "dark" ? "theme-dark" : "theme-light"
        }`}
      >
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
            user={user}
            onOpenSettings={() => handlePageChange("Settings")}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6">
            {content}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
