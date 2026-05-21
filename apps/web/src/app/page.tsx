import Link from "next/link";
import { RecipeCard } from "./recipe-card";

const featuredRecipes = [
  {
    title: "Шопска салата",
    slug: "shopska-salad",
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

const userActions = [
  {
    accent: "01",
    title: "Избирай според настроението",
    description:
      "Преглеждай бързи ястия, основни, свежи салати, супи, тестени рецепти и десерти."
  },
  {
    accent: "02",
    title: "Сравнявай за секунди",
    description:
      "Виж време за приготвяне, порции, трудност и тагове, за да избереш по-лесно."
  },
  {
    accent: "03",
    title: "Готви стъпка по стъпка",
    description:
      "Страниците на рецептите събират продуктите и ясните инструкции на едно място."
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
          <div className="hero-food-visual min-h-[460px] overflow-hidden rounded-[2.4rem] border border-white/70 shadow-[0_28px_90px_rgba(87,50,20,0.2)] sm:min-h-[540px]">
            <div className="absolute left-6 top-6 rounded-full border border-white/55 bg-white/86 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-brand-800 shadow-sm backdrop-blur">
              Препоръчано днес
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-[1.8rem] border border-white/55 bg-white/92 p-5 shadow-[0_18px_48px_rgba(42,25,10,0.18)] backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
                Идея за довечера
              </p>
              <p className="mt-2 text-3xl font-bold leading-tight text-stone-950">
                Баница + свежа салата
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-800">
                  65 мин.
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-700">
                  8 порции
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-700">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
              Избрани рецепти
            </p>
            <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">
              Започни с класиките
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-stone-600">
            Подбрани домашни рецепти с ясни продукти, време за приготвяне и удобни детайли за
            бърз избор.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 xl:gap-8">
          {featuredRecipes.map((recipe, index) => (
            <RecipeCard
              className="min-h-[460px]"
              key={recipe.slug}
              recipe={recipe}
              tagLimit={2}
              visualIndex={index}
            />
          ))}
        </div>
      </section>

      <section id="explore" className="space-y-7">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">
            Какво можеш да правиш
          </p>
          <h2 className="mt-2 text-4xl font-bold text-stone-950 sm:text-5xl">
            Разглеждай, избирай и готви по-лесно
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3 xl:gap-8">
          {userActions.map((item) => (
            <div className="info-card rounded-[1.8rem] p-6" key={item.title}>
              <span className="mb-5 inline-grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-sm font-black text-brand-800">
                {item.accent}
              </span>
              <h3 className="text-xl font-bold text-stone-950">{item.title}</h3>
              <p className="mt-3 text-base leading-7 text-stone-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
