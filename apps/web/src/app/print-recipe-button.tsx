"use client";

type PrintRecipeButtonProps = {
  className?: string;
};

export function PrintRecipeButton({ className = "" }: PrintRecipeButtonProps) {
  return (
    <button className={className} onClick={() => window.print()} type="button">
      <span>Принтирай рецепта</span>
      <span aria-hidden="true" className="text-brand-700">
        ↗
      </span>
    </button>
  );
}
