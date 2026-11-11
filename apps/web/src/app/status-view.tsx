import Link from "next/link";
import type { ReactNode } from "react";

type StatusViewProps = {
  eyebrow: string;
  title: string;
  text: string;
  primary?: ReactNode;
  secondaryHref?: string;
  secondaryLabel?: string;
};

/** Shared layout for 404, error and empty states in the museum palette. */
export function StatusView({ eyebrow, title, text, primary, secondaryHref = "/", secondaryLabel = "Към началото" }: StatusViewProps) {
  return (
    <section className="status-view" aria-labelledby="status-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="status-title" id="status-title">{title}</h1>
      <p className="status-text">{text}</p>
      <div className="status-actions">
        {primary}
        <Link className="btn" href={secondaryHref}>{secondaryLabel}</Link>
      </div>
    </section>
  );
}
