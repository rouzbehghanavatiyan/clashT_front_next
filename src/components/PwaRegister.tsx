"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getPwaInstallDismissed,
  setPwaInstallDismissed,
  clearPwaInstallDismissed,
} from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaInstallContextValue = {
  showBanner: boolean;
  showInstallEntry: boolean;
  dismissInstall: () => void;
  promptInstall: () => Promise<void>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function usePwaInstall() {
  return (
    useContext(PwaInstallContext) ?? {
      showBanner: false,
      showInstallEntry: false,
      dismissInstall: () => {},
      promptInstall: async () => {},
    }
  );
}

export default function PwaRegister({ children }: { children?: ReactNode }) {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setDismissed(getPwaInstallDismissed());
    setInstalled(isStandaloneDisplay());

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    }

    if (isStandaloneDisplay()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      clearPwaInstallDismissed();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismissInstall = useCallback(() => {
    setPwaInstallDismissed();
    setDismissed(true);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => null);
    setInstallEvent(null);
    if (choice?.outcome === "accepted") {
      setInstalled(true);
      clearPwaInstallDismissed();
    }
  }, [installEvent]);

  const canInstall = Boolean(installEvent) && !installed;
  const value = useMemo<PwaInstallContextValue>(
    () => ({
      showBanner: canInstall && !dismissed,
      showInstallEntry: canInstall && dismissed,
      dismissInstall,
      promptInstall,
    }),
    [canInstall, dismissed, dismissInstall, promptInstall],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      {value.showBanner && (
        <div className="fixed bottom-16 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl md:bottom-6 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Install Clash Talent</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Add the app to your home screen for faster access.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={dismissInstall}
              className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-semibold text-gray-700 dark:border-zinc-600 dark:text-gray-200"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={promptInstall}
              className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white"
            >
              Install
            </button>
          </div>
        </div>
      )}
    </PwaInstallContext.Provider>
  );
}
