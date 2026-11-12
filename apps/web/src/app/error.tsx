"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SplitWords } from "./split-heading";
import { StatusSofra } from "./status-sofra";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] Unhandled error", error.digest ?? error.message);
  }, [error]);

  return (
    <StatusSofra
      actions={<>
        <button className="btn fill" type="button" onClick={reset}>Опитай пак <span aria-hidden="true" className="ar">→</span></button>
        <Link className="btn out" href="/">Към началото</Link>
      </>}
      eyebrow="Нещо се обърка"
      text="Възникна временен проблем. Опитай пак след малко или се върни в началото."
      title={<><SplitWords text="Страницата не успя" /> <em><SplitWords start={3} text="да се зареди" /></em></>}
    />
  );
}
