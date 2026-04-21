"use client";

import { useSyncExternalStore, useCallback } from "react";

type Theme = "system" | "light" | "dark";

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return "system";
}

function getServerSnapshot(): Theme {
  return "system";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function applyTheme(t: Theme) {
  if (t === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", t);
  }
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Apply data-theme attribute on mount and when theme changes
  if (typeof window !== "undefined") {
    applyTheme(theme);
  }

  const cycle = useCallback(() => {
    const order: Theme[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    if (next === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", next);
    }
    applyTheme(next);
    // Trigger re-render via storage event for other tabs
    window.dispatchEvent(new Event("storage"));
  }, [theme]);

  const labels: Record<Theme, string> = {
    system: "Auto",
    light: "Light",
    dark: "Dark",
  };

  return (
    <button
      onClick={cycle}
      className="text-[10px] uppercase tracking-[0.12em] text-neutral-500"
      aria-label={`Color theme: ${labels[theme]}. Click to change.`}
    >
      {labels[theme]}
    </button>
  );
}
