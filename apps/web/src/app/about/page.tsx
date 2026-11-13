import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "../../lib/site-metadata";
import Image from "next/image";
import { ResponsiveRecipeImage } from "../responsive-recipe-image";
import Link from "next/link";
import { webImageSrc } from "../../lib/images";
import { principlesImageSizes } from "../../lib/image-sizes";
import { SplitWords } from "../split-heading";
import { StitchBand, StitchStar } from "../stitch";

export const metadata: Metadata = pageMetadata("За нас", "Подреден каталог за домашна храна, български вкус и практични идеи за готвене.", "/about");

const rhythm = ["Избираш спокойно.", "Готвиш уверено.", "Сядаш на масата."];

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

/** The roadmap items, each split into a short title and the rest of the same sentence. */
const roadmap = [
  { title: "По-богат каталог", text: "С още български домашни рецепти." },
  { title: "По-добри лични списъци", text: "С любими идеи." },
  { title: "По-полезни филтри", text: "Според сезон, време и повод." }
];

const delay = (index: number) => ({ "--d": `${index * 80}ms` }) as CSSProperties;

export default function AboutPage() {
  return <>
    <section aria-labelledby="about-title" className="r-hero pg-hero" data-hero>
      <div className="hero-ph">
        <Image alt="" fill loading="eager" priority quality={55} sizes="100vw" src={webImageSrc("/images/recipes/kyufteta-na-skara.png")} />
      </div>
      <div className="wrap hero-in">
        <p className="eyebrow rv">Какво е Chefo&apos;s Recipes</p>
        <h1 data-split id="about-title"><SplitWords text="Подреден каталог за" /> <em><SplitWords start={3} text="домашна храна" /></em></h1>
        <p className="r-desc rv" style={{ "--d": "300ms" } as CSSProperties}>
          Chefo&apos;s Recipes е създаден за хора, които искат бързо да намерят рецепта, да сравнят времето за
          приготвяне, продуктите и трудността и да се върнат към любимите си идеи по-късно.
        </p>
        <StitchBand />
      </div>
    </section>

    <section aria-label="Ритъм" className="sec sec-tight rhythm">
      <div className="wrap">
        <p className="eyebrow rv">Ритъм</p>
        <ol>
          {rhythm.map((line, index) => (
            <li className="rv" key={line} style={delay(index)}><span aria-hidden="true" className="st-i"><StitchStar /></span>{line}</li>
          ))}
        </ol>
      </div>
    </section>

    <section aria-labelledby="about-who" className="sec sec-tight">
      <div className="wrap">
        <div className="sec-top">
          <div>
            <p className="eyebrow rv">За кого е създаден</p>
            <h2 className="sec-h" data-split id="about-who"><SplitWords text="За реалното готвене" /> <em><SplitWords start={3} text="у дома" /></em></h2>
          </div>
        </div>
        <div className="cols3">
          {audienceCards.map((item, index) => (
            <article className="col rv" key={item.title} style={delay(index)}>
              <span aria-hidden="true" className="st-i"><StitchStar /></span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section aria-labelledby="about-cap" className="sec sec-tight">
      <div className="wrap cap">
        <div className="cap-side">
          <p className="eyebrow rv">Какво можеш да правиш</p>
          <h2 className="sec-h" data-split id="about-cap"><SplitWords text="По-малко чудене преди" /> <em><SplitWords start={3} text="готвене" /></em></h2>
          <p className="lead rv">
            Основната цел е да стигнеш до добър избор бързо, без да губиш важните детайли за продуктите,
            времето и начина на приготвяне.
          </p>
        </div>
        <ol className="cap-list">
          {capabilityCards.map(item => (
            <li className="cap-li rv" key={item.title}>
              <span aria-hidden="true" className="st-n">{item.accent}</span>
              <div><h3>{item.title}</h3><p>{item.description}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section aria-labelledby="about-principles" className="sec sec-tight">
      <div className="wrap">
        <div className="sec-top">
          <div>
            <p className="eyebrow rv">Как подбираме рецептите</p>
            <h2 className="sec-h" data-split id="about-principles"><SplitWords text="Практични, ясни и близки" /> <em><SplitWords start={4} text="до дома" /></em></h2>
          </div>
          <p className="lead rv">
            Фокусът е върху рецепти с познати продукти, реалистично време и ясни стъпки – така че изборът да е
            бърз, а готвенето спокойно.
          </p>
        </div>
        <div className="princ">
          <div className="princ-ph mask">
            {/* The photograph is drawn 10% larger from its top-left corner, so the generator mark in the
                bottom-right corner of this master always falls outside the frame. */}
            <div className="mk"><span className="princ-crop"><ResponsiveRecipeImage alt="" fill loading="lazy" sizes={principlesImageSizes} src={webImageSrc("/images/recipes/banitsa-s-praz.png")} use="wide" /></span></div>
            <StitchBand size={2} />
          </div>
          <ul className="princ-list">
            {selectionPrinciples.map((item, index) => (
              <li className="rv" key={item.title} style={delay(index)}><h3>{item.title}</h3><p>{item.description}</p></li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section aria-labelledby="about-why" className="sec">
      <div className="wrap why">
        <div className="why-tx">
          <p className="eyebrow rv">Защо българска домашна кухня</p>
          <h2 className="sec-h" data-split id="about-why"><SplitWords text="Защото познатият вкус" /> <em><SplitWords start={3} text="също заслужава" /></em> <SplitWords start={5} text="добра подредба" /></h2>
          <p className="lead rv">
            Българската домашна кухня е богата, сезонна и практична. Chefo&apos;s Recipes я представя в удобен
            дигитален формат, без да отнема от усещането за истинска храна на масата.
          </p>
        </div>
        <div className="why-nx">
          <p className="eyebrow rv">Какво предстои</p>
          <ul className="perks">
            {roadmap.map((item, index) => (
              <li className="rv" key={item.title} style={delay(index)}><span className="pst"><StitchStar /></span><b>{item.title}</b><span className="t">{item.text}</span></li>
            ))}
          </ul>
          <div className="rv"><Link className="btn fill" href="/catalog">Всички рецепти <span aria-hidden="true" className="ar">→</span></Link></div>
        </div>
      </div>
    </section>
  </>;
}
