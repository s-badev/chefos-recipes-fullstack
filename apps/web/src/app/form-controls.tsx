"use client";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Submit button with a pending state: disabled, aria-busy and its own pending label. */
export function SubmitButton({ className, children, pendingLabel = "Изчакай…" }: { className?: string; children: ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending} aria-busy={pending}>{pending ? pendingLabel : children}</button>;
}

function validationText(input: HTMLInputElement) {
  return input.validity.valueMissing ? "Попълни това поле." : input.validity.typeMismatch ? "Въведи валиден имейл адрес." : "Паролата трябва да е поне 8 символа.";
}

/** Native validation with Bulgarian messages (the browser bubble). Kept for forms that are not redesigned yet. */
export function ValidatedInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} onInput={event => event.currentTarget.setCustomValidity("")} onInvalid={event => {
    event.currentTarget.setCustomValidity(validationText(event.currentTarget));
  }}/>;
}

/**
 * A Sofra form field: eyebrow label, a line under the input (red 2px on focus) and the Bulgarian
 * validation message under the field in red, tied to the input with aria-describedby. The browser
 * bubble is suppressed; validationMessage still carries the same text.
 */
export function AuthField({ label, ...input }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [error, setError] = useState("");
  const id = useId();
  const errorId = `${id}-error`;
  // The message sits outside the <label>, so the field's name stays just the label ("Имейл").
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <input
        {...input}
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        onInput={event => { event.currentTarget.setCustomValidity(""); if (error) setError(""); }}
        onInvalid={event => {
          const field = event.currentTarget;
          event.preventDefault();
          const message = validationText(field);
          field.setCustomValidity(message);
          setError(message);
          // The first invalid field of the form takes the focus, as the browser would do.
          if (field.form?.querySelector(":invalid") === field) field.focus();
        }}
      />
      {error ? <span className="fld-err" id={errorId}>{error}</span> : null}
    </div>
  );
}
