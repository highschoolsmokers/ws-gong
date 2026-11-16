"use client";

import { useEffect, useSyncExternalStore } from "react";

// system → light → dark. "system" clears the key; the inline script in
// app/layout.tsx applies a stored choice before first paint.
const ORDER = ["system", "light", "dark"] as const;
const LABEL = { system: "Auto", light: "Light", dark: "Dark" };
type Theme = (typeof ORDER)[number];

const read = (): Theme => {
  const t = localStorage.getItem("theme");
  return t === "light" || t === "dark" ? t : "system";
};
const subscribe = (cb: () => void) => {
  addEventListener("storage", cb);
  return () => removeEventListener("storage", cb);
};

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, (): Theme => "system");
  useEffect(() => {
    if (theme === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    dispatchEvent(new Event("storage")); // storage events don't fire in the writing tab
  };

  return (
    <button
      onClick={cycle}
      aria-label={`Color theme: ${LABEL[theme]}. Click to change.`}
      className="swiss-label"
    >
      {LABEL[theme]}
    </button>
  );
}
