import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "За нас | Chefo's Recipes",
  description: "Подреден каталог за домашна храна, български вкус и практични идеи за готвене."
};

const audienceCards = [
  {
    title: "За хора с малко време",
    description:
      "Когато вечерята трябва да се случи без дълго търсене, можеш бързо да сравниш време, порции и трудност."
  },
  {
    title: "За семейно готвене",
    description:
      "Рецептите са подредени така, че да помагат при избор за делнична вечер, гости или споделена неделна трапеза."
  },
  {
    title: "За любими класики",
    description:
      "Баница, таратор, кавърма, шопска салата и други познати вкусове са представени ясно, без излишно усложняване."
  }
];

const capabilityCards = [
  {
    accent: "01",
    title: "Разглеждаш по категория",
    description: "Подреждаш избора според това дали търсиш салата, супа, основно, тестено ястие или десерт."
  },
  {
    accent: "02",
    title: "Сравняваш време и трудност",
    description: "Виждаш времето за подготовка и готвене, порциите и трудността още преди да отвориш рецептата."
  },
  {
    accent: "03",
    title: "Отваряш продукти и стъпки",
    description: "Всяка рецепта събира нужните продукти и инструкциите в ясен, спокоен формат."
  },
  {
    accent: "04",
    title: "Връщаш се към любими идеи",
    description: "Пазиш идеи, към които искаш да се върнеш по-късно, без да ги търсиш отначало."
  }
];

const selectionPrinciples = [
  {
    title: "Ясни продукти",
    description: "Предпочитаме рецепти с познати съставки, конкретни количества и реалистични стъпки."
  },
  {
    title: "Практично време",
    description: "Времето за подготовка и готвене трябва да помага при избора, а не да е просто число на екрана."
  },
  {
    title: "Спокоен процес",
    description: "Инструкциите са последователни, за да можеш да готвиш уверено и без излишно напрежение."
  }
];

const roadmap = [
  "По-богат каталог с още български домашни рецепти.",
  "По-добри лични списъци с любими идеи.",
  "По-полезни филтри според сезон, време и повод."
];

export default function AboutPage() {
  return (
    <section className="page-shell space-y-9 pb-6">
      <div className="about-panel grid gap-6 rounded-none border border-neutral-200 bg-surface p-5  sm:p-6 xl:p-7">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Какво е Chefo&apos;s Recipes
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-neutral-950 sm:text-[2.7rem]">
            Подреден каталог за <span className="text-brand-600">домашна храна</span>
          </h1>
          <p className="mt-4 max-w-4xl text-base font-medium leading-7 text-ink">
            Chefo&apos;s Recipes е създаден за хора, които искат бързо да намерят рецепта,
            да сравнят времето за приготвяне, продуктите и трудността и да се върнат към
            любимите си идеи по-късно.
          </p>
        </div>

        <div className="about-premium-tile about-accent-card max-w-2xl rounded-none border border-brand-200 bg-bg p-5 ">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Ритъм
          </p>
          <p className="mt-3 text-2xl font-bold leading-tight text-ink">
            Избираш спокойно. <span className="text-brand-700">Готвиш уверено.</span> Сядаш на масата.
          </p>
        </div>
      </div>

      <section className="space-y-5">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            За кого е създаден
          </p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-950 sm:text-[2rem]">
            За реалното готвене у дома
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 xl:gap-6">
          {audienceCards.map((item) => (
            <article className="about-premium-tile about-info-card info-card rounded-none p-5 sm:p-6" key={item.title}>
              <h3 className="about-card-title text-2xl font-bold text-neutral-950">{item.title}</h3>
              <p className="mt-3 text-base font-medium leading-7 text-ink">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-panel about-panel--feature grid gap-5 rounded-none border border-neutral-200 bg-surface p-5  sm:p-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(520px,1fr)] lg:items-center xl:gap-7 xl:p-7">
        <div className="about-feature-copy rounded-none border border-brand-100 bg-bg p-5 sm:p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Какво можеш да правиш
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-neutral-950 sm:text-[2rem]">
            По-малко чудене преди готвене
          </h2>
          <p className="mt-3 text-base font-medium leading-7 text-ink">
            Основната цел е да стигнеш до добър избор бързо, без да губиш важните
            детайли за продуктите, времето и начина на приготвяне.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {capabilityCards.map((item) => (
            <article
              className="about-mini-card rounded-none border border-brand-100 bg-bg p-5  transition-transform hover:border-brand-200 hover:bg-bg"
              key={item.title}
            >
              <div className="flex items-start gap-3">
                <span className="about-mini-number inline-grid h-10 w-10 shrink-0 place-items-center rounded-none bg-brand-100 text-sm font-black text-brand-800">
                  {item.accent}
                </span>
                <h3 className="about-card-title pt-1 text-xl font-bold leading-tight text-neutral-950">{item.title}</h3>
              </div>
              <p className="mt-3 text-base font-medium leading-7 text-ink">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Как подбираме рецептите
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-neutral-950 sm:text-[2rem]">
            Практични, ясни и близки до дома
          </h2>
          <p className="mt-3 text-base font-medium leading-7 text-ink">
            Фокусът е върху рецепти с познати продукти, реалистично време и ясни стъпки –
            така че изборът да е бърз, а готвенето спокойно.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 xl:gap-6">
          {selectionPrinciples.map((item) => (
            <article className="about-premium-tile about-selection-card editorial-card rounded-none p-5" key={item.title}>
              <h3 className="about-card-title text-2xl font-bold text-neutral-950">{item.title}</h3>
              <p className="mt-3 text-base font-medium leading-7 text-ink">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-panel about-panel--warm rounded-none border border-brand-100 bg-bg p-5  sm:p-6 xl:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Защо българска домашна кухня
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-neutral-950 sm:text-[2rem]">
              Защото познатият вкус също заслужава добра подредба
            </h2>
            <p className="mt-3 text-base font-medium leading-7 text-ink">
              Българската домашна кухня е богата, сезонна и практична. Chefo&apos;s Recipes
              я представя в удобен дигитален формат, без да отнема от усещането за истинска
              храна на масата.
            </p>
          </div>

          <div className="about-roadmap-card rounded-none border border-brand-200 bg-surface p-5 ">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Какво предстои
            </p>
            <ul className="mt-4 grid gap-3">
              {roadmap.map((item) => (
                <li className="about-roadmap-item flex gap-3 rounded-none px-3 py-2 text-base font-medium leading-7 text-ink" key={item}>
                  <span className="about-roadmap-dot mt-2.5 h-2 w-2 shrink-0 rounded-none bg-brand-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              className="about-cta mt-5 inline-flex rounded-none bg-brand-600 px-5 py-2.5 text-sm font-black text-white   transition-transform hover:bg-accent-hover"
              href="/catalog"
            >
              Разгледай каталога
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
