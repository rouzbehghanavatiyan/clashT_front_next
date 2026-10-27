export const PWA_INSTALL_DISMISSED_KEY = "pwa-install-dismissed";

export function getPwaInstallDismissed() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPwaInstallDismissed() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function clearPwaInstallDismissed() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PWA_INSTALL_DISMISSED_KEY);
  } catch {
    // ignore
  }
}
