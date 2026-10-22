export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "bug-fix-lab-theme";

/**
 * Runs synchronously in <head> before the first paint: applies the saved
 * theme, or the OS preference when nothing is saved. Kept dependency-free and
 * wrapped in try/catch because storage can be unavailable (private mode,
 * blocked cookies).
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
