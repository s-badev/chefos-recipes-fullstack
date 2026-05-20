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
    accent: "01",
    title: "Избирай според настроението",
    description: "Преглеждай бързи ястия, основни, свежи салати, супи, тестени рецепти и десерти."
  },
  {
    accent: "02",
    title: "Сравнявай за секунди",
    description: "Виж време за приготвяне, порции, трудност и тагове, за да избереш по-лесно."
  },
  {
    accent: "03",
    title: "Готви стъпка по стъпка",
    description: "Страниците на рецептите ще събират продуктите и ясните инструкции на едно място."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-20 xl:space-y-24">
      <section className="-mx-6 grid gap-10 bg-white/35 px-6 py-10 sm:-mx-8 sm:px-8 lg:-mx-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(440px,0.7fr)] lg:items-center lg:px-12 xl:-mx-16 xl:px-16 2xl:-mx-20 2xl:grid-cols-[minmax(0,1.55fr)_minmax(520px,0.65fr)] 2xl:px-20">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm">
            Български рецепти за всеки ден
          </div>
          <div className="max-w-5xl space-y-5">
            <h2 className="text-4xl font-bold leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Намери вкусна и практична рецепта, преди тиганът да загрее.
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-stone-600">
              Chefo’s Recipes е подреден каталог за домашна храна, в който лесно сравняваш време за
              приготвяне и намираш идеи за следващото готвене.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
              href="/catalog"
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

        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm lg:justify-self-stretch">
          <div className="grid min-h-[340px] grid-rows-[1.25fr_auto] sm:min-h-[390px] lg:min-h-[500px]">
            <div
              aria-label="Маса с вдъхновение за български рецепти"
              className="food-visual food-visual--salad relative"
              role="img"
            >
              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
                  Идея за довечера
                </p>
                <p className="mt-1 text-2xl font-bold text-stone-950">Баница + салата</p>
              </div>
            </div>
            <div className="grid gap-px border-t border-stone-200 bg-stone-200 text-center sm:grid-cols-3">
              <div className="bg-white p-4 sm:p-5">
                <p className="text-2xl font-bold text-stone-950">9</p>
                <p className="mt-1 text-sm text-stone-500">начални рецепти</p>
              </div>
              <div className="bg-white p-4 sm:p-5">
                <p className="text-2xl font-bold text-stone-950">6</p>
                <p className="mt-1 text-sm text-stone-500">категории</p>
              </div>
              <div className="bg-white p-4 sm:p-5">
                <p className="text-2xl font-bold text-stone-950">3</p>
                <p className="mt-1 text-sm text-stone-500">идеи за вечеря</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="rounded-[2rem] bg-[linear-gradient(135deg,#26170c,#1c1208_58%,#3b2312)] px-6 py-7 text-white shadow-[0_18px_46px_rgba(70,42,18,0.14)] sm:px-8 sm:py-8 xl:px-10">
        <div className="grid gap-5 md:grid-cols-[0.45fr_1.55fr] md:items-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-300">
            Домашен избор
          </p>
          <p className="max-w-5xl text-lg leading-8 text-stone-100 sm:text-xl">
            Откривай познати вкусове, сравнявай времето за приготвяне и избирай рецепти, които
            можеш да следваш спокойно стъпка по стъпка.
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
            Подбрани домашни рецепти с ясни продукти, време за приготвяне и удобни детайли за
            бърз избор.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 xl:gap-8">
          {featuredRecipes.map((recipe, index) => (
            <article
              className="recipe-card group overflow-hidden rounded-3xl"
              key={recipe.slug}
            >
              <div
                aria-label={recipe.imageAlt}
                className={[
                  "food-visual h-48 transition duration-300 group-hover:scale-[1.02] xl:h-56",
                  index === 0
                    ? "food-visual--salad"
                    : "",
                  index === 1
                    ? "food-visual--baked"
                    : "",
                  index === 2
                    ? "food-visual--stew"
                    : ""
                ].join(" ")}
                role="img"
              />
              <div className="space-y-4 p-5 xl:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                    {recipe.category}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">{recipe.difficulty}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold leading-tight text-stone-950">{recipe.title}</h3>
                  <p className="mt-3 text-base leading-7 text-stone-600">{recipe.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-4 text-sm">
                  <div>
                    <p className="text-base font-bold text-stone-950">{recipe.prepTimeMinutes}m</p>
                    <p className="text-[0.8rem] text-stone-500">подг.</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-stone-950">{recipe.cookTimeMinutes}m</p>
                    <p className="text-[0.8rem] text-stone-500">готв.</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-stone-950">{recipe.servings}</p>
                    <p className="text-[0.8rem] text-stone-500">порции</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                      className="rounded-full bg-stone-100 px-3 py-1 text-[0.8rem] font-medium text-stone-600"
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
            Какво можеш да правиш
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-950">Разглеждай, избирай и готви по-лесно</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 xl:gap-8">
          {userActions.map((item) => (
            <div className="info-card rounded-3xl p-6" key={item.title}>
              <span className="mb-4 inline-grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-sm font-bold text-brand-800">
                {item.accent}
              </span>
              <h3 className="text-lg font-bold text-stone-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
