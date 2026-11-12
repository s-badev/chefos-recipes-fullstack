import type { ReactNode } from "react";

/** Sofra pages bring their own wraps (a full-bleed hero or a page heading), so there is no PageShell here. */
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
