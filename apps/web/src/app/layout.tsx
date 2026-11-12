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
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  variable: "--font-serif"
});

/**
 * Runs before first paint. Motion hides content until MotionRoot reveals it, so if MotionRoot
 * has not confirmed its start (window.__motionReady) within 2.5 s — a blocked or failed JS
 * chunk, a very slow device — drop data-motion and show everything without animation.
 */
const motionBootScript = `(function(){var d=document.documentElement;d.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on';setTimeout(function(){if(!window.__motionReady){window.__motionTimedOut=true;delete d.dataset.motion;}},2500);})();`;

export const metadata: Metadata = {
  title: "Chefo's Recipes",
  description: "Подбрани български домашни рецепти с продукти, стъпки, време за приготвяне и порции – за всеки ден."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body className="min-h-screen text-ink antialiased">
        {/* Atmosphere: a tiny pre-blurred table photo behind every page, under a dark veil (globals.css). */}
        <div className="atmo" aria-hidden="true" />
        <div className="veil" aria-hidden="true" />
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
