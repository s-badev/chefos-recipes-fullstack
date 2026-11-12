import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "../../server/auth/session";
import { SplitWords } from "../split-heading";
import { StitchStar } from "../stitch";

export const metadata: Metadata = {
  title: "Профил | Chefo's Recipes",
  description: "Потребителски профил в Chefo's Recipes."
};

const summary = [
  { label: "Запазени рецепти", value: "В любими" },
  { label: "Последна активност", value: "Няма запис" },
  { label: "Статус", value: "Активен профил" }
];

export default async function ProfilePage() {
  const user = await requireUser();
  const profileName = user.name.trim();

  return (
    <div className="prof-body">
      <div className="wrap pg-head">
        <p className="eyebrow rv">Потребителски профил</p>
        <h1 data-split><SplitWords text="Моят" /> <em><SplitWords start={1} text="профил" /></em></h1>
        <p className="lead rv">
          {profileName ? (
            <>
              Здравей, <strong>{profileName}</strong>. Тук ще се събират твоите запазени рецепти, любими идеи и
              кратко обобщение на профила.
            </>
          ) : (
            "Тук ще се събират твоите запазени рецепти, любими идеи и кратко обобщение на профила."
          )}
        </p>
      </div>

      <div className="wrap">
        <dl className="meta m3 rv">
          {summary.map(item => (
            <div key={item.label}><dt>{item.label}</dt><dd className="word">{item.value}</dd></div>
          ))}
        </dl>
        <div className="prof-cols">
          <section aria-labelledby="profile-favorites" className="rv">
            <span aria-hidden="true" className="st-i"><StitchStar /></span>
            <h2 id="profile-favorites">Обобщение на любимите</h2>
            <p>Тук ще виждаш запазените рецепти и бързи връзки към тях, когато започнеш да добавяш любими идеи.</p>
            <Link className="btn fill" href="/favorites">Виж любимите <span aria-hidden="true" className="ar">→</span></Link>
          </section>
          <section aria-labelledby="profile-settings" className="rv" style={{ "--d": "100ms" } as CSSProperties}>
            <span aria-hidden="true" className="st-i"><StitchStar /></span>
            <h2 id="profile-settings">Лични настройки</h2>
            <p>Профилът ще събира предпочитания, любими рецепти и удобни преки пътища за по-бързо готвене.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
