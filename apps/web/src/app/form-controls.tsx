"use client";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ className, children }: { className?: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending} aria-busy={pending}>{pending ? "Изчакай…" : children}</button>;
}
export function ValidatedInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} onInput={event => event.currentTarget.setCustomValidity("")} onInvalid={event => {
    const input = event.currentTarget;
    input.setCustomValidity(input.validity.valueMissing ? "Попълни това поле." : input.validity.typeMismatch ? "Въведи валиден имейл адрес." : "Паролата трябва да е поне 8 символа.");
  }}/>;
}
