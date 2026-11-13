import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "../../lib/site-metadata";
import { requireAdmin } from "../../server/auth/session";
import {
  getAdminRecipeSummary,
  listPublicCatalogRecipes,
  listRecipes
} from "../../server/recipes/service";
import { EditorialTitle } from "../split-heading";
import { StitchStar } from "../stitch";
import { DeleteRecipeDialog } from "./delete-recipe-dialog";

export const metadata: Metadata = pageMetadata(
  "Админ панел",
  "Зона за управление на рецепти в Chefo's Recipes.",
  "/admin",
  { noindex: true }
);

const ADMIN_RECIPE_PAGE_SIZE = 50;

type AdminPageProps = {
  searchParams?: Promise<{
    page?: string;
    view?: string;
  }>;
};

function positivePage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function adminHref(page: number, publicOnly: boolean) {
  const params = new URLSearchParams();
  if (publicOnly) params.set("view", "public");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

const numberFormatter = new Intl.NumberFormat("bg-BG");

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const publicOnly = params?.view === "public";
  const requestedPage = positivePage(params?.page);
  const [initialRecipePage, summary] = await Promise.all([
    publicOnly
      ? listPublicCatalogRecipes({ page: requestedPage, pageSize: ADMIN_RECIPE_PAGE_SIZE })
      : listRecipes({ page: requestedPage, pageSize: ADMIN_RECIPE_PAGE_SIZE }),
    getAdminRecipeSummary()
  ]);
  const currentPage = Math.min(requestedPage, initialRecipePage.totalPages);
  const recipePage = currentPage === requestedPage
    ? initialRecipePage
    : publicOnly
      ? await listPublicCatalogRecipes({ page: currentPage, pageSize: ADMIN_RECIPE_PAGE_SIZE })
      : await listRecipes({ page: currentPage, pageSize: ADMIN_RECIPE_PAGE_SIZE });
  const stats = [
    { label: "Общо рецепти", value: summary.totalRecipes },
    { label: "Категории", value: summary.totalCategories },
    { label: "Тагове", value: summary.totalTags }
  ];
  const shownFrom = recipePage.total === 0 ? 0 : (recipePage.page - 1) * recipePage.pageSize + 1;
  const shownTo = Math.min(recipePage.page * recipePage.pageSize, recipePage.total);
  const shownLabel = recipePage.total === 0
    ? "Няма рецепти за показване"
    : `Показани ${shownFrom}–${shownTo} от ${numberFormatter.format(recipePage.total)} рецепти`;

  return (
    <section className="admin-view wrap">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Админ панел</p>
          <h1><EditorialTitle text="Управлявай рецептите" /></h1>
        </div>
        <div>
          <p className="admin-intro">
            Преглеждай каталога, редактирай съдържанието и добавяй нови домашни рецепти.
          </p>
          <div className="admin-actions">
            <Link className="btn fill" href="/admin/recipes/new">
              Добави рецепта <span aria-hidden="true" className="ar">→</span>
            </Link>
            <Link className="btn" href="/catalog">Виж каталога</Link>
          </div>
        </div>
      </header>

      <dl aria-label="Обобщение" className="admin-stats">
        {stats.map((stat) => (
          <div className="admin-stat" key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{numberFormatter.format(stat.value)}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="admin-list-title" className="admin-manage">
        <div className="admin-manage-top">
          <div>
            <p className="eyebrow">Рецепти</p>
            <h2 id="admin-list-title">Списък за управление</h2>
          </div>
          <nav aria-label="Изглед на рецептите" className="admin-tabs">
            <Link aria-current={!publicOnly ? "page" : undefined} className="admin-tab" href={adminHref(1, false)}>
              Всички
            </Link>
            <Link aria-current={publicOnly ? "page" : undefined} className="admin-tab" href={adminHref(1, true)}>
              Публични
            </Link>
          </nav>
        </div>

        <div className="admin-count">
          <span>{shownLabel}</span>
          <span>Страница {recipePage.page} от {recipePage.totalPages}</span>
        </div>

        {recipePage.items.length > 0 ? (
          <div className="admin-list">
            {recipePage.items.map((recipe) => (
            <article className="admin-row" key={recipe.slug}>
              <div>
                <h3>{recipe.title}</h3>
                <p className="admin-description">{recipe.description}</p>
              </div>
              <div>
                <span className="admin-label">Категория</span>
                <span className="admin-value">{recipe.category}</span>
              </div>
              <div>
                <span className="admin-label">Трудност</span>
                <span className="admin-value">{recipe.difficulty}</span>
              </div>
              <div className="admin-row-actions">
                <Link className="admin-action" href={`/admin/recipes/${recipe.slug}/edit`}>Редактирай</Link>
                <DeleteRecipeDialog slug={recipe.slug} title={recipe.title} />
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <StitchStar className="admin-empty-star" />
            <div>
              <h2>Няма рецепти в този изглед</h2>
              <p>Смени изгледа или добави първата рецепта, която да се показва тук.</p>
            </div>
            <Link className="btn fill" href="/admin/recipes/new">Добави рецепта</Link>
          </div>
        )}

        <div className="admin-pages">
          <span>{shownLabel}</span>
          <nav aria-label="Странициране">
            {recipePage.page > 1 ? (
              <Link className="btn" href={adminHref(recipePage.page - 1, publicOnly)}>Назад</Link>
            ) : (
              <span aria-disabled="true" className="btn admin-page-disabled">Назад</span>
            )}
            {recipePage.page < recipePage.totalPages ? (
              <Link className="btn" href={adminHref(recipePage.page + 1, publicOnly)}>
                Напред <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span aria-disabled="true" className="btn admin-page-disabled">Напред →</span>
            )}
          </nav>
        </div>
      </section>
    </section>
  );
}
