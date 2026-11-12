import type { ReactNode } from "react";

/** The list wraps itself in PageShell ((list)/layout.tsx); the recipe page needs a full-width hero. */
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
