"use client";

import { useState } from "react";

const navigationItems = [
  { href: "/", label: "Начало" },
  { href: "/catalog", label: "Каталог" },
  { href: "/favorites", label: "Любими" },
  { href: "/profile", label: "Профил" },
  { href: "/admin", label: "Админ" },
  { href: "/about", label: "За нас" },
  { href: "/login", label: "Вход" }
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#fffaf3]/95 backdrop-blur">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-14 2xl:px-16">
        <div className="flex min-h-[78px] w-full items-center justify-between gap-6">
          <a className="flex min-w-0 items-center gap-3" href="/">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-sm font-bold text-white shadow-sm shadow-brand-900/20">
              CR
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Chefo&apos;s Recipes
              </p>
              <h1 className="truncate text-xl font-bold leading-tight text-stone-950">
                Каталог с рецепти
              </h1>
            </div>
          </a>

          <nav className="hidden items-center justify-end gap-3 text-[15px] font-semibold text-stone-700 lg:flex xl:gap-5 xl:text-base">
            {navigationItems.map((item) => (
              <a
                className="rounded-full px-4 py-2 transition hover:bg-white hover:text-brand-700 hover:shadow-sm"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Затвори менюто" : "Отвори менюто"}
            className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-700 lg:hidden"
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
          <nav className="grid gap-2 border-t border-stone-200 py-4 text-base font-semibold text-stone-700 lg:hidden">
            {navigationItems.map((item) => (
              <a
                className="rounded-2xl bg-white/80 px-4 py-3 transition hover:bg-white hover:text-brand-700"
                href={item.href}
                key={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}