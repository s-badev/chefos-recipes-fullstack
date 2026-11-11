import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "./page-shell";
import { StatusView } from "./status-view";

export const metadata: Metadata = {
  title: "Страницата не е намерена | Chefo's Recipes",
  robots: { index: false }
};

export default function NotFound() {
  return (
    <PageShell>
      <StatusView
        eyebrow="Грешка 404"
        title="Тази страница не е намерена"
        text="Адресът може да е сгрешен или рецептата вече не е публична. Разгледай каталога или се върни в началото."
        primary={<Link className="btn solid" href="/catalog">Към каталога</Link>}
      />
    </PageShell>
  );
}
