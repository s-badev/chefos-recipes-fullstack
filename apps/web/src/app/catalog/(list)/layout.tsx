import type { ReactNode } from "react";

/** The catalog brings its own Sofra wraps (heading, sticky filter bar, grid), and so does its loading state. */
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
