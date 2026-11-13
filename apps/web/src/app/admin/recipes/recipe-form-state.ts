export type RecipeFieldName = "title" | "category" | "description";

export type RecipeFormState = {
  fieldErrors?: Partial<Record<RecipeFieldName, string>>;
  formError?: string;
};

export const initialRecipeFormState: RecipeFormState = {};
