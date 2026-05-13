import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "За проекта | Chefo's Recipes",
  description: "Информация за Chefo's Recipes като SoftUni capstone проект."
};

export default function AboutPage() {
  return (
    <section className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
          За проекта
        </p>
        <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">Chefo's Recipes</h2>
        <p className="mt-4 text-lg leading-8 text-stone-600">
          Chefo's Recipes е практичен каталог с български рецепти, създаден като SoftUni capstone
          проект за курса Full Stack Apps with AI.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-950">Български фокус</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Каталогът започва с познати домашни ястия като баница, таратор, кавърма и сезонни
            рецепти.
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-950">Web и mobile</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Проектът има Next.js web приложение и Expo mobile клиент, които по-късно ще споделят
            един backend.
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-950">Capstone обхват</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Целта е малко, завършено full-stack приложение с рецепти, любими, профили и админ
            управление.
          </p>
        </article>
      </div>

      <section className="rounded-3xl bg-stone-950 p-6 text-white shadow-sm">
        <h3 className="text-2xl font-bold">Следващи технически стъпки</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-100">
          Статичните данни ще бъдат заменени с Neon PostgreSQL и Drizzle заявки. Web действията ще
          използват Server Actions където е подходящо, а mobile приложението ще работи през REST API.
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
