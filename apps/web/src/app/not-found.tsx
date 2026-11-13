import type { Metadata } from "next";
import { pageMetadata } from "../lib/site-metadata";
import Link from "next/link";
import { SplitWords } from "./split-heading";
import { StatusSofra } from "./status-sofra";

export const metadata: Metadata = pageMetadata("Страницата не е намерена", "Адресът може да е грешен или рецептата вече да не е в каталога.", "/404", { noindex: true });

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
