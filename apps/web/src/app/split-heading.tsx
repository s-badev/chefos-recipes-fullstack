import type { CSSProperties } from "react";

export function SplitWords({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(/\s+/).map((word, i) => <span key={`${word}-${i}`}>
    {i > 0 ? " " : null}<span className="w"><span className="wi" style={{ "--i": Math.min(start + i, 7) } as CSSProperties}>{word}</span></span>
  </span>);
}

export function EditorialTitle({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop()!;
  return <><SplitWords text={words.join(" ")} />{words.length ? " " : null}<em><SplitWords text={last} start={words.length} /></em></>;
}
