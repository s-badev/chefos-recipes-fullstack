import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "../../server/auth/session";
import { listFavoriteRecipesForUser } from "../../server/favorites/repository";

export const metadata: Metadata = {
  title: "Профил | Chefo's Recipes",
  description: "Потребителски профил в Chefo's Recipes."
};

function getDisplayName(name: string, email: string) {
  const trimmedName = name.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return email.split("@")[0] ?? "приятел";
}

export default async function ProfilePage() {
  const user = await requireUser();
  const favoriteRecipes = await listFavoriteRecipesForUser(user);
  const favoriteCount = favoriteRecipes.length;
  const latestFavorites = favoriteRecipes.slice(0, 3);
  const displayName = getDisplayName(user.name, user.email);
  const hasFavorites = favoriteCount > 0;

  const summary = [
    {
      label: "Запазени рецепти",
      value: String(favoriteCount),
      helper: "запазени рецепти"
    },
    {
      label: "Последна активност",
      value: hasFavorites ? "Има любими" : "Няма активност",
      helper: hasFavorites ? "запазени идеи в профила" : "запази първа рецепта"
    },
    {
      label: "Статус",
      value: "Активен",
      helper: "активен профил"
    }
  ];

  return (
    <section className="page-shell space-y-10">
      <div className="rounded-[2rem] border border-stone-200 bg-white/76 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Потребителски профил
            </p>
            <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
              Здравей, <span className="text-brand-700">{displayName}</span>
            </h1>
            <p className="mt-4 max-w-3xl text-[1.05rem] font-medium leading-8 text-[#4a2a17]">
              Тук са събрани твоите запазени рецепти, бързи връзки към любими идеи и кратко
              обобщение на профила.
            </p>
          </div>

          <div className="w-fit rounded-full border border-brand-100 bg-[#fff8ee] px-5 py-2.5 text-sm font-bold text-[#5a4030] shadow-sm">
            {user.email}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3 xl:gap-8">
        {summary.map((item) => (
          <div className="editorial-card rounded-[1.8rem] p-6" key={item.label}>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">{item.label}</p>
            <p className="mt-3 text-4xl font-bold leading-none text-stone-950">{item.value}</p>
            <p className="mt-2 text-base font-semibold text-[#6b4a32]">{item.helper}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] xl:gap-8">
        <div className="info-card rounded-[1.8rem] p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
                Любими идеи
              </p>
              <h2 className="mt-2 text-3xl font-bold text-stone-950">Последно запазени</h2>
            </div>
            {hasFavorites ? (
              <Link
                className="ui-button inline-flex w-fit rounded-full bg-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
                href="/favorites"
              >
                Виж всички любими
              </Link>
            ) : null}
          </div>

          {hasFavorites ? (
            <div className="mt-6 grid gap-3">
              {latestFavorites.map((recipe) => (
                <Link
                  className="info-note group flex flex-col gap-3 rounded-[1.3rem] p-4 shadow-sm transition sm:flex-row sm:items-center sm:justify-between"
                  href={`/catalog/${recipe.slug}`}
                  key={recipe.slug}
                >
                  <span>
                    <span className="block text-lg font-bold leading-tight text-stone-950 group-hover:text-brand-800">
                      {recipe.title}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-[#6b4a32]">
                      {recipe.category} · {recipe.difficulty}
                    </span>
                  </span>
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-brand-700">
                    Отвори
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-brand-200 bg-white/78 p-6 text-center">
              <h3 className="text-2xl font-bold text-stone-950">Все още нямаш запазени рецепти.</h3>
              <p className="mx-auto mt-3 max-w-xl text-base font-medium leading-7 text-[#4a2a17]">
                Когато запазиш рецепта, тя ще се появи тук за бързо връщане към нея.
              </p>
              <Link
                className="ui-button mt-5 inline-flex rounded-full bg-brand-600 px-6 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
                href="/catalog"
              >
                Разгледай каталога
              </Link>
            </div>
          )}
        </div>

        <div className="info-note rounded-[1.8rem] p-6 shadow-sm sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Профил
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-950">Лична зона</h2>
          <p className="mt-3 text-base font-medium leading-8 text-[#4a2a17]">
            Тук виждаш своите запазени рецепти, последно добавени любими идеи и бързи връзки към каталога.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              { href: "/favorites", label: "Виж любими" },
              { href: "/catalog", label: "Разгледай каталога" },
              { href: "/catalog", label: "Открий нова рецепта" }
            ].map((item) => (
              <Link
                className="info-card flex items-center justify-between rounded-[1.2rem] px-4 py-3 text-base font-bold text-[#3a2417] shadow-sm"
                href={item.href}
                key={item.label}
              >
                <span>{item.label}</span>
                <span className="text-brand-700">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
