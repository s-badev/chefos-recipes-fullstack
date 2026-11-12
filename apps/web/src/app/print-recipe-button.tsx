"use client";

type PrintRecipeButtonProps = {
  className?: string;
  label?: string;
  /** Decorative trailing glyph; pass null for none. */
  icon?: string | null;
};

export function PrintRecipeButton({ className = "", label = "Принтирай рецепта", icon = "↗" }: PrintRecipeButtonProps) {
  return (
    <button className={className} onClick={() => window.print()} type="button">
      <span>{label}</span>
      {icon ? (
        <span aria-hidden="true" className="text-brand-700">
          {icon}
        </span>
      ) : null}
    </button>
  );
}
