import type { ReactNode } from "react";

/** The catalog brings its own Sofra wraps (heading, sticky filter bar, grid); the loading state uses PageShell. */
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
