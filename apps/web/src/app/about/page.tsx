import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "За нас | Chefo's Recipes",
  description: "Домашни рецепти, български вкус и лесни идеи за готвене."
};

const values = [
  {
    title: "Български вкус",
    description:
      "Каталогът започва с познати домашни ястия като баница, таратор, кавърма и сезонни рецепти."
  },
  {
    title: "Лесно следване",
    description:
      "Всяка рецепта събира продукти, време за приготвяне и ясни стъпки, за да готвиш уверено."
  },
  {
    title: "Любими идеи",
    description:
      "Скоро личното пространство ще събира запазени рецепти и идеи, към които лесно да се връщаш."
  }
];

export default function AboutPage() {
  return (
    <section className="page-shell space-y-10">
      <div className="grid gap-8 rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.36fr)] lg:items-end xl:p-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            За нас
          </p>
          <h1 className="mt-2 text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
            Chefo&apos;s <span className="text-brand-600">Recipes</span>
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
            Chefo&apos;s Recipes е място за домашни рецепти, български вкус и бързи идеи за
            вечеря, когато искаш нещо вкусно без излишно усложняване.
          </p>
        </div>

        <div className="rounded-[1.7rem] bg-[#1c1208] p-6 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-300">
            Ритъм
          </p>
          <p className="mt-3 text-3xl font-bold leading-tight">Избираш. Готвиш. Сядаш на масата.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 xl:gap-8">
        {values.map((item) => (
          <article className="info-card rounded-[1.8rem] p-6" key={item.title}>
            <h2 className="text-2xl font-bold text-stone-950">{item.title}</h2>
            <p className="mt-3 text-base leading-7 text-stone-600">{item.description}</p>
          </article>
        ))}
      </div>

      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#2b1a0d,#1c1208_58%,#57321a)] p-6 text-white shadow-[0_22px_58px_rgba(70,42,18,0.16)] sm:p-8 xl:p-10">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-400/18 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl font-bold sm:text-4xl">Повече уют в кухнята</h2>
          <p className="mt-3 max-w-3xl text-base leading-8 text-stone-100">
            Chefo&apos;s Recipes ще помага да избираш по-бързо, да пазиш любими рецепти и да
            следваш всяко ястие с ясни, спокойни инструкции.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-base font-black text-stone-950 shadow-sm transition hover:bg-brand-50 hover:text-brand-800"
            href="/catalog"
          >
            Разгледай каталога
          </Link>
        </div>
      </section>
    </section>
  );
}
