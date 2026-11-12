import type { Metadata } from "next";
import Link from "next/link";
import { SplitWords } from "./split-heading";
import { StatusSofra } from "./status-sofra";

export const metadata: Metadata = {
  title: "Страницата не е намерена | Chefo's Recipes",
  robots: { index: false }
};

export default function NotFound() {
  return (
    <StatusSofra
      actions={<>
        <Link className="btn fill" href="/">Към началото <span aria-hidden="true" className="ar">→</span></Link>
        <Link className="btn out" href="/catalog">Всички рецепти</Link>
      </>}
      eyebrow="Грешка 404"
      text="Адресът може да е грешен или рецептата вече да не е в каталога."
      title={<><SplitWords text="Тази страница не е" /> <em><SplitWords start={4} text="на масата" /></em></>}
    />
  );
}
