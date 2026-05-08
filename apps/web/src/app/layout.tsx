import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chefo’s Recipes",
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
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8">
          <header className="flex items-center justify-between gap-6">
            <a className="flex items-center gap-3" href="/">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-sm font-bold text-white shadow-sm">
                CR
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Chefo’s Recipes
                </p>
                <h1 className="text-lg font-semibold text-stone-950">Каталог с рецепти</h1>
              </div>
            </a>
            <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
              <a className="hover:text-brand-700" href="/">
                Начало
              </a>
              <a className="hover:text-brand-700" href="/catalog">
                Каталог
              </a>
              <a className="hover:text-brand-700" href="/favorites">
                Любими
              </a>
              <a className="hover:text-brand-700" href="/admin">
                Админ
              </a>
              <a className="hover:text-brand-700" href="/#about">
                За проекта
              </a>
            </nav>
          </header>
          <main className="flex-1 py-8 sm:py-10">{children}</main>
          <footer className="border-t border-stone-200 py-6 text-sm text-stone-500">
            Създадено за SoftUni capstone проект. Базата данни и API интеграцията са следващата стъпка.
          </footer>
        </div>
      </body>
    </html>
  );
}
