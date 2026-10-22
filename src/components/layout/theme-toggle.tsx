"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { buttonClass } from "@/lib/ui";

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme, animate: boolean) {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (animate && !reduceMotion) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 250);
  }
  root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  // The server cannot know the theme, so it renders `null`; the client then
  // reads the attribute set by the inline <head> script. This avoids a
  // hydration mismatch, and the icons are switched with CSS so the correct
  // one is visible before hydration.
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);

  // Safety net: when a document is rendered by React on the client instead of
  // parsed from HTML (e.g. a streamed not-found page), the inline <head>
  // script never runs. Apply the preference before paint in that case.
  useLayoutEffect(() => {
    if (document.documentElement.hasAttribute("data-theme")) return;
    const preferred =
      readStoredTheme() ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(preferred, false);
  }, []);

  // Follow OS changes until the visitor makes an explicit choice.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (!readStoredTheme()) applyTheme(event.matches ? "dark" : "light", true);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  function toggle() {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    applyTheme(next, true);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the theme still applies for this page view.
    }
  }

  const label =
    theme === null
      ? "Toggle color theme"
      : theme === "dark"
        ? "Dark theme active. Switch to light theme"
        : "Light theme active. Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={theme === null ? undefined : theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={buttonClass({ variant: "icon", className: "relative overflow-hidden" })}
    >
      <Sun
        size={16}
        aria-hidden="true"
        className="absolute transition-[transform,opacity] duration-300 motion-reduce:transition-none dark:rotate-90 dark:scale-50 dark:opacity-0"
      />
      <Moon
        size={16}
        aria-hidden="true"
        className="absolute -rotate-90 scale-50 opacity-0 transition-[transform,opacity] duration-300 motion-reduce:transition-none dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
    </button>
  );
}
