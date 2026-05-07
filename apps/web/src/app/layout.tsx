import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chefo’s Recipes",
  description: "Recipe discovery made simple."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500 text-white font-semibold">CR</div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Chefo’s Recipes</p>
                <h1 className="text-lg font-semibold">Recipe Catalog</h1>
              </div>
            </div>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300">
              Sign in
            </button>
          </header>
          <main className="flex-1 py-10">{children}</main>
          <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
            Built for the SoftUni capstone · API + mobile coming next
          </footer>
        </div>
      </body>
    </html>
  );
}
