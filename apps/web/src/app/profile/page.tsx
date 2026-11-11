import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "../../server/auth/session";

export const metadata: Metadata = {
  title: "Профил | Chefo's Recipes",
  description: "Потребителски профил в Chefo's Recipes."
};

const summary = [
  { label: "Запазени рецепти", value: "В любими" },
  { label: "Последна активност", value: "Няма запис" },
  { label: "Статус", value: "Активен профил" }
];

export default async function ProfilePage() {
  const user = await requireUser();
  const profileName = user.name.trim();

  return (
    <section className="page-shell space-y-8">
      <div className="rounded-none border border-neutral-200 bg-white/70 p-5  sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Потребителски профил
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-neutral-950 sm:text-[2.875rem]">
          Моят профил
        </h1>
        <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-ink">
          {profileName ? (
            <>
              Здравей, <strong className="font-bold text-ink">{profileName}</strong>. Тук ще
              се събират твоите запазени рецепти, любими идеи и кратко обобщение на профила.
            </>
          ) : (
            "Тук ще се събират твоите запазени рецепти, любими идеи и кратко обобщение на профила."
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:gap-5">
        {summary.map((item) => (
          <div className="editorial-card rounded-none p-5" key={item.label}>
            <p className="text-sm font-black text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-neutral-950">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] xl:gap-6">
        <div className="info-card rounded-none p-5">
          <h2 className="text-2xl font-bold text-neutral-950">Обобщение на любимите</h2>
          <p className="mt-3 text-base font-medium leading-7 text-ink">
            Тук ще виждаш запазените рецепти и бързи връзки към тях, когато започнеш да добавяш
            любими идеи.
          </p>
          <Link
            className="mt-5 inline-flex rounded-none bg-brand-600 px-5 py-2.5 text-sm font-black text-white   transition-transform hover:bg-brand-700"
            href="/favorites"
          >
            Виж любимите
          </Link>
        </div>

        <div className="info-note rounded-none p-5 ">
          <h2 className="text-2xl font-bold text-neutral-950">Лични настройки</h2>
          <p className="mt-3 text-base font-medium leading-7 text-ink">
            Профилът ще събира предпочитания, любими рецепти и удобни преки пътища за по-бързо
            готвене.
          </p>
        </div>
      </section>
    </section>
  );
}
