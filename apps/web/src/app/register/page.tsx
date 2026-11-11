import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "../../server/auth/actions";
import { getCurrentUser } from "../../server/auth/session";

export const metadata: Metadata = {
  title: "Регистрация | Chefo's Recipes",
  description: "Създай профил в Chefo's Recipes и пази любимите си рецепти на едно място."
};

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getRegisterErrorMessage(error: string | undefined) {
  switch (error) {
    case "exists":
      return "Вече има профил с този имейл.";
    case "server":
      return "Регистрацията не беше успешна. Опитай отново след малко.";
    case "invalid":
      return "Попълни име, валиден имейл и парола с поне 8 символа.";
    default:
      return undefined;
  }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const errorMessage = getRegisterErrorMessage(params?.error);

  if (currentUser) {
    redirect(currentUser.role === "admin" ? "/admin" : "/profile");
  }

  return (
    <section className="page-shell pb-6">
      <div className="grid w-full gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <aside className="relative overflow-hidden rounded-none border border-brand-100 bg-ink p-5 text-white  sm:p-6">
          <div className="absolute inset-0 bg-ink" />
          <div className="relative flex min-h-[340px] flex-col justify-between gap-6 lg:min-h-[380px]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-neutral-100">
                Chefo&apos;s Recipes
              </p>
              <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight text-white sm:text-[2.5rem]">
                Създай профил за любимите си рецепти
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-neutral-50">
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
                  text: "Връщай се към рецептите, без да ги търсиш отначало."
                }
              ].map((item, index) => (
                <div
                  className="rounded-none border border-white/24 bg-white/14 p-3.5  backdrop-blur-[2px]"
                  key={item.title}
                >
                  <div className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-none bg-bg text-sm font-black text-brand-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-base font-black text-white">{item.title}</h2>
                      <p className="mt-1 text-sm font-semibold leading-6 text-neutral-50">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="rounded-none border border-white/24 bg-ink p-3.5 text-sm font-bold leading-6 text-neutral-50">
              Chefo&apos;s Recipes е създаден за спокойно домашно готвене – без излишно ровене.
            </p>
          </div>
        </aside>

        <form
          action={registerAction}
          className="flex min-h-[380px] w-full flex-col justify-center rounded-none border border-neutral-200 bg-bg p-5  sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-700">
                Нов профил
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-[2.5rem]">
                Регистрация
              </h2>
            </div>
            <Link
              className="inline-flex rounded-none border border-brand-200 bg-white px-4 py-2 text-sm font-black text-brand-700 transition-transform hover:border-brand-400 hover:text-brand-900"
              href="/login"
            >
              Вход
            </Link>
          </div>

          <div className="space-y-4">
            {errorMessage ? (
              <p className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-base font-bold text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <div>
              <label className="text-base font-black text-neutral-800" htmlFor="name">
                Име
              </label>
              <input
                className="mt-2 w-full rounded-none border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                id="name"
                name="name"
                placeholder="Твоето име"
                required
                type="text"
              />
            </div>

            <div>
              <label className="text-base font-black text-neutral-800" htmlFor="email">
                Имейл
              </label>
              <input
                className="mt-2 w-full rounded-none border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                id="email"
                name="email"
                placeholder="ime@example.com"
                required
                type="email"
              />
            </div>

            <div>
              <label className="text-base font-black text-neutral-800" htmlFor="password">
                Парола
              </label>
              <input
                className="mt-2 w-full rounded-none border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-950  transition-transform placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                id="password"
                name="password"
                placeholder="Създай парола"
                required
                type="password"
              />
            </div>

            <button
              className="w-full rounded-none bg-brand-600 px-5 py-3.5 text-base font-black text-white  transition-transform hover:bg-brand-700"
              type="submit"
            >
              Създай профил
            </button>

            <p className="mt-6 text-center text-base font-semibold leading-6 text-ink">
              Вече имаш профил?{" "}
              <Link
                className="font-black text-muted transition-transform hover:text-brand-900 hover:underline hover:decoration-brand-300 hover:decoration-2 hover:underline-offset-4"
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
