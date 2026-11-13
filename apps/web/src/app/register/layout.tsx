import type { ReactNode } from "react";

/** The shared auth layout (photo + form) is full-bleed, so this route has no PageShell. */
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
