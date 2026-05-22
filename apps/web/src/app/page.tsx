import Image from "next/image";
import Link from "next/link";
import { RecipeCard } from "./recipe-card";

const featuredRecipes = [
  {
    title: "Шопска салата",
    slug: "shopska-salad",
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
    slug: "banitsa-with-sirene",
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
    slug: "kavarma-pork-stew",
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
  { value: "10,000+", label: "рецепти" },
  { value: "10", label: "категории" },
  { value: "12", label: "тага" },
  { value: "бърз", label: "избор за вечеря" }
];

export default function HomePage() {
  return (
    <div className="page-shell space-y-16 xl:space-y-20">
      <section className="grid gap-10 py-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)] lg:items-center xl:gap-14 xl:py-8">
        <div className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-brand-200 bg-white/86 px-4 py-2 text-[15px] font-bold text-brand-800 shadow-sm">
            Български рецепти за всеки ден
          </div>

          <div className="max-w-5xl space-y-6">
            <h1 className="text-5xl font-bold leading-[0.98] text-stone-950 sm:text-6xl lg:text-7xl">
              Намери <span className="text-brand-600">вкусна</span> и практична рецепта, преди{" "}
              <span className="text-brand-600">тиганът</span> да загрее.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-stone-600 sm:text-xl">
              Chefo&apos;s Recipes е подреден каталог за домашна храна, в който лесно
              сравняваш време за приготвяне и намираш идея за следващото готвене.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-brand-600 px-6 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
              href="/catalog"
            >
              Виж избраните
            </Link>
            <Link
              className="rounded-full border border-stone-300 bg-white/88 px-6 py-3 text-base font-black text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-800"
              href="#explore"
            >
              Какво можеш да правиш
            </Link>
          </div>

          <div className="grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {homepageStats.map((stat) => (
              <div
                className="editorial-card rounded-[1.4rem] px-5 py-4"
                key={`${stat.value}-${stat.label}`}
              >
                <p className="text-3xl font-black leading-none text-stone-950">{stat.value}</p>
                <p className="mt-2 text-base font-bold leading-6 text-stone-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="hero-food-visual min-h-[320px] overflow-hidden rounded-[2.4rem] border border-white/70 shadow-[0_28px_90px_rgba(87,50,20,0.2)] sm:min-h-[380px] lg:min-h-[480px]">
            <Image
              alt="Баница със сирене и свежа шопска салата"
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              src="/images/recipes/hero-banitsa-shopska-salad.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,18,8,0.14),rgba(28,18,8,0.03)_42%,rgba(28,18,8,0.3))]" />
            <div className="absolute left-4 top-4 rounded-full bg-[#fff8ee]/95 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#3a2417] shadow-[0_8px_22px_rgba(28,18,8,0.18)] ring-1 ring-white/70 backdrop-blur-md sm:left-6 sm:top-6 sm:text-sm">
              Препоръчано днес
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-[1.8rem] border border-white/60 bg-[#fff7ec]/88 p-5 shadow-[0_18px_48px_rgba(42,25,10,0.2)] backdrop-blur-lg sm:bottom-6 sm:left-6 sm:right-6 sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
                Идея за довечера
              </p>
              <p className="mt-2 text-3xl font-bold leading-tight text-[#3a2417] sm:text-4xl">
                Баница + свежа салата
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-brand-200 bg-white/95 px-3 py-1 text-sm font-bold text-brand-800">
                  65 мин.
                </span>
                <span className="rounded-full border border-stone-200 bg-white/95 px-3 py-1 text-sm font-bold text-stone-700">
                  8 порции
                </span>
                <span className="rounded-full border border-stone-200 bg-white/95 px-3 py-1 text-sm font-bold text-stone-700">
                  домашно
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,#2b1a0d,#1c1208_58%,#57321a)] px-6 py-8 text-white shadow-[0_24px_70px_rgba(70,42,18,0.18)] sm:px-8 sm:py-10 xl:px-12"
      >
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-300">
              Домашен избор
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">
              По-малко чудене, повече спокойствие около масата.
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-100 sm:text-lg">
              Подбери ястие според време, категория и настроение. Каталогът събира познати
              български вкусове в удобен ритъм за делнична вечер, гости или бавна неделя.
            </p>
          </div>
          <Link
            className="inline-flex w-fit items-center justify-center rounded-full bg-white px-6 py-3 text-base font-black text-stone-950 shadow-sm transition hover:bg-brand-50 hover:text-brand-800"
            href="/catalog"
          >
            Разгледай каталога
          </Link>
        </div>
      </section>

      <section id="featured" className="space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Избрани рецепти
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">
            Започни с класиките
          </h2>
        </div>

        <div className="grid items-stretch gap-7 lg:grid-cols-3 xl:gap-8">
          {featuredRecipes.map((recipe, index) => (
            <RecipeCard
              className="min-h-[560px]"
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
          <p className="mt-4 text-base leading-8 text-stone-600">
            Chefo&apos;s Recipes подрежда най-важното за всяка рецепта - категория, време,
            продукти, стъпки и любими идеи, за да стигаш по-бързо до добър избор.
          </p>
          <Link
            className="mt-6 inline-flex w-fit rounded-full bg-brand-600 px-5 py-3 text-base font-black text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
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
              <p className="mt-2 text-base leading-7 text-stone-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
