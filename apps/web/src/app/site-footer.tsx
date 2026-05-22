import Link from "next/link";
import type { ReactNode } from "react";

const footerSections = [
  {
    title: "Разглеждай",
    links: [
      { href: "/catalog", label: "Каталог" },
      { href: "/favorites", label: "Любими" },
      { href: "/about", label: "За нас" }
    ]
  },
  {
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

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-stone-200 bg-[linear-gradient(180deg,#fff7ec_0%,#fff2e2_100%)] text-base leading-7 text-stone-700">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.85fr)] lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#f36b0f,#b94617)] text-white shadow-sm shadow-brand-900/20">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
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
              <p className="text-xl font-black leading-tight text-stone-950">
                Chefo&apos;s <span className="text-brand-600">Recipes</span>
              </p>
            </div>
            <p className="mt-5 max-w-2xl text-[17px] font-medium leading-8 text-[#4a2a17]">
              Подреден каталог за домашна храна - за хора, които готвят с удоволствие.
            </p>
          </div>

          {footerSections.map((section) => (
            <nav aria-label={section.title} key={section.title}>
              <p className="text-[15px] font-black uppercase tracking-[0.18em] text-brand-800">
                {section.title}
              </p>
              <div className="mt-5 grid gap-3.5">
                {section.links.map((item) => (
                  <Link
                    className="text-base font-extrabold text-stone-800 transition hover:text-brand-700 hover:underline hover:decoration-brand-300 hover:decoration-2 hover:underline-offset-4"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          ))}

          <section aria-labelledby="footer-social-heading">
            <p
              className="text-[15px] font-black uppercase tracking-[0.18em] text-brand-800"
              id="footer-social-heading"
            >
              Последвай ни
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-brand-100 bg-[#fff8ee] text-sm font-black text-brand-800 shadow-sm shadow-brand-900/10 transition hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:text-white hover:shadow-[0_10px_24px_rgba(127,51,19,0.2)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
                  href={item.href}
                  key={item.label}
                >
                  <SocialIcon icon={item.icon} />
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-stone-300/70 pt-6 text-sm font-bold tracking-[0.02em] text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Chefo&apos;s Recipes</p>
          <p>Направено с любов към домашната кухня.</p>
        </div>
      </div>
    </footer>
  );
}
