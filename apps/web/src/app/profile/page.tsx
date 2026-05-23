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
    <section className="page-shell space-y-10">
      <div className="rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
          Потребителски профил
        </p>
        <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
          Моят профил
        </h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] font-medium leading-relaxed text-[#4a2a17]">
          {profileName ? (
            <>
              Здравей, <strong className="font-bold text-[#3a2417]">{profileName}</strong>. Тук ще
              се събират твоите запазени рецепти, любими идеи и кратко обобщение на профила.
            </>
          ) : (
            "Тук ще се събират твоите запазени рецепти, любими идеи и кратко обобщение на профила."
          )}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 xl:gap-8">
        {summary.map((item) => (
          <div className="editorial-card rounded-[1.8rem] p-6" key={item.label}>
            <p className="text-base font-black text-[#6b4a32]">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-stone-950">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] xl:gap-8">
        <div className="info-card rounded-[1.8rem] p-6">
          <h2 className="text-3xl font-bold text-stone-950">Обобщение на любимите</h2>
          <p className="mt-3 text-base font-medium leading-8 text-[#4a2a17]">
            Тук ще виждаш запазените рецепти и бързи връзки към тях, когато започнеш да добавяш
            любими идеи.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
            href="/favorites"
          >
            Виж любимите
          </Link>
        </div>

        <div className="info-note rounded-[1.8rem] p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-stone-950">Лични настройки</h2>
          <p className="mt-3 text-base font-medium leading-8 text-[#4a2a17]">
            Профилът ще събира предпочитания, любими рецепти и удобни преки пътища за по-бързо
            готвене.
          </p>
        </div>
      </section>
    </section>
  );
}
