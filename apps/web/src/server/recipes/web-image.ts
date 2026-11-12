import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { curatedNumberLabel, hasRecipePhoto } from "../../lib/recipe-detail";
import { transliterateRecipeName } from "../../lib/transliteration";

type PhotoRecipe = { slug: string; title: string; imageSrc?: string; imageAlt?: string };
type FileExists = (basename: string) => Promise<boolean>;

async function masterExists(basename: string): Promise<boolean> {
  try {
    return (await stat(path.join(process.cwd(), "public/images/recipes-web", `${basename}.webp`))).isFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "ENOTDIR") return false;
    throw error;
  }
}

/** Cache only filesystem existence, never recipe/user data. Assets are immutable per build.
 * The injected filesystem probe also lets repository-mock tests run with no database writes.
 */
export function createWebRecipeImageResolver(exists: FileExists = masterExists) {
  const cache = new Map<string, Promise<boolean>>();
  return async function withWebRecipeImage<T extends PhotoRecipe>(recipe: T): Promise<T> {
    if (curatedNumberLabel(recipe.slug) || hasRecipePhoto(recipe)) return recipe;
    // Reject separators, controls, spaces and URL escapes before any filesystem operation.
    if (!/^[a-z0-9а-яѝ-]+$/iu.test(recipe.slug)) return recipe;
    const basename = transliterateRecipeName(recipe.slug);
    if (!/^[a-z0-9-]+$/.test(basename)) return recipe;
    let pending = cache.get(basename);
    if (!pending) {
      if (cache.size >= 256) cache.delete(cache.keys().next().value!);
      pending = exists(basename).catch(error => { cache.delete(basename); throw error; });
      cache.set(basename, pending);
    }
    if (!await pending) return recipe;
    return { ...recipe, imageSrc: `/images/recipes-web/${basename}.webp`, imageAlt: `Снимка на ${recipe.title}` };
  };
}

export const withWebRecipeImage = createWebRecipeImageResolver();
