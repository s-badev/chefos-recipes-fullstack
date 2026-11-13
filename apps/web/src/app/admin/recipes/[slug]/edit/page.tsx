import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "../../../../../lib/site-metadata";
import { requireAdmin } from "../../../../../server/auth/session";
import { updateRecipeFormAction } from "../../../../../server/recipes/admin-actions";
import { getRecipeBySlug } from "../../../../../server/recipes/service";
import { EditorialTitle } from "../../../../split-heading";
import { RecipeForm } from "../../recipe-form";

type EditRecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: EditRecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(
    "Редакция на рецепта",
    "Редактирай съдържанието на рецепта в Chefo's Recipes.",
    `/admin/recipes/${encodeURIComponent(slug)}/edit`,
    { noindex: true }
  );
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;
  await requireAdmin(`/admin/recipes/${slug}/edit`);
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return (
      <section className="admin-form-view wrap">
        <div className="admin-error-state">
          <p className="eyebrow">Админ редакция</p>
          <h1>Рецептата не е намерена</h1>
          <p>Няма рецепта с този адрес. Върни се към панела и избери рецепта от списъка.</p>
          <Link className="btn fill" href="/admin">Обратно към админ панела</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-form-view wrap">
      <header className="admin-form-head">
        <div>
          <p className="eyebrow">Админ редакция</p>
          <h1><EditorialTitle text="Редактирай рецепта" /></h1>
        </div>
        <p className="lead">Прегледай информацията за „{recipe.title}“ и запази само нужните промени.</p>
      </header>

      <RecipeForm
        action={updateRecipeFormAction}
        mode="edit"
        values={{
          slug: recipe.slug,
          title: recipe.title,
          category: recipe.category,
          description: recipe.description,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          servings: recipe.servings
        }}
      />
      <p className="admin-form-note">Адресът на рецептата остава същият, за да не се прекъсват запазени връзки към нея.</p>
    </section>
  );
}
