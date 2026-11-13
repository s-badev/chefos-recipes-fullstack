"use client";

import { useId, useRef } from "react";
import { deleteRecipeAction } from "../../server/recipes/admin-actions";

type DeleteRecipeDialogProps = {
  slug: string;
  title: string;
};

export function DeleteRecipeDialog({ slug, title }: DeleteRecipeDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  function closeDialog() {
    dialog.current?.close();
  }

  return (
    <>
      <button
        className="admin-action danger"
        onClick={() => dialog.current?.showModal()}
        ref={trigger}
        type="button"
      >
        Изтрий
      </button>
      <dialog
        aria-labelledby={headingId}
        className="admin-dialog"
        onClose={() => trigger.current?.focus()}
        ref={dialog}
      >
        <div className="admin-dialog-inner">
          <p className="eyebrow">Потвърждение</p>
          <h2 id={headingId}>Да изтрием ли рецептата?</h2>
          <p>„{title}“ ще бъде премахната от каталога. Това действие не може да бъде отменено.</p>
          <div className="admin-dialog-actions">
            <button autoFocus className="btn" onClick={closeDialog} type="button">Отказ</button>
            <form action={deleteRecipeAction}>
              <input name="slug" type="hidden" value={slug} />
              <button className="btn fill" type="submit">Изтрий рецептата</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
