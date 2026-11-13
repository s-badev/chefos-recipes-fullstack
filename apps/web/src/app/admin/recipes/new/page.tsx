import type { Metadata } from "next";
import { pageMetadata } from "../../../../lib/site-metadata";
import { requireAdmin } from "../../../../server/auth/session";
import { createRecipeFormAction } from "../../../../server/recipes/admin-actions";
import { EditorialTitle } from "../../../split-heading";
import { RecipeForm } from "../recipe-form";

export const metadata: Metadata = pageMetadata(
  "Нова рецепта",
  "Форма за добавяне на рецепта.",
  "/admin/recipes/new",
  { noindex: true }
);

export default async function NewRecipePage() {
  await requireAdmin("/admin/recipes/new");

  return (
    <section className="admin-form-view wrap">
      <header className="admin-form-head">
        <div>
          <p className="eyebrow">Админ действие</p>
          <h1><EditorialTitle text="Добави рецепта" /></h1>
        </div>
        <p className="lead">
          Попълни основната информация. След запис рецептата ще се появи в публичния каталог.
        </p>
      </header>

      <RecipeForm action={createRecipeFormAction} mode="create" />
      <p className="admin-form-note">
        При липса на собствена снимка рецептата използва стандартното оформление на каталога.
      </p>
    </section>
  );
}
