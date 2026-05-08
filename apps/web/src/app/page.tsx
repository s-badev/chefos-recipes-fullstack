const featuredRecipes = [
  {
    title: "Шопска салата",
    slug: "shopska-salad",
    description: "Домати, краставици, печени чушки, магданоз и настъргано сирене.",
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
    title: "Избирай според настроението",
    description: "Преглеждай бързи ястия, основни, свежи салати, супи, тестени рецепти и десерти."
  },
  {
    title: "Сравнявай за секунди",
    description: "Виж време за приготвяне, порции, трудност и тагове, за да избереш по-лесно."
  },
  {
    title: "Готви стъпка по стъпка",
    description: "Страниците на рецептите ще събират продуктите и ясните инструкции на едно място."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm">
            Български рецепти за всеки ден
          </div>
          <div className="max-w-3xl space-y-5">
            <h2 className="text-4xl font-bold leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Намери вкусна и практична рецепта, преди тиганът да загрее.
            </h2>
            <p className="text-lg leading-8 text-stone-600">
              Chefo’s Recipes е подреден каталог за домашна храна, в който лесно сравняваш време за
              приготвяне и намираш идеи за следващото готвене.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
              href="#featured"
            >
              Виж избраните
            </a>
            <a
              className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-800 shadow-sm transition hover:border-brand-300 hover:text-brand-800"
              href="#explore"
            >
              Какво можеш да правиш
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="grid min-h-[360px] grid-rows-[1.2fr_0.8fr]">
            <div
              aria-label="Маса с вдъхновение за български рецепти"
              className="relative bg-[radial-gradient(circle_at_25%_25%,#ffffff_0_8%,transparent_9%),radial-gradient(circle_at_76%_34%,#fee2b8_0_12%,transparent_13%),linear-gradient(135deg,#e9571c,#f6b44b_48%,#6f8f56)]"
              role="img"
            >
              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
                  Идея за довечера
                </p>
                <p className="mt-1 text-2xl font-bold text-stone-950">Баница + салата</p>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-stone-200 border-t border-stone-200 text-center">
              <div className="p-5">
                <p className="text-2xl font-bold text-stone-950">9</p>
                <p className="mt-1 text-sm text-stone-500">начални рецепти</p>
              </div>
              <div className="p-5">
                <p className="text-2xl font-bold text-stone-950">6</p>
                <p className="mt-1 text-sm text-stone-500">категории</p>
              </div>
              <div className="p-5">
                <p className="text-2xl font-bold text-stone-950">0</p>
                <p className="mt-1 text-sm text-stone-500">заявки към база</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="rounded-3xl bg-stone-950 px-6 py-8 text-white sm:px-8">
        <div className="grid gap-5 md:grid-cols-[0.75fr_1.25fr] md:items-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-300">
            Първо прост каталог
          </p>
          <p className="text-xl leading-8 text-stone-100">
            Този първи екран е за откриване на рецепти: топла визия, полезни детайли и ясни пътища
            за разглеждане. Профили, любими рецепти, админ инструменти, API маршрути и база данни
            остават за следващите стъпки.
          </p>
        </div>
      </section>

      <section id="featured" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
              Избрани рецепти
            </p>
            <h2 className="mt-2 text-3xl font-bold text-stone-950">Започни с класиките</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-600">
            Засега това са статични примери, подготвени така, че по-късно да захранят карти в
            каталога и страници с детайли.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredRecipes.map((recipe, index) => (
            <article
              className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
              key={recipe.slug}
            >
              <div
                aria-label={recipe.imageAlt}
                className={[
                  "h-44",
                  index === 0
                    ? "bg-[linear-gradient(135deg,#d9462f,#f7f0c2_48%,#5e8d55)]"
                    : "",
                  index === 1
                    ? "bg-[linear-gradient(135deg,#f3b34d,#fff1c7_45%,#a3652a)]"
                    : "",
                  index === 2
                    ? "bg-[linear-gradient(135deg,#7b2f1f,#d86f31_48%,#6f8b5b)]"
                    : ""
                ].join(" ")}
                role="img"
              />
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                    {recipe.category}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">{recipe.difficulty}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-950">{recipe.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{recipe.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-4 text-sm">
                  <div>
                    <p className="font-bold text-stone-950">{recipe.prepTimeMinutes}m</p>
                    <p className="text-stone-500">подг.</p>
                  </div>
                  <div>
                    <p className="font-bold text-stone-950">{recipe.cookTimeMinutes}m</p>
                    <p className="text-stone-500">готв.</p>
                  </div>
                  <div>
                    <p className="font-bold text-stone-950">{recipe.servings}</p>
                    <p className="text-stone-500">порции</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="explore" className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
            Какво могат потребителите
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-950">Разглеждане сега, персонализация по-късно</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {userActions.map((item) => (
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" key={item.title}>
              <h3 className="text-lg font-bold text-stone-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
