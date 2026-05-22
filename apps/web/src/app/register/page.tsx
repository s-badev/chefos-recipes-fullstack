import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Регистрация | Chefo's Recipes",
  description: "Екран за регистрация в Chefo's Recipes."
};

export default function RegisterPage() {
  return (
    <section className="page-shell">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <aside className="relative overflow-hidden rounded-[2.4rem] border border-brand-100 bg-[linear-gradient(135deg,#7f3313_0%,#bd4b1b_48%,#f3a044_100%)] p-6 text-white shadow-[0_24px_70px_rgba(89,52,22,0.18)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,238,0.18)_0%,rgba(58,36,23,0.18)_100%)]" />
          <div className="relative flex min-h-[460px] flex-col justify-between gap-10 lg:min-h-[560px]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-100">
                Chefo&apos;s Recipes
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
                Създай профил за любимите си рецепти
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-orange-50">
                Регистрацията ще ти помогне да пазиш любими идеи, да се връщаш към тях по-късно и да подреждаш готвенето по-спокойно.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  title: "Запази любими рецепти",
                  text: "Събирай идеи, към които искаш да се върнеш."
                },
                {
                  title: "Лично пространство",
                  text: "Профилът ще пази твоите предпочитания и бързи връзки."
                },
                {
                  title: "По-лесен избор",
                  text: "Връщай се към рецепти без да ги търсиш отначало."
                }
              ].map((item, index) => (
                <div
                  className="rounded-[1.35rem] border border-white/24 bg-white/14 p-4 shadow-sm backdrop-blur-[2px]"
                  key={item.title}
                >
                  <div className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff8ee] text-sm font-black text-brand-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-base font-black text-white">{item.title}</h2>
                      <p className="mt-1 text-sm font-semibold leading-6 text-orange-50">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="rounded-[1.35rem] border border-white/24 bg-[#3a2417]/22 p-4 text-base font-bold leading-7 text-orange-50">
              Chefo&apos;s Recipes е създаден за спокойно домашно готвене - без излишно ровене.
            </p>
          </div>
        </aside>

        <form className="flex min-h-[520px] w-full flex-col justify-center rounded-[2.4rem] border border-stone-200 bg-[#fff8ee]/95 p-6 shadow-[0_24px_70px_rgba(89,52,22,0.12)] sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-700">
                Нов профил
              </p>
              <h2 className="mt-2 text-4xl font-black leading-tight text-[#3a2417] sm:text-5xl">
                Регистрация
              </h2>
            </div>
            <Link
              className="inline-flex rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-black text-brand-700 transition hover:border-brand-400 hover:text-brand-900"
              href="/login"
            >
              Вход
            </Link>
          </div>

          <button
            className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-base font-black text-stone-500 shadow-sm"
            disabled
            type="button"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-stone-200 bg-white text-sm font-black text-brand-700">
              G
            </span>
            Регистрация с Google - скоро
          </button>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-stone-200" />
            <span className="text-sm font-black uppercase tracking-[0.16em] text-stone-500">
              или с имейл
            </span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-base font-black text-stone-800" htmlFor="name">
                Име
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                id="name"
                name="name"
                placeholder="Твоето име"
                type="text"
              />
            </div>

            <div>
              <label className="text-base font-black text-stone-800" htmlFor="email">
                Имейл
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                id="email"
                name="email"
                placeholder="ime@example.com"
                type="email"
              />
            </div>

            <div>
              <label className="text-base font-black text-stone-800" htmlFor="password">
                Парола
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                id="password"
                name="password"
                placeholder="Създай парола"
                type="password"
              />
            </div>

            <button
              className="w-full rounded-full bg-brand-600 px-5 py-3.5 text-base font-black text-white shadow-[0_12px_30px_rgba(127,51,19,0.24)] transition hover:bg-brand-700"
              type="button"
            >
              Създай профил
            </button>

            <p className="mt-6 text-center text-base font-semibold leading-6 text-[#4a2a17]">
              Вече имаш профил?{" "}
              <Link
                className="font-black text-[#c05621] transition hover:text-brand-900 hover:underline hover:decoration-brand-300 hover:decoration-2 hover:underline-offset-4"
                href="/login"
              >
                Влез
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
