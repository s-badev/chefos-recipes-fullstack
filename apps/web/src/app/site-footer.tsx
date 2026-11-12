import Link from "next/link";
import type { ReactNode } from "react";
import { StitchBand } from "./stitch";

const footerSections = [
  {
    id: "browse",
    title: "Разглеждай",
    links: [
      { href: "/catalog", label: "Рецепти" },
      { href: "/favorites", label: "Любими" },
      { href: "/about", label: "За нас" }
    ]
  },
  {
    id: "profile",
    title: "Профил",
    links: [
      { href: "/login", label: "Вход" },
      { href: "/register", label: "Регистрация" },
      { href: "/profile", label: "Моят профил" }
    ]
  }
];

type SocialIconName = "facebook" | "instagram" | "linkedin" | "youtube" | "tiktok";

const socialLinks: Array<{ href: string; label: string; icon: SocialIconName }> = [
  { href: "#", label: "Facebook", icon: "facebook" },
  { href: "#", label: "Instagram", icon: "instagram" },
  { href: "#", label: "LinkedIn", icon: "linkedin" },
  { href: "#", label: "YouTube", icon: "youtube" },
  { href: "#", label: "TikTok", icon: "tiktok" }
];

const socialIcons: Record<SocialIconName, ReactNode> = {
  facebook: (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.2 8.25h2.25V5.1a12.3 12.3 0 0 0-3.25-.18c-3.2 0-5.4 1.95-5.4 5.5v1.08H4.75v3.52H7.8V23h3.72v-7.98h3.1l.48-3.52h-3.58v-.74c0-1.02.28-2.51 2.68-2.51Z" />
    </svg>
  ),
  instagram: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <rect height="15.5" rx="4.4" stroke="currentColor" strokeWidth="2.2" width="15.5" x="4.25" y="4.25" />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="16.55" cy="7.45" fill="currentColor" r="1.15" />
    </svg>
  ),
  linkedin: (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.55 8.9H3.3V20h3.25V8.9ZM4.9 7.45a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM20.7 13.65c0-3.15-1.68-4.62-3.92-4.62-1.8 0-2.6.98-3.05 1.68V8.9h-3.12V20h3.25v-5.5c0-1.48.28-2.9 2.1-2.9 1.8 0 1.82 1.68 1.82 3V20h3.25v-6.35h-.33Z" />
    </svg>
  ),
  youtube: (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.35 7.45a3.02 3.02 0 0 0-2.13-2.14C17.35 4.8 12 4.8 12 4.8s-5.35 0-7.22.51a3.02 3.02 0 0 0-2.13 2.14A31.45 31.45 0 0 0 2.15 12c0 1.56.16 3.08.5 4.55a3.02 3.02 0 0 0 2.13 2.14c1.87.51 7.22.51 7.22.51s5.35 0 7.22-.51a3.02 3.02 0 0 0 2.13-2.14c.34-1.47.5-2.99.5-4.55 0-1.56-.16-3.08-.5-4.55ZM10.05 15.6V8.4L16.3 12l-6.25 3.6Z" />
    </svg>
  ),
  tiktok: (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.85 3.2c.32 2.55 1.75 4.08 4.25 4.25v3.08a7.12 7.12 0 0 1-4.15-1.3v5.8c0 3.08-2 5.77-5.4 5.77-3.05 0-5.15-2.12-5.15-4.98 0-3.35 2.88-5.25 6.08-4.68v3.22c-1.45-.45-2.82.34-2.82 1.6 0 1.05.82 1.75 1.86 1.75 1.28 0 2.07-.72 2.07-2.35V3.2h3.26Z" />
    </svg>
  )
};

function SocialIcon({ icon }: { icon: SocialIconName }) {
  return socialIcons[icon];
}

/** The same line as the site's meta description (layout.tsx). */
const FOOTER_TEXT = "Подбрани български домашни рецепти с продукти, стъпки, време за приготвяне и порции – за всеки ден.";

export function SiteFooter() {
  return <footer className="ftr">
    <StitchBand />
    <div className="wrap ftr-grid">
      <div>
        <Link className="logo" href="/" aria-label="Домашна кухня Chefo's Recipes – начало">
          {/* The space keeps the visible text readable as words for the accessible name. */}
          <span className="logo-kicker">Домашна кухня</span>{" "}
          <span className="logo-name">Chefo&apos;s <em>Recipes</em></span>
        </Link>
        <p>{FOOTER_TEXT}</p>
      </div>
      {footerSections.map(section => <nav aria-labelledby={`footer-${section.id}`} key={section.id}>
        <h2 id={`footer-${section.id}`}>{section.title}</h2>
        <ul>{section.links.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
      </nav>)}
      <nav aria-labelledby="footer-social">
        <h2 id="footer-social">Последвай ни</h2>
        <div className="footer-socials">{socialLinks.map(item => <a href={item.href} aria-label={item.label} key={item.label}><SocialIcon icon={item.icon}/></a>)}</div>
      </nav>
    </div>
  </footer>;
}
