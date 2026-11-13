import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { webImageSrc } from "../lib/images";
import { StitchBand, StitchStar } from "./stitch";

const PERKS = [
  { title: "Подбрани рецепти", text: "Намери бързо идея според категория, време и настроение." },
  { title: "Ясни продукти и стъпки", text: "Всяка рецепта е подредена така, че да готвиш спокойно." },
  { title: "Любими идеи", text: "Запази рецептите, към които искаш да се върнеш." }
];

/**
 * Shared view of /login and /register (separate routes): the photograph with the page title on the
 * left, the tabs, heading, form and the three perks on the right. The safe `next` is carried across.
 */
export function AuthLayout({ mode, next, title, heading, sub, children }: {
  mode: "login" | "register";
  next?: string;
  title: ReactNode;
  heading: ReactNode;
  sub: string;
  children: ReactNode;
}) {
  const suffix = next === undefined ? "" : `?next=${encodeURIComponent(next)}`;
  return (
    <div className="auth">
      <div className="auth-ph">
        <Image alt="" fill priority sizes="(max-width: 1000px) 100vw, 58vw" src={webImageSrc("/images/recipes/sarmi-s-kiselo-zele.png")} />
        <div className="auth-cap">
          <p className="eyebrow">Твоят профил</p>
          <h1 data-split>{title}</h1>
          <StitchBand />
        </div>
      </div>
      <div className="auth-side">
        <div className="auth-box">
          <nav aria-label="Вход или регистрация" className="atabs">
            <Link aria-current={mode === "login" ? "page" : undefined} className="atab" href={`/login${suffix}`}>Вход</Link>
            <Link aria-current={mode === "register" ? "page" : undefined} className="atab" href={`/register${suffix}`}>Регистрация</Link>
          </nav>
          <h2>{heading}</h2>
          <p className="sub">{sub}</p>
          {children}
          <ul aria-label="Какво получаваш с профил" className="perks">
            {PERKS.map((perk, index) => (
              <li className="rv" key={perk.title} style={{ "--d": `${index * 80}ms` } as CSSProperties}>
                <span className="pst"><StitchStar /></span>
                <b>{perk.title}</b>
                <span className="t">{perk.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
