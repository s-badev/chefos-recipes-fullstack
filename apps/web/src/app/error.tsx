"use client";

import { useEffect } from "react";
import { PageShell } from "./page-shell";
import { StatusView } from "./status-view";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] Unhandled error", error.digest ?? error.message);
  }, [error]);

  return (
    <PageShell>
      <StatusView
        eyebrow="Нещо се обърка"
        title="Страницата не успя да се зареди"
        text="Възникна временен проблем. Опитай пак след малко или се върни в началото."
        primary={<button className="btn solid" type="button" onClick={reset}>Опитай пак</button>}
      />
    </PageShell>
  );
}
