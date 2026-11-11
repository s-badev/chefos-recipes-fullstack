import type { Metadata } from "next";
import { Cormorant, Onest } from "next/font/google";
import "./globals.css";
import { BackToTopButton } from "./back-to-top-button";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { MotionRoot } from "./motion-root";

const sans = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  variable: "--font-sans"
});

const serif = Cormorant({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  variable: "--font-serif"
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
    <html lang="bg" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on'` }} />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <a className="skip-link" href="#main-content">
          Към съдържанието
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <BackToTopButton />
        <MotionRoot />
      </body>
    </html>
  );
}
