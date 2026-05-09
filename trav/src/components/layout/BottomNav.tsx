"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/search", label: "Search", Icon: IconSearch },
  { href: "/create", label: "Create", Icon: IconCreate },
  { href: "/saved", label: "Saved", Icon: IconSaved },
  { href: "/profile", label: "Profile", Icon: IconProfile },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="border-t border-neutral-200 bg-white/95 px-4 pt-2 shadow-[0_-8px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-white/80"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = isRouteActive(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-medium outline-none ring-primary/40 transition focus-visible:ring-4",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
                ].join(" ")}
              >
                <Icon aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M11 17a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m20 20-3.2-3.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCreate() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSaved() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4h10a2 2 0 0 1 2 2v15l-7-5-7 5V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 21a6 6 0 1 1 12 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
