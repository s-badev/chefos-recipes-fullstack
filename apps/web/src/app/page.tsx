const highlights = [
  {
    title: "Weekly picks",
    description: "Curated recipes updated every week."
  },
  {
    title: "Save favorites",
    description: "Keep the recipes you love in one place."
  },
  {
    title: "Cook with confidence",
    description: "Step-by-step instructions and difficulty tags."
  }
];

export default function HomePage() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          Planning mode · web shell only
        </div>
        <h2 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
          Discover recipes that fit your taste, time, and mood.
        </h2>
        <p className="text-base text-slate-600 md:text-lg">
          Chefo’s Recipes is a clean, curated catalog that helps you pick your next meal faster. The
          full experience—accounts, favorites, and admin tools—will arrive in the next milestone.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
            Browse recipes
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300">
            View roadmap
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
        <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50 p-6 text-sm text-brand-700">
          Next up: API routes + database integration once the backend plan is finalized.
        </div>
      </div>
    </section>
  );
}
