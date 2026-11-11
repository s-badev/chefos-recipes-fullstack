export default function CatalogLoading() {
  return (
    <div className="catalog-skeleton" role="status" aria-live="polite">
      <span className="sr-only">Зареждане на рецептите…</span>
      <div className="sk sk-eyebrow" aria-hidden="true" />
      <div className="sk sk-title" aria-hidden="true" />
      <div className="sk sk-line" aria-hidden="true" />
      <div className="catalog-skeleton-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="catalog-skeleton-card" key={index}>
            <div className="sk sk-photo" />
            <div className="sk sk-card-title" />
            <div className="sk sk-card-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
