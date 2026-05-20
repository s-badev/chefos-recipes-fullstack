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
    <footer className="w-full border-t border-stone-200/90 bg-[#fff7ec]/92 text-sm text-stone-600">
      <div className="mx-auto w-full max-w-[1720px] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid gap-10 rounded-[2rem] border border-stone-200 bg-white/58 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.06)] sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.8fr)] lg:items-start">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[1.1rem] bg-[linear-gradient(135deg,#f36b0f,#b94617)] text-xs font-black text-white shadow-sm shadow-brand-900/20">
                CR
              </span>
              <p className="text-xl font-black text-stone-950">
                Chefo&apos;s <span className="text-brand-600">Recipes</span>
              </p>
            </div>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
              Подреден каталог за домашна храна — за хора, които готвят с удоволствие.
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
            {footerSections.map((section) => (
              <nav aria-label={section.title} key={section.title}>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">
                  {section.title}
                </p>
                <div className="mt-4 grid gap-3">
                  {section.links.map((item) => (
                    <Link
                      className="font-bold text-stone-700 transition hover:text-brand-700"
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
        </div>

        <div className="mt-6 flex flex-col gap-3 text-xs font-bold uppercase tracking-[0.14em] text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Chefo&apos;s Recipes</p>
          <p>Направено с любов към домашната кухня.</p>
        </div>
      </div>
    </footer>
  );
}
