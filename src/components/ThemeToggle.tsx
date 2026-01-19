"use client";

// src/components/ThemeToggle.tsx
import React, { useEffect } from "react";
import { useThemeStore } from "../stores/themeStore";

type ThemeToggleProps = {
  darkIcon: React.ReactNode;
  lightIcon: React.ReactNode;
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  darkIcon,
  lightIcon,
}) => {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, toggleTheme]);

  const icons = { dark: lightIcon, light: darkIcon };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-neutral-200 text-neutral-900 border border-neutral-300 shadow-sm transition-colors duration-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? icons.dark : icons.light}
    </button>
  );
};
