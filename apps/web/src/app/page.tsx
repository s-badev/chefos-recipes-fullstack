import Image from "next/image";
import Link from "next/link";
import { recipes } from "../data/recipes";
import { webImageSrc } from "../lib/images";
import { neuterCount, summarizeCategories } from "../lib/categories";
import { formatTotalTime, servingsLabel } from "../lib/format";
import { traditionQuote } from "../lib/landing-content";
import { weeklyRecipe } from "../lib/weekly";
import { CategoryRail } from "./category-rail";
import { EditorialTitle, SplitWords } from "./split-heading";

export const revalidate = 3600;
const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase("bg-BG") + word.slice(1);

export default function HomePage() {
  const weekly = weeklyRecipe(recipes);
  const recipe = weekly.recipe;
  const index = recipes.slice(0, 8);
  const [quoteBefore, quoteAfter] = traditionQuote.split("вкус");
  const categories = summarizeCategories(recipes);
  const countWord = neuterCount(categories.length);

  return <>
    <section className="hero" aria-labelledby="landing-title" data-hero data-zoom>
      <div className="hero-par" data-par="0.18"><div className="zoom">
        <Image src={webImageSrc("/images/recipes/hero-banitsa-shopska-salad.png")} alt="Баница със сирене и шопска салата на българската трапеза" className="ph" fill priority sizes="100vw" />
      </div></div>
      <div className="hero-in"><div className="wrap">
        <h1 id="landing-title" data-split><SplitWords text="Българска" /> <em><SplitWords text="трапеза" start={1}/></em></h1>
        <div className="hero-sub">
          <span className="eyebrow">Nº 01–{String(recipes.length).padStart(2, "0")} · подбрани рецепти</span>
          <a className="eyebrow" href="#weekly">Прелисти <span className="arrow" aria-hidden="true">↓</span></a>
        </div>
      </div></div>
    </section>

    <section className="cover" id="weekly" aria-labelledby="cover-title">
      <div className="wrap"><div className="cover-grid">
        <div className="cover-text">
          <p className="eyebrow" data-r>Рецепта на седмицата</p>
          <h2 className="cover-t" id="cover-title" data-split><EditorialTitle text={recipe.title}/></h2>
          <p className="cover-d" data-r>{recipe.description}</p>
          <p className="cover-m" data-r>{recipe.category} · {formatTotalTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)} · {servingsLabel(recipe.servings)}</p>
          <div data-r><Link className="btn" href={`/catalog/${recipe.slug}`}>Виж рецептата →</Link></div>
        </div>
        <Link className="cover-photo" href={`/catalog/${recipe.slug}`} data-mask aria-label={recipe.title}>
          <span className="mk"><Image src={webImageSrc(recipe.imageSrc!)} alt={recipe.imageAlt ?? recipe.title} className="ph" fill sizes="(max-width: 820px) calc(100vw - 32px), (max-width: 1360px) 66vw, 870px" /></span>
        </Link>
      </div></div>
    </section>

    <section aria-labelledby="rail-title">
      <CategoryRail categories={categories} heading={
        <h2 className="sec-h" id="rail-title" data-split><SplitWords text={capitalize(countWord)}/> <em><SplitWords text="ястия," start={1}/></em> <SplitWords text={`${countWord} настроения`} start={2}/></h2>
      }/>
    </section>

    <section className="quote" aria-labelledby="tradition-title">
      <div className="wrap">
        <h2 className="eyebrow" id="tradition-title" data-r>За традицията</h2>
        <p className="quote-t" data-split><SplitWords text={quoteBefore.trim()}/> <em><SplitWords text="вкус" start={7}/></em><SplitWords text={quoteAfter} start={7}/></p>
      </div>
    </section>

    <section className="wrap idx" aria-labelledby="index-title">
      <div className="idx-side">
        <p className="eyebrow">Съдържание</p>
        <h2 className="sec-h idx-h" id="index-title" data-split><SplitWords text="Какво да сготвиш"/> <em><SplitWords text="днес" start={3}/></em></h2>
        <div data-r><Link className="btn solid" href="/catalog">Всички рецепти →</Link></div>
      </div>
      <ul className="idx-list" id="recipe-index">
        {index.map((item, i) => <li key={item.slug}><Link className="row" href={`/catalog/${item.slug}`} data-preview={item.slug}>
          <span className="row-n">Nº {String(i + 1).padStart(2, "0")}</span><span className="row-t">{item.title}</span><span className="row-m">{item.category} · {formatTotalTime(item.prepTimeMinutes, item.cookTimeMinutes)}</span>
        </Link></li>)}
      </ul>
    </section>
    <div className="preview" id="recipe-preview" aria-hidden="true">
      {index.map(item => <Image key={item.slug} data-preview-image={item.slug} hidden src={webImageSrc(item.imageSrc!)} alt="" width={300} height={225} sizes="300px"/>)}
    </div>
  </>;
}
