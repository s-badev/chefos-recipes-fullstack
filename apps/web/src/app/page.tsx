import Image from "next/image";
import Link from "next/link";
import { recipes } from "../data/recipes";
import { webImageSrc } from "../lib/images";
import { traditionQuote } from "../lib/landing-content";
import { weeklyRecipe } from "../lib/weekly";
import { EditorialTitle, SplitWords } from "./split-heading";

export const revalidate = 3600;
const categories = ["Бързи ястия", "Десерти", "Основни", "Салати", "Супи", "Тестени"];

export default function HomePage() {
  const weekly = weeklyRecipe(recipes);
  const recipe = weekly.recipe;
  const index = recipes.slice(0, 8);
  const [quoteBefore, quoteAfter] = traditionQuote.split("вкус");

  return <>
    <section className="hero" aria-labelledby="landing-title" data-zoom>
      <div className="hero-par" data-par="0.18"><div className="zoom">
        <Image src={webImageSrc("/images/recipes/hero-banitsa-shopska-salad.png")} alt="Баница със сирене и шопска салата на българската трапеза" className="ph" fill priority sizes="100vw" />
      </div></div>
      <div className="hero-in"><div className="wrap">
        <h1 id="landing-title" data-split><SplitWords text="Българска" /> <em><SplitWords text="трапеза" start={1}/></em></h1>
        <div className="hero-sub" data-r style={{ "--dl": "700ms" } as React.CSSProperties}>
          <span className="eyebrow">Nº 01–24 · домашни рецепти</span>
          <a className="eyebrow" href="#weekly">Листни <span className="arrow" aria-hidden="true">↓</span></a>
        </div>
      </div></div>
    </section>

    <section className="cover" id="weekly" aria-labelledby="cover-title">
      <div className="wrap"><div className="cover-grid">
        <span className="cover-n" aria-hidden="true">Nº {weekly.number}</span>
        <Link className="cover-photo" href={`/catalog/${recipe.slug}`} data-mask aria-label={recipe.title}>
          <span className="mk"><Image src={webImageSrc(recipe.imageSrc!)} alt={recipe.imageAlt ?? recipe.title} className="ph" fill sizes="(max-width: 820px) calc(100vw - 32px), (max-width: 1360px) 66vw, 870px" /></span>
        </Link>
        <div className="cover-text">
          <p className="eyebrow" data-r>Рецепта на седмицата</p>
          <h2 className="cover-t" id="cover-title" data-split><EditorialTitle text={recipe.title}/></h2>
          <div data-r><Link className="btn" href={`/catalog/${recipe.slug}`}>Виж рецептата →</Link></div>
        </div>
      </div></div>
    </section>

    <section aria-labelledby="rail-title">
      <div className="wrap rail-head">
        <h2 className="sec-h" id="rail-title" data-split><SplitWords text="Шест"/> <em><SplitWords text="ястия," start={1}/></em> <SplitWords text="шест настроения" start={2}/></h2>
        <div className="arrows"><button className="circ" type="button" data-rail-dir="-1" aria-controls="category-rail" aria-label="Назад по категориите">←</button><button className="circ" type="button" data-rail-dir="1" aria-controls="category-rail" aria-label="Напред по категориите">→</button></div>
      </div>
      <div className="rail" id="category-rail" tabIndex={0} role="group" aria-label="Категории, превъртане настрани">
        {categories.map(category => {
          const items = recipes.filter(item => item.category === category);
          return <Link className="rc" href="/catalog" key={category}>
            <Image src={webImageSrc(items[0].imageSrc!)} alt="" className="ph" fill sizes="(max-width: 958px) 230px, (max-width: 1416px) 24vw, 340px"/>
            <span className="rc-l"><b>{category}</b><span>{String(items.length).padStart(2, "0")} рецепти →</span></span>
          </Link>;
        })}
      </div>
    </section>

    <section className="quote" aria-labelledby="tradition-title">
      <div className="wrap">
        <h2 className="eyebrow" id="tradition-title" data-r>За традицията</h2>
        <p className="quote-t" data-split><SplitWords text={quoteBefore.trim()}/> <em><SplitWords text="вкус" start={7}/></em><SplitWords text={quoteAfter} start={7}/></p>
      </div>
    </section>

    <section className="wrap idx" aria-labelledby="index-title">
      <div className="idx-side"><h2 className="eyebrow" id="index-title">Съдържание</h2><div className="rn-box" id="index-counter" aria-hidden="true"><span className="rn">Nº 01</span></div></div>
      <div><ul className="idx-list" id="recipe-index">
        {index.map((item, i) => <li key={item.slug}><Link className="row" href={`/catalog/${item.slug}`} data-n={String(i + 1).padStart(2, "0")} data-preview={item.slug}>
          <span className="row-n">Nº {String(i + 1).padStart(2, "0")}</span><span className="row-t">{item.title}</span><span className="row-m">{item.category} · {item.prepTimeMinutes + item.cookTimeMinutes} мин</span>
        </Link></li>)}
      </ul><div className="more" data-r><Link className="btn solid" href="/catalog">Всички рецепти →</Link></div></div>
    </section>
    <div className="preview" id="recipe-preview" aria-hidden="true">
      {index.map(item => <Image key={item.slug} data-preview-image={item.slug} hidden src={webImageSrc(item.imageSrc!)} alt="" width={300} height={225} sizes="300px"/>)}
    </div>
  </>;
}
