import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { recipes } from "../src/data/recipes";
import { toCardRecipe } from "../src/lib/catalog";
const require = createRequire(import.meta.url);
const { createLoader } = require("../scripts/load-typescript.cjs");

test("typing between mount and the history effect is applied to results and URL", async () => {
  // Explicitly interleave effects and an input event. Real React may batch the edit into
  // the first ready render, before the mount/history marker has been consumed.
  const state: unknown[] = [], refs: Array<{ current: unknown }> = [];
  let stateIndex = 0, refIndex = 0;
  let effects: Array<() => void | (() => void)> = [];
  const react = {
    useState: (initial: unknown) => {
      const index = stateIndex++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value: unknown) => { state[index] = value; }];
    },
    useRef: (initial: unknown) => { const index = refIndex++; return refs[index] ??= { current: initial }; },
    useMemo: (compute: () => unknown) => compute(),
    useEffect: (effect: () => void | (() => void)) => { effects.push(effect); }
  };
  const load = createLoader({ react, "../lib/catalog-return": { rememberCatalogHref: () => undefined } });
  const catalogHook = load(fileURLToPath(new URL("../src/hooks/use-catalog.ts", import.meta.url))).useCatalog;
  const location = { href: "http://localhost/catalog", search: "" };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location,
    history: { pushState: (_state: unknown, _title: string, url: string) => {
      const next = new URL(url, location.href); location.href = next.href; location.search = next.search;
    } },
    addEventListener: () => undefined, removeEventListener: () => undefined
  } });
  let cleanup: void | (() => void);
  const input = { current: { value: "" } };
  function render() {
    stateIndex = 0; refIndex = 0; effects = [];
    return catalogHook(recipes.map(toCardRecipe), input);
  }
  try {
    render(); effects[0](); // URL read marks fromHistory=true, ready=true.
    const mounted = render();
    mounted.setSearchTerm("shopska"); input.current.value = "shopska";
    render(); cleanup = effects[1]();
    await new Promise(resolve => setTimeout(resolve, 350));
    expect(new URL(location.href).searchParams.get("q")).toBe("shopska");
    expect(render().filteredRecipes.map((recipe: { slug: string }) => recipe.slug)).toEqual(["shopska-salata"]);
  } finally {
    cleanup?.();
    if (descriptor) Object.defineProperty(globalThis, "window", descriptor); else Reflect.deleteProperty(globalThis, "window");
  }
});
