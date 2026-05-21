"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  { href: "/", label: "Начало" },
  { href: "/catalog", label: "Каталог" },
  { href: "/favorites", label: "Любими" },
  { href: "/profile", label: "Профил" },
  { href: "/admin", label: "Админ" },
  { href: "/about", label: "За нас" }
];

const loginItem = { href: "/login", label: "Вход" };

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#fffaf3]/92 shadow-sm shadow-stone-900/[0.03] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex min-h-[82px] w-full items-center justify-between gap-6">
          <Link
            className="flex min-w-0 items-center gap-3.5 rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            href="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.2rem] bg-[linear-gradient(135deg,#f36b0f,#b94617)] text-white shadow-[0_14px_30px_rgba(185,70,23,0.3)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M6 13.5C4.3 13 3 11.5 3 9.7C3 7.5 4.8 5.8 7 5.8C7.6 3.6 9.6 2 12 2C14.4 2 16.4 3.6 17 5.8C19.2 5.8 21 7.5 21 9.7C21 11.5 19.7 13 18 13.5" />
                <path d="M6 13h12v7H6z" />
                <path d="M9 16h6" />
              </svg>
            </span>

            <span className="min-w-0">
              <span className="block text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                Домашна кухня
              </span>
              <span className="block truncate text-[1.35rem] font-black leading-tight text-stone-950 sm:text-2xl">
                Chefo&apos;s <span className="text-brand-600">Recipes</span>
              </span>
            </span>
          </Link>

          <div className="hidden items-center justify-end gap-3 lg:flex">
            <nav className="flex items-center justify-end gap-1 rounded-full border border-stone-200 bg-white/72 p-1 text-base font-bold text-stone-700 shadow-sm">
              {navigationItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Link
                    className={[
                      "rounded-full px-4 py-2 transition",
                      isActive
                        ? "bg-brand-50 text-brand-800 shadow-sm"
                        : "hover:bg-white hover:text-brand-700"
                    ].join(" ")}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              className={[
                "rounded-full px-5 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition",
                isActivePath(pathname, loginItem.href)
                  ? "bg-brand-700"
                  : "bg-brand-600 hover:bg-brand-700"
              ].join(" ")}
              href={loginItem.href}
            >
              {loginItem.label}
            </Link>
          </div>

          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Затвори менюто" : "Отвори менюто"}
            className="inline-grid h-12 w-12 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-700 lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <span className="flex h-5 w-5 flex-col justify-center gap-1.5">
              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition",
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                ].join(" ")}
              />
              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition",
                  isMenuOpen ? "opacity-0" : ""
                ].join(" ")}
              />
              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition",
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                ].join(" ")}
              />
            </span>
          </button>
        </div>

        {isMenuOpen ? (
          <nav className="grid gap-2 border-t border-stone-200 py-4 text-base font-bold text-stone-700 lg:hidden">
            {[...navigationItems, loginItem].map((item) => {
              const isLogin = item.href === loginItem.href;
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  className={[
                    "rounded-2xl px-4 py-3 transition",
                    isLogin
                      ? "bg-brand-600 text-white shadow-sm"
                      : isActive
                        ? "bg-brand-50 text-brand-800"
                        : "bg-white/82 hover:bg-white hover:text-brand-700"
                  ].join(" ")}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
