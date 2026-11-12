"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SplitWords } from "../split-heading";
import { StatusSofra } from "../status-sofra";

export default function CatalogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[catalog] Unhandled error", error.digest ?? error.message);
  }, [error]);

  return (
    <StatusSofra
      actions={<>
        <button className="btn fill" type="button" onClick={reset}>Опитай пак <span aria-hidden="true" className="ar">→</span></button>
        <Link className="btn out" href="/">Към началото</Link>
      </>}
      eyebrow="Каталог"
      text="Възникна временен проблем при зареждането на рецептите. Опитай пак или се върни в началото."
      title={<><SplitWords text="Каталогът не успя" /> <em><SplitWords start={3} text="да се зареди" /></em></>}
    />
  );
}
