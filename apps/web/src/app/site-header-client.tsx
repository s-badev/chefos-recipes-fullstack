"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { CurrentUser } from "../server/auth/session";

type NavigationItem = {
  href: string;
  label: string;
};

type SiteHeaderClientProps = {
  currentUser: CurrentUser | undefined;
  logoutAction: () => Promise<void>;
};

const guestNavigationItems: NavigationItem[] = [
  { href: "/", label: "Начало" },
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "За нас" }
];

const userNavigationItems: NavigationItem[] = [
  { href: "/", label: "Начало" },
  { href: "/catalog", label: "Каталог" },
  { href: "/favorites", label: "Любими" },
  { href: "/profile", label: "Профил" },
  { href: "/about", label: "За нас" }
];

const adminNavigationItem = { href: "/admin", label: "Админ" };
const loginItem = { href: "/login", label: "Вход" };

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getNavigationItems(currentUser: CurrentUser | undefined) {
  if (!currentUser) {
    return guestNavigationItems;
  }

  if (currentUser.role === "admin") {
    return [
      ...userNavigationItems.slice(0, 4),
      adminNavigationItem,
      userNavigationItems[4]
    ];
  }

  return userNavigationItems;
}

function getGreetingName(currentUser: CurrentUser) {
  const name = currentUser.name.trim();
  const firstName = name.split(/\s+/)[0];

  if (firstName) {
    return firstName;
  }

  const emailPrefix = currentUser.email.split("@")[0]?.trim();

  if (emailPrefix) {
    return emailPrefix;
  }

  return currentUser.role === "admin" ? "Admin" : "приятел";
}

export function SiteHeaderClient({ currentUser, logoutAction }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigationItems = getNavigationItems(currentUser);
  const greetingName = currentUser ? getGreetingName(currentUser) : undefined;

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    if (isMenuOpen) {
      modal.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previousOverflow; modal.close(); menuButton.current?.focus(); };
    }
    modal.close();
  }, [isMenuOpen]);

  function links() {
    return <>
      {navigationItems.map(item => <Link href={item.href} key={item.href} aria-current={isActivePath(pathname, item.href) ? "page" : undefined} onClick={() => setIsMenuOpen(false)}>{item.label}</Link>)}
      {currentUser ? <>
        <span className="nav-greeting">Здравей, {greetingName}</span>
        <form action={logoutAction}><button className="nav-link" type="submit">Изход</button></form>
      </> : <Link href={loginItem.href} aria-current={isActivePath(pathname, loginItem.href) ? "page" : undefined} onClick={() => setIsMenuOpen(false)}>{loginItem.label}</Link>}
    </>;
  }

  function keepMenuFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsMenuOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  return <>
    <header className={pathname === "/" ? "hdr" : "hdr solid"}>
      <div className="wrap">
        <Link className="logo" href="/" onClick={() => setIsMenuOpen(false)}>Chefo&apos;s</Link>
        <nav className="nav desktop-nav" aria-label="Основна навигация">{links()}</nav>
        <button className="menu-toggle" ref={menuButton} aria-expanded={isMenuOpen} aria-controls="mobile-menu" aria-label="Отвори менюто" onClick={() => setIsMenuOpen(true)} type="button">Меню <span aria-hidden="true">☰</span></button>
      </div>
    </header>
    <dialog className="mobile-menu" id="mobile-menu" ref={dialog} aria-label="Основна навигация" onKeyDown={keepMenuFocus} onCancel={() => setIsMenuOpen(false)} onClose={() => setIsMenuOpen(false)}>
      <div className="wrap mobile-menu-top"><span className="logo">Chefo&apos;s</span><button className="nav-link" autoFocus type="button" onClick={() => setIsMenuOpen(false)}>Затвори ×</button></div>
      <nav className="nav mobile-nav" aria-label="Мобилна навигация">{links()}</nav>
    </dialog>
  </>;
}
