import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { recipes } from "../data/recipes";
import { webImageSrc } from "../lib/images";
import { weeklyImageSizes } from "../lib/image-sizes";
import { categoryHref } from "../lib/categories";
import { toCardRecipe } from "../lib/catalog";
import { formatCookTime, formatTotalTime, recipeCountLabel } from "../lib/format";
import { landingQuote } from "../lib/landing-content";
import { hasRecipePhoto } from "../lib/recipe-detail";
import { sofraCategories, todayRecipes } from "../lib/sofra";
import { weeklyRecipe } from "../lib/weekly";
import { getCurrentUserFavoriteSlugs } from "../server/favorites/service";
import { getPublicRecipes } from "../server/recipes/catalog";
import { RecipeTile, type TileVariant } from "./recipe-tile";
import { SofraTable } from "./sofra-table";
import { SplitWords } from "./split-heading";
import { StitchBand, StitchStar } from "./stitch";

/** The five "today" cards: one large on the left, four smaller on the right (as in the mock). */
const TODAY_LAYOUT: TileVariant[] = ["big", "half", "half", "half", "half"];

export default async function HomePage() {
  // Counts come from the same list as the catalog (curated + manual admin recipes), so both pages agree.
  const [favorites, publicRecipes] = await Promise.all([getCurrentUserFavoriteSlugs(), getPublicRecipes()]);
  const favoriteSlugs = new Set(favorites);
  const total = recipeCountLabel(publicRecipes.length);
  const weekly = weeklyRecipe(recipes).recipe;
  const today = todayRecipes(recipes, weekly.slug).map(toCardRecipe);
  const image = (recipe: { slug: string; imageSrc?: string }) => (hasRecipePhoto(recipe) ? webImageSrc(recipe.imageSrc!) : undefined);
  const plates = sofraCategories(publicRecipes).map(category => ({
    name: category.name,
    countLabel: recipeCountLabel(category.count),
    href: categoryHref(category.name),
    image: image(category.cover),
    recipes: category.recipes.slice(0, 3).map(recipe => ({ slug: recipe.slug, title: recipe.title, image: image(recipe), time: formatTotalTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes) }))
  }));
  const bakes = weekly.tags.includes("С печене");

  return <>
    <section className="hero" aria-labelledby="landing-title" data-hero>
      <div className="hero-ph">
        <Image alt="Баница със сирене и шопска салата на трапезата" fill loading="eager" sizes="100vw" src={webImageSrc("/images/recipes/hero-banitsa-shopska-salad.png")} />
      </div>
      <div className="wrap hero-in">
        <p className="eyebrow rv">Домашна кухня · {total}</p>
        <h1 data-split id="landing-title"><SplitWords text="Българска" /> <em><SplitWords start={1} text="трапеза" /></em></h1>
        <div className="hero-row">
          <p className="rv" style={{ "--d": "500ms" } as CSSProperties}>Рецепти, по които се готви у дома: познати продукти, точно време и стъпки, които се следват спокойно.</p>
          <div className="hero-cta rv" style={{ "--d": "650ms" } as CSSProperties}>
            <Link className="btn fill" href="/catalog">Към рецептите <span aria-hidden="true" className="ar">→</span></Link>
            <a className="btn out" href="#sofra">Седни на софрата <span aria-hidden="true" className="ar">↓</span></a>
          </div>
        </div>
        <StitchBand />
      </div>
    </section>

    <section aria-labelledby="sofra-title" className="sec home" id="sofra">
      <SofraTable
        intro={<>
          <p className="eyebrow rv">Шест ястия, шест повода</p>
          <h2 className="sec-h" data-split id="sofra-title"><SplitWords text="Седни на" /> <em><SplitWords start={2} text="софрата" /></em></h2>
          <p className="lead rv">Завърти софрата и избери с какво да започнеш: салата за лятна вечер, чорба за студен ден или нещо сладко за неделя.</p>
        </>}
        plates={plates}
      />
    </section>

    <section aria-labelledby="week-title" className="sec home">
      <div className="wrap week">
        <div className="week-ph mask">
          <Link aria-label={weekly.title} className="mk" href={`/catalog/${weekly.slug}`}>
            {image(weekly) ? <Image alt="" fill loading="lazy" sizes={weeklyImageSizes} src={image(weekly)!} /> : <span className="ci-empty"><StitchStar /></span>}
          </Link>
          <StitchBand size={2} />
        </div>
        <div className="week-tx">
          <p className="eyebrow rv">Рецепта на седмицата</p>
          <h2 data-split id="week-title"><WeeklyTitle title={weekly.title} /></h2>
          <p className="rv">{weekly.description}</p>
          <dl className="facts rv">
            <div><dt>Подготовка</dt><dd>{weekly.prepTimeMinutes} мин</dd></div>
            <div><dt>{bakes ? "Печене" : "Готвене"}</dt><dd className={weekly.cookTimeMinutes ? undefined : "word"}>{formatCookTime(weekly.cookTimeMinutes)}</dd></div>
            <div><dt>Порции</dt><dd>{weekly.servings}</dd></div>
          </dl>
          <div className="rv"><Link className="btn fill" href={`/catalog/${weekly.slug}`}>Виж рецептата <span aria-hidden="true" className="ar">→</span></Link></div>
        </div>
      </div>
    </section>

    <section aria-labelledby="today-title" className="sec home">
      <div className="wrap">
        <div className="sec-top">
          <h2 className="sec-h" data-split id="today-title"><SplitWords text="Какво да сготвиш" /> <em><SplitWords start={3} text="днес" /></em></h2>
          <p className="lead rv">Пет рецепти за тази седмица: от бърза вечеря до ястие, което се приготвя бавно и се яде дълго.</p>
        </div>
        <div className="cards">
          {today.map((recipe, index) => (
            <RecipeTile index={index} key={recipe.slug} recipe={recipe} redirectTo="/" saved={favoriteSlugs.has(recipe.slug)} variant={TODAY_LAYOUT[index]} />
          ))}
        </div>
        <div className="more rv"><Link className="btn out" href="/catalog">Всички {total} <span aria-hidden="true" className="ar">→</span></Link></div>
      </div>
    </section>

    <section aria-labelledby="story-title" className="story">
      <h2 className="sr-only" id="story-title">За традицията</h2>
      <div className="story-bg"><Image alt="" fill sizes="100vw" src={webImageSrc("/images/recipes/kavarma-sas-svinsko.png")} /></div>
      <div className="wrap">
        <div className="rv"><StitchStar /></div>
        <blockquote>
          <q data-split><SplitWords text={landingQuote.before} /> <em><SplitWords start={landingQuote.before.split(" ").length} text={landingQuote.italic} /></em> <SplitWords start={7} text={landingQuote.after} /></q>
          <cite className="rv">{landingQuote.signature}</cite>
        </blockquote>
      </div>
    </section>
  </>;
}

/** "Баница със <em>сирене</em>": the last word of the weekly title in italics. */
function WeeklyTitle({ title }: { title: string }) {
  const words = title.split(" ");
  const last = words.pop()!;
  return <>{words.length ? <><SplitWords text={words.join(" ")} />{" "}</> : null}<em><SplitWords start={words.length} text={last} /></em></>;
}
