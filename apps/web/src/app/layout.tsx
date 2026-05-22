import type { Metadata } from "next";
import "./globals.css";
import { BackToTopButton } from "./back-to-top-button";
import { SiteFooter } from "./site-footer";
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
      <body className="min-h-screen bg-[#fffaf3] text-stone-950 antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
            {children}
          </main>
          <SiteFooter />
        </div>
        <BackToTopButton />
      </body>
    </html>
  );
}
