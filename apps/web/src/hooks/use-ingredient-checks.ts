"use client";

import { useEffect, useState } from "react";

const storageKey = (slug: string) => `chefos:ingredients:${slug}`;

/** Stored as checked indexes, e.g. "0|3|5"; anything out of range or malformed is ignored. */
function parse(value: string | null, count: number): boolean[] {
  const checked = Array<boolean>(count).fill(false);
  for (const part of value?.split("|") ?? []) {
    const index = Number(part);
    if (part !== "" && Number.isInteger(index) && index >= 0 && index < count) checked[index] = true;
  }
  return checked;
}

function save(slug: string, checked: readonly boolean[]) {
  const value = checked.flatMap((on, index) => (on ? [String(index)] : [])).join("|");
  try {
    if (value) window.localStorage.setItem(storageKey(slug), value);
    else window.localStorage.removeItem(storageKey(slug));
  } catch {
    // localStorage can be blocked (private mode, disabled site data); the ticks then work but are not remembered.
  }
}

/** Ingredient ticks for one recipe, remembered per slug in localStorage when the browser allows it. */
export function useIngredientChecks(slug: string, count: number) {
  const [checked, setChecked] = useState<boolean[]>(() => Array<boolean>(count).fill(false));

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(storageKey(slug));
    } catch {
      // localStorage can be blocked (private mode, disabled site data); start with nothing ticked.
    }
    setChecked(parse(stored, count));
  }, [slug, count]);

  function update(next: boolean[]) {
    setChecked(next);
    save(slug, next);
  }

  return {
    checked,
    done: checked.filter(Boolean).length,
    toggle: (index: number, on: boolean) => update(checked.map((value, i) => (i === index ? on : value))),
    clear: () => update(Array<boolean>(count).fill(false))
  };
}
