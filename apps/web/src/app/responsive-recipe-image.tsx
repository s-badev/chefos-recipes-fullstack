import Image, { type ImageProps } from "next/image";
import { preload } from "react-dom";
import { responsiveImage, type ImageUse } from "../lib/responsive-images";

/** Native picture selection with exact descriptor widths. The existing fill/object-fit CSS applies. */
export function ResponsiveRecipeImage({ use = "card", ...props }: ImageProps & { use?: ImageUse }) {
  const variants = typeof props.src === "string" ? responsiveImage(props.src, use) : null;
  if (!variants) return <Image {...props} alt={props.alt} />;
  if (props.priority) preload(variants.preload, { as: "image", type: "image/avif", imageSrcSet: variants.avif, imageSizes: props.sizes, fetchPriority: "high" });
  return <picture>
    <source sizes={props.sizes} srcSet={variants.avif} type="image/avif" />
    <source sizes={props.sizes} srcSet={variants.webp} type="image/webp" />
    <Image {...props} alt={props.alt} fetchPriority={props.priority ? "high" : props.fetchPriority} loading={props.priority ? "eager" : props.loading ?? "lazy"} priority={false} src={variants.fallback} unoptimized />
  </picture>;
}
