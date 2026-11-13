import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { webImageSrc } from "../lib/images";
import { SofraBoard } from "./sofra-board";
import { StitchStar } from "./stitch";

/** The covers of the six categories, in the table's order (as in the approved mock). */
const COVERS = ["shopska-salata", "tarator", "kavarma-sas-svinsko", "banitsa-sas-sirene", "mish-mash", "tikvenik"];
/** The place that stays empty: one plate is missing from the table. */
const MISSING = 3;

/**
 * 404 and error pages: the message and its actions on the left, a table with five plates and one
 * empty place on the right. The table is decoration only (aria-hidden); the text says what happened.
 */
export function StatusSofra({ eyebrow, title, text, actions }: { eyebrow: string; title: ReactNode; text: string; actions: ReactNode }) {
  return (
    <div className="wrap nf">
      <div className="nf-tx">
        <p className="eyebrow rv">{eyebrow}</p>
        <h1 data-split>{title}</h1>
        <p className="t rv">{text}</p>
        <div className="nf-cta rv">{actions}</div>
      </div>
      <div aria-hidden="true" className="nf-table">
        <SofraBoard center={<StitchStar />} style={{ "--sel": 0, "--step": "60deg" } as CSSProperties}>
          <div className="spin">
            {COVERS.map((slug, index) => (
              <span className={index === MISSING ? "plate gap" : "plate"} key={slug} style={{ "--i": index } as CSSProperties}>
                <span className="pi">
                  {index === MISSING ? <StitchStar /> : <Image alt="" fill sizes="140px" src={webImageSrc(`/images/recipes/${slug}.png`)} />}
                </span>
              </span>
            ))}
          </div>
        </SofraBoard>
      </div>
    </div>
  );
}
