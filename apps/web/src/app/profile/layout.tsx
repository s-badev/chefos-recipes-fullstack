import type { ReactNode } from "react";
import { PageShell } from "../page-shell";

export default function Layout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
