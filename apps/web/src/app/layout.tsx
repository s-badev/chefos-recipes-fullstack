import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BackToTopButton } from "./back-to-top-button";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  display: "swap",
  preload: true,
  variable: "--font-playfair"
});

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
      <body className={`${inter.variable} ${playfair.variable} min-h-screen bg-canvas text-ink antialiased`}>
        <a className="skip-link" href="#main-content">
          Към съдържанието
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[var(--site-shell-width)] flex-1 px-[var(--site-shell-padding)] py-8 sm:py-10 lg:py-12">
            {children}
          </main>
          <SiteFooter />
        </div>
        <BackToTopButton />
      </body>
    </html>
  );
}
