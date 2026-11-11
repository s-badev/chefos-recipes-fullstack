import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="wrap page-shell-frame">{children}</div>;
}
