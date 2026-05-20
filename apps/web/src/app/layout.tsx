import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chefo's Recipes",
  description: "Топъл каталог с български рецепти за всеки ден."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className="min-h-screen bg-[#fffaf3] text-stone-950 antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="w-full border-b border-stone-200/80 bg-[#fffaf3]/95">
            <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-5 py-5 sm:px-8 xl:px-10">
              <a className="flex items-center gap-3" href="/">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-sm font-bold text-white shadow-sm">
                  CR
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                    Chefo's Recipes
                  </p>
                  <h1 className="text-lg font-semibold text-stone-950">Каталог с рецепти</h1>
                </div>
              </a>
              <nav className="hidden flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm font-medium text-stone-600 md:flex">
                <a className="hover:text-brand-700" href="/">
                  Начало
                </a>
                <a className="hover:text-brand-700" href="/catalog">
                  Каталог
                </a>
                <a className="hover:text-brand-700" href="/favorites">
                  Любими
                </a>
                <a className="hover:text-brand-700" href="/profile">
                  Профил
                </a>
                <a className="hover:text-brand-700" href="/admin">
                  Админ
                </a>
                <a className="hover:text-brand-700" href="/about">
                  За нас
                </a>
                <a className="hover:text-brand-700" href="/login">
                  Вход
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
            {children}
          </main>
          <footer className="w-full border-t border-stone-200 bg-white/40 text-sm text-stone-500">
            <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 xl:px-10">
              Chefo's Recipes събира домашни идеи, български вкус и лесни стъпки за всяко
              готвене.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
