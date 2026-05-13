import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Профил | Chefo's Recipes",
  description: "Потребителски профил в Chefo's Recipes."
};

const summary = [
  { label: "Запазени рецепти", value: "3" },
  { label: "Последно готвене", value: "Очаква се" },
  { label: "Статус", value: "Примерен" }
];

export default function ProfilePage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Потребителски профил
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">Моят профил</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Това е примерен dashboard за бъдещия потребителски профил. По-късно тук ще се показват
            реални данни за акаунта, любимите рецепти и активността.
          </p>
        </div>

        <div className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-800">Статус на акаунта</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Профилът е placeholder и не използва реална сесия или JWT токен.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" key={item.label}>
            <p className="text-sm font-bold text-stone-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-stone-950">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-stone-950">Обобщение на любимите</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            След реалната интеграция тук ще има брой запазени рецепти, последно добавени любими и
            бързи връзки към детайлите им.
          </p>
          <Link
            className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            href="/favorites"
          >
            Виж любимите
          </Link>
        </div>

        <div className="rounded-3xl border border-dashed border-brand-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-stone-950">Бъдеща интеграция</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Данните ще идват от защитен backend поток и заявки към Neon чрез Drizzle. Достъпът ще
            зависи от реална потребителска сесия.
          </p>
        </div>
      </section>
    </section>
  );
}
