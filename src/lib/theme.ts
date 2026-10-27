export const THEME_STORAGE_KEY = "@app_theme";
export type AppTheme = "light" | "dark";
export const DEFAULT_THEME: AppTheme = "light";

export function parseTheme(value: string | null | undefined): AppTheme {
  return value === "dark" ? "dark" : "light";
}

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light";}}catch(e){}})();`;
