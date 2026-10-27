"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type AppTheme,
  parseTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: AppTheme;
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  isDark: false,
  setTheme: () => {},
});

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(DEFAULT_THEME);

  useEffect(() => {
    const next = parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
    setThemeState(next);
    applyTheme(next);
  }, []);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore quota / private mode
    }
    applyTheme(next);
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === "dark", setTheme }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
