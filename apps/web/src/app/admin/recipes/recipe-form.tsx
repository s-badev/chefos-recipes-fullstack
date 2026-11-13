"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { FormEvent } from "react";
import type { RecipeFormState } from "./recipe-form-state";
import { initialRecipeFormState } from "./recipe-form-state";

type RecipeFormAction = (
  previousState: RecipeFormState,
  formData: FormData
) => Promise<RecipeFormState>;

export type RecipeFormValues = {
  slug?: string;
  title?: string;
  category?: string;
  description?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
};

type RecipeFormProps = {
  action: RecipeFormAction;
  mode: "create" | "edit";
  values?: RecipeFormValues;
};

const requiredMessages = {
  title: "Въведи заглавие на рецептата.",
  category: "Въведи категория.",
  description: "Добави кратко описание."
} as const;

export function RecipeForm({ action, mode, values = {} }: RecipeFormProps) {
  const [state, formAction, pending] = useActionState(action, initialRecipeFormState);
  const [clientErrors, setClientErrors] = useState<RecipeFormState["fieldErrors"]>({});
  const errors = { ...state.fieldErrors, ...clientErrors };

  function validate(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const nextErrors: RecipeFormState["fieldErrors"] = {};

    for (const name of Object.keys(requiredMessages) as Array<keyof typeof requiredMessages>) {
      if (!String(formData.get(name) ?? "").trim()) nextErrors[name] = requiredMessages[name];
    }

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setClientErrors(nextErrors);
      const firstName = Object.keys(nextErrors)[0];
      const form = event.currentTarget;
      window.requestAnimationFrame(() => {
        const firstInvalid = form.elements.namedItem(firstName);
        if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      });
    }
  }

  function clearError(name: keyof typeof requiredMessages) {
    if (!errors[name]) return;
    setClientErrors((current) => ({ ...current, [name]: undefined }));
  }

  return (
    <form action={formAction} className="admin-form" noValidate onSubmit={validate}>
      {values.slug ? <input name="slug" type="hidden" value={values.slug} /> : null}
      {state.formError ? <p className="admin-form-error" role="alert">{state.formError}</p> : null}

      <div className="admin-field">
        <label htmlFor={`${mode}-title`}>Заглавие</label>
        <input
          aria-describedby={errors.title ? `${mode}-title-error` : undefined}
          aria-invalid={errors.title ? true : undefined}
          defaultValue={values.title}
          id={`${mode}-title`}
          name="title"
          onInput={() => clearError("title")}
          placeholder="Например: Домашна мусака"
          type="text"
        />
        {errors.title ? <span className="admin-field-error" id={`${mode}-title-error`}>{errors.title}</span> : null}
      </div>

      <div className="admin-field">
        <label htmlFor={`${mode}-category`}>Категория</label>
        <input
          aria-describedby={errors.category ? `${mode}-category-error` : undefined}
          aria-invalid={errors.category ? true : undefined}
          defaultValue={values.category}
          id={`${mode}-category`}
          name="category"
          onInput={() => clearError("category")}
          placeholder="Основни"
          type="text"
        />
        {errors.category ? <span className="admin-field-error" id={`${mode}-category-error`}>{errors.category}</span> : null}
      </div>

      <div className="admin-field wide">
        <label htmlFor={`${mode}-description`}>Описание</label>
        <textarea
          aria-describedby={errors.description ? `${mode}-description-error` : undefined}
          aria-invalid={errors.description ? true : undefined}
          defaultValue={values.description}
          id={`${mode}-description`}
          name="description"
          onInput={() => clearError("description")}
          placeholder="Кратко описание на рецептата"
        />
        {errors.description ? <span className="admin-field-error" id={`${mode}-description-error`}>{errors.description}</span> : null}
      </div>

      <div className="admin-field">
        <label htmlFor={`${mode}-prep-time`}>Подготовка · минути</label>
        <input defaultValue={values.prepTimeMinutes} id={`${mode}-prep-time`} inputMode="numeric" min="0" name="prepTime" placeholder="20" type="number" />
      </div>
      <div className="admin-field">
        <label htmlFor={`${mode}-cook-time`}>Готвене · минути</label>
        <input defaultValue={values.cookTimeMinutes} id={`${mode}-cook-time`} inputMode="numeric" min="0" name="cookTime" placeholder="45" type="number" />
      </div>
      <div className="admin-field">
        <label htmlFor={`${mode}-servings`}>Порции</label>
        <input defaultValue={values.servings} id={`${mode}-servings`} inputMode="numeric" min="1" name="servings" placeholder="4" type="number" />
      </div>

      <div className="admin-form-actions">
        <button className="btn fill" disabled={pending} type="submit">
          {pending ? "Запазване…" : mode === "create" ? "Запази рецепта" : "Запази промените"}
        </button>
        <Link className="btn" href="/admin">Отказ</Link>
      </div>
    </form>
  );
}
