import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "За нас | Chefo's Recipes",
  description: "Домашни рецепти, български вкус и лесни идеи за готвене."
};

export default function AboutPage() {
  return (
    <section className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
          За нас
        </p>
        <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">Chefo's Recipes</h2>
        <p className="mt-4 text-lg leading-8 text-stone-600">
          Chefo's Recipes е място за домашни рецепти, български вкус и бързи идеи за вечеря,
          когато искаш нещо вкусно без излишно усложняване.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-950">Български вкус</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Каталогът започва с познати домашни ястия като баница, таратор, кавърма и сезонни
            рецепти.
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-950">Лесно следване</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Всяка рецепта събира продукти, време за приготвяне и ясни стъпки, за да готвиш
            уверено.
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-950">Любими идеи</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Скоро личното пространство ще събира запазени рецепти и идеи, към които лесно да се
            връщаш.
          </p>
        </article>
      </div>

      <section className="rounded-3xl bg-stone-950 p-6 text-white shadow-sm">
        <h3 className="text-2xl font-bold">Повече уют в кухнята</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-100">
          Chefo's Recipes ще помага да избираш по-бързо, да пазиш любими рецепти и да следваш
          всяко ястие с ясни, спокойни инструкции.
        </p>
      </section>

      <Link
        className="inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        href="/catalog"
      >
        Разгледай каталога
      </Link>
    </section>
  );
}
