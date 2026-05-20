import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./site-header";

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
      <body className="min-h-screen bg-[linear-gradient(180deg,#fffaf3_0%,#fff7ec_48%,#fffaf3_100%)] text-stone-950 antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="w-full flex-1 px-6 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16 2xl:px-20">
            {children}
          </main>
          <footer className="w-full border-t border-stone-200 bg-white/40 text-sm text-stone-500">
            <div className="mx-auto w-full max-w-[1720px] px-6 py-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
              Chefo's Recipes събира домашни идеи, български вкус и лесни стъпки за всяко
              готвене.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
