import React, { useEffect, useState } from "react";

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ✅ Load theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  // ✅ Toggle dark mode on button click
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6">Settings ⚙️</h1>

      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm transition-colors duration-300">
        <span className="font-medium text-lg">Dark Mode</span>

        <button
          onClick={toggleDarkMode}
          className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
            isDarkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <p className="mt-6 text-gray-600 dark:text-gray-300">
        Toggle the website between light and dark themes. Your preference is saved automatically.
      </p>
    </div>
  );
};

export default Settings;
