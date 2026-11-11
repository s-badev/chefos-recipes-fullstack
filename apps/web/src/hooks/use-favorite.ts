"use client";
import { useActionState } from "react";
import { updateFavoriteAction } from "../server/favorites/actions";

export function useFavorite(saved: boolean) {
  const [state, action, pending] = useActionState(updateFavoriteAction, { saved, message: "" });
  return { ...state, action, pending };
}
