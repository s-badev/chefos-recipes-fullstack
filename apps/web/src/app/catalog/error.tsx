"use client";

import { useEffect } from "react";
import { PageShell } from "../page-shell";
import { StatusView } from "../status-view";

export default function CatalogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[catalog] Unhandled error", error.digest ?? error.message);
  }, [error]);

  return (
    <PageShell>
      <StatusView
        eyebrow="Каталог"
        title="Каталогът не успя да се зареди"
        text="Възникна временен проблем при зареждането на рецептите. Опитай пак или се върни в началото."
        primary={<button className="btn solid" type="button" onClick={reset}>Опитай пак</button>}
      />
    </PageShell>
  );
}
