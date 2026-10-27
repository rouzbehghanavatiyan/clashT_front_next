export const PUBLIC_ROUTES = ["/login", "/signUp", "/forgot-password", "/offline"];

export const RESERVED_PATHS = [
  "login",
  "signUp",
  "forgot-password",
  "watch",
  "create",
  "top",
  "best",
  "profile",
  "chat",
  "home",
  "settings",
  "clashTalent",
  "messages",
  "videos",
  "support",
  "offline",
  "block-list",
  "privacy",
  "terms",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
];

export type MainTabId = "home" | "watch" | "create" | "top" | "profile";

export const MAIN_TABS: {
  id: MainTabId;
  name: string;
  href: string;
}[] = [
  { id: "home", name: "Home", href: "/" },
  { id: "watch", name: "Watch", href: "/watch" },
  { id: "create", name: "Create", href: "/create" },
  { id: "top", name: "Top", href: "/top" },
  { id: "profile", name: "Profile", href: "/profile" },
];

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isProtectedRoute(pathname: string) {
  if (pathname === "/") return true;
  return (
    pathname.startsWith("/create") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/block-list") ||
    pathname === "/profile"
  );
}

export function showsChatAction(pathname: string) {
  return pathname.startsWith("/watch") || pathname.startsWith("/top");
}

export function isMainTabPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/watch" ||
    pathname === "/create" ||
    pathname === "/top" ||
    pathname === "/best" ||
    pathname === "/profile" ||
    pathname === "/home"
  );
}

export function isTabActive(
  tab: MainTabId,
  pathname: string,
  username?: string,
) {
  switch (tab) {
    case "home":
      return pathname === "/";
    case "watch":
      return pathname.startsWith("/watch");
    case "create":
      return pathname.startsWith("/create");
    case "top":
      return pathname.startsWith("/top") || pathname.startsWith("/best");
    case "profile":
      if (pathname === "/profile" || pathname.startsWith("/profile/")) {
        return true;
      }
      if (username) {
        const encoded = `/${encodeURIComponent(username)}`;
        return pathname === encoded || pathname.startsWith(`${encoded}/`);
      }
      return false;
    default:
      return false;
  }
}

export function pageTitleFromPath(pathname: string) {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/watch")) return "Watch";
  if (pathname.startsWith("/create")) return "Create";
  if (pathname.startsWith("/top") || pathname.startsWith("/best")) return "Top";
  if (pathname.startsWith("/chat")) return "Messages";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/support")) return "Support & Contact";
  if (pathname.startsWith("/block-list")) return "Block List";
  if (pathname.startsWith("/profile")) return "Profile";
  return "Clash Talent";
}
