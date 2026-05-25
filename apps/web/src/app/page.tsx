import Image from "next/image";
import Link from "next/link";
import { RecipeCard } from "./recipe-card";

const featuredRecipes = [
  {
    title: "Шопска салата",
    slug: "shopska-salata",
    imageSrc: "/images/recipes/shopska-salata.png",
    description: "Домати, краставици, печени чушки, магданоз и настъргано бяло сирене.",
    imageAlt: "Свежа шопска салата с настъргано бяло сирене",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: "Лесна",
    category: "Салати",
    tags: ["Свежо", "Вегетарианско"]
  },
  {
    title: "Баница със сирене",
    slug: "banitsa-sas-sirene",
    imageSrc: "/images/recipes/banitsa-sas-sirene.png",
    description: "Фини кори, запечени с яйца, кисело мляко и ароматно бяло сирене.",
    imageAlt: "Златиста баница със сирене, нарязана на парчета",
    prepTimeMinutes: 25,
    cookTimeMinutes: 40,
    servings: 8,
    difficulty: "Средна",
    category: "Тестени",
    tags: ["Закуска", "С печене"]
  },
  {
    title: "Кавърма със свинско",
    slug: "kavarma-sas-svinsko",
    imageSrc: "/images/recipes/kavarma-sas-svinsko.png",
    description: "Крехко свинско с чушки, гъби, домати, вино и чубрица.",
    imageAlt: "Домашна свинска кавърма в глинена купа",
    prepTimeMinutes: 25,
    cookTimeMinutes: 75,
    servings: 4,
    difficulty: "Средна",
    category: "Основни",
    tags: ["Домашно", "Яхния"]
  }
];

const featureItems = [
  {
    accent: "01",
    title: "Разглеждаш по категория",
    description:
      "Филтрирай рецепти според това дали търсиш салата, супа, основно, тестено ястие или десерт."
  },
  {
    accent: "02",
    title: "Сравняваш време и трудност",
    description:
      "Виж подготовка, готвене, порции и ниво още преди да отвориш детайлната страница."
  },
  {
    accent: "03",
    title: "Отваряш продукти и стъпки",
    description:
      "Всяка рецепта събира нужните продукти и инструкциите в ясен, спокоен формат."
  },
  {
    accent: "04",
    title: "Запазваш любими идеи",
    description:
      "Връщай се към рецепти, които искаш да приготвиш по-късно, без да ги търсиш отначало."
  }
];

const homepageStats = [
  { value: "24", label: "рецепти" },
  { value: "6", label: "категории" },
  { value: "31", label: "тага" },
  { value: "бърз", label: "избор за вечеря" }
];

export default function HomePage() {
  return (
    <div className="page-shell space-y-7 xl:space-y-8">
      <section className="mx-auto grid w-full max-w-5xl gap-5 py-0 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center lg:gap-7 xl:gap-8">
        <div className="space-y-3.5 xl:space-y-4">
          <div className="inline-flex items-center rounded-full border border-brand-200 bg-white/86 px-3.5 py-1.5 text-sm font-bold text-brand-800 shadow-sm">
            Български рецепти за всеки ден
          </div>

          <div className="max-w-2xl space-y-3">
            <h1 className="text-[2.9rem] font-bold leading-[0.95] text-stone-950 sm:text-[3.2rem] lg:text-[clamp(2.55rem,3.4vw,3rem)]">
              Намери <span className="text-brand-600">вкусна</span> и практична рецепта, преди{" "}
              <span className="text-brand-600">тиганът</span> да загрее.
            </h1>
            <p className="max-w-xl text-lg leading-7 text-stone-600 sm:text-xl lg:text-base lg:leading-7">
              Chefo&apos;s Recipes е подреден каталог за домашна храна, в който лесно
              сравняваш време за приготвяне и намираш идея за следващото готвене.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              className="ui-button rounded-full bg-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
              href="/catalog"
            >
              Виж избраните
            </Link>
            <Link
              className="ui-button rounded-full border border-stone-300 bg-white/88 px-5 py-2.5 text-sm font-black text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-800"
              href="#explore"
            >
              Какво можеш да правиш
            </Link>
          </div>

          <div className="grid max-w-3xl gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
            {homepageStats.map((stat) => (
              <div
                className="editorial-card rounded-[0.9rem] px-2.5 py-2"
                key={`${stat.value}-${stat.label}`}
              >
                <p className="text-base font-black leading-none text-stone-950 xl:text-lg">{stat.value}</p>
                <p className="mt-0.5 text-xs font-bold leading-5 text-stone-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:justify-self-end lg:w-full lg:max-w-[420px]">
          <div className="hero-food-visual min-h-[300px] overflow-hidden rounded-[1.6rem] border border-white/70 shadow-[0_16px_44px_rgba(87,50,20,0.15)] sm:min-h-[340px] lg:min-h-[270px] xl:min-h-[280px] 2xl:min-h-[290px]">
            <Image
              alt="Баница със сирене и свежа шопска салата"
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 420px, 100vw"
              src="/images/recipes/hero-banitsa-shopska-salad.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,18,8,0.14),rgba(28,18,8,0.03)_42%,rgba(28,18,8,0.3))]" />
            <div className="absolute left-3 top-3 rounded-full bg-[#fff8ee]/95 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#3a2417] shadow-[0_8px_22px_rgba(28,18,8,0.18)] ring-1 ring-white/70 backdrop-blur-md sm:left-4 sm:top-4">
              Препоръчано днес
            </div>
            <div className="absolute bottom-3 left-3 right-3 rounded-[1.05rem] border border-white/70 bg-[#fff8ee]/95 p-2.5 shadow-[0_10px_24px_rgba(60,35,20,0.12)] sm:p-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b45309]">
                Идея за довечера
              </p>
              <p className="mt-1 text-[1.3rem] font-bold leading-tight text-[#3a2417] sm:text-[1.45rem] xl:text-[1.55rem]">
                Баница + свежа салата
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-brand-200 bg-white/95 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                  65 мин.
                </span>
                <span className="rounded-full border border-stone-200 bg-white/95 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                  8 порции
                </span>
                <span className="rounded-full border border-stone-200 bg-white/95 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                  домашно
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#2b1a0d,#1c1208_58%,#57321a)] px-5 py-5 text-white shadow-[0_18px_52px_rgba(70,42,18,0.16)] sm:px-7 sm:py-6 xl:px-9 xl:py-7"
      >
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-300">
              Домашен избор
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2rem] xl:text-[2.35rem]">
              По-малко чудене, повече спокойствие около масата.
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-100 sm:text-base">
              Подбери ястие според време, категория и настроение. Каталогът събира познати
              български вкусове в удобен ритъм за делнична вечер, гости или бавна неделя.
            </p>
          </div>
          <Link
            className="ui-button inline-flex w-fit items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-black text-stone-950 shadow-sm transition hover:bg-brand-50 hover:text-brand-800"
            href="/catalog"
          >
            Разгледай каталога
          </Link>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-6xl space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">
            Избрани рецепти
          </p>
          <h2 className="mt-1.5 text-3xl font-bold text-stone-950 sm:text-4xl">
            Започни с класиките
          </h2>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-3 xl:gap-6">
          {featuredRecipes.map((recipe, index) => (
            <RecipeCard
              className="min-h-[500px]"
              key={recipe.slug}
              recipe={recipe}
              tagLimit={2}
              visualIndex={index}
            />
          ))}
        </div>
      </section>

      <section
        id="explore"
        className="grid gap-7 rounded-[2rem] border border-stone-200 bg-white/76 p-6 shadow-[0_18px_52px_rgba(89,52,22,0.08)] sm:p-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(560px,1fr)] lg:items-center xl:gap-10 xl:p-10"
      >
        <div className="max-w-2xl rounded-[1.7rem] border border-brand-100 bg-[#fff8ee]/78 p-5 sm:p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Какво можеш да правиш
          </p>
          <h2 className="mt-2 text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
            Разглеждай, избирай и готви по-лесно
          </h2>
          <p className="mt-4 text-base font-medium leading-8 text-[#4a2a17]">
            Chefo&apos;s Recipes подрежда най-важното за всяка рецепта - категория, време,
            продукти, стъпки и любими идеи, за да стигаш по-бързо до добър избор.
          </p>
          <Link
            className="ui-button mt-6 inline-flex w-fit rounded-full bg-brand-600 px-5 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
            href="/catalog"
          >
            Разгледай каталога
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {featureItems.map((item) => (
            <article
              className="rounded-[1.5rem] border border-brand-100 bg-[#fff8ee]/88 p-5 shadow-sm transition hover:border-brand-200 hover:bg-[#fff8ee]"
              key={item.title}
            >
              <div className="flex items-start gap-3">
                <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-100 text-sm font-black text-brand-800">
                  {item.accent}
                </span>
                <h3 className="pt-1 text-xl font-bold leading-tight text-stone-950">{item.title}</h3>
              </div>
              <p className="mt-2 text-base font-medium leading-7 text-[#4a2a17]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
