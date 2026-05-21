import Link from "next/link";

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

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-stone-200 bg-[linear-gradient(180deg,#fff7ec_0%,#fff2e2_100%)] text-base leading-7 text-stone-700">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)_minmax(0,0.75fr)] lg:items-start">
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
            <p className="mt-5 max-w-2xl text-[17px] leading-8 text-stone-700">
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
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-stone-300/70 pt-6 text-sm font-bold tracking-[0.02em] text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Chefo&apos;s Recipes</p>
          <p>Направено с любов към домашната кухня.</p>
        </div>
      </div>
    </footer>
  );
}
