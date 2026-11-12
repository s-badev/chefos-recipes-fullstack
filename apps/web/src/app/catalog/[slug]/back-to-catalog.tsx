"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rememberedCatalogHref } from "../../../lib/catalog-return";

/** Returns to the catalog view the visitor last used in this tab (?q= and ?category= kept), else /catalog. */
export function BackToCatalog() {
  const [href, setHref] = useState("/catalog");
  useEffect(() => { setHref(rememberedCatalogHref()); }, []);
  return <Link className="btn" href={href}><span aria-hidden="true">←</span> Назад към каталога</Link>;
}
