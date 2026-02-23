"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";
import { applyTheme, getInitialTheme, type Theme } from "../lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={`${styles.themeToggle} ${isLight ? styles.themeToggleOn : ""}`}
      aria-label="Theme switcher"
      aria-pressed={isLight}
      onClick={() => {
        if (!theme) {
          return;
        }

        const nextTheme: Theme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
    >
      <span className={styles.themeToggleBackground} />
      <span className={styles.themeToggleThumb} />
    </button>
  );
}
