import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chefo's Recipes — български домашни рецепти",
    short_name: "Chefo's Recipes",
    lang: "bg",
    start_url: "/",
    display: "standalone",
    theme_color: "#170F0F",
    background_color: "#170F0F",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.jpg", sizes: "180x180", type: "image/jpeg" }
    ]
  };
}
