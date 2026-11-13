/** The card pattern of the catalog grid (recipe-catalog.tsx), so the placeholders sit where the cards land. */
const PATTERN = ["wide", "half", "half", "half", "half", "wide"];
/** Tab widths close to the real category names, so the bar does not jump when they arrive. */
const TABS = ["5.2rem", "4.4rem", "3.6rem", "4.8rem", "4.8rem", "6.8rem", "4.6rem"];

/**
 * Catalog loading: the real heading and search line, then the filter bar and the grid as calm placeholders with
 * the geometry of the real cards (no jump when they arrive). It fades in only after a short wait, so a fast
 * navigation never flashes it.
 */
export default function CatalogLoading() {
  return (
    <div className="cat-loading" role="status" aria-live="polite">
      <span className="sr-only">Зареждане на рецептите…</span>
      <div aria-hidden="true">
        <div className="wrap cat-head">
          <p className="eyebrow"><span className="sk sk-text" style={{ width: "11.5rem" }} /></p>
          {/* Plain words (no split reveal): the real title is there at once, not waiting under its mask. */}
          <p className="cat-h1">Всички <em>рецепти</em></p>
          <div className="search sk-search">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <span>Търси рецепта, продукт или категория</span>
          </div>
        </div>
        <div className="fbar">
          <div className="wrap">
            <div className="tabs">{TABS.map((width, index) => <span className="tab" key={index}><span className="sk sk-text" style={{ width }} /></span>)}</div>
            <div className="fbar-end"><span className="count"><span className="sk sk-text" style={{ width: "5.5rem" }} /></span></div>
          </div>
        </div>
        <div className="wrap cat-grid">
          <div className="cards cat">
            {PATTERN.map((variant, index) => (
              <div className={`card ${variant}`} key={index}>
                <span className="ci sk" />
                <span className="cb">
                  <span className="ce"><span className="sk sk-text" style={{ width: "4.5rem" }} /></span>
                  <span className="ct"><span className="sk sk-text" style={{ width: index % 2 ? "9rem" : "13rem" }} /></span>
                  <span className="cm"><span className="sk sk-text" style={{ width: "11rem" }} /></span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
