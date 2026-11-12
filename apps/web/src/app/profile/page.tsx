import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { recipeCountLabel, savedRecipesLabel } from "../../lib/format";
import { logoutAction } from "../../server/auth/actions";
import { requireUser } from "../../server/auth/session";
import { getCurrentUserFavoriteSlugs } from "../../server/favorites/service";
import { SplitWords } from "../split-heading";
import { StitchStar } from "../stitch";

export const metadata: Metadata = {
  title: "Профил | Chefo's Recipes",
  description: "Потребителски профил в Chefo's Recipes."
};

/** Only what the profile holds: the number of favourites and the e-mail (or name) from the session. */
export default async function ProfilePage() {
  const user = await requireUser();
  const saved = (await getCurrentUserFavoriteSlugs()).length;
  const profileName = user.name.trim();
  const account = user.email.trim() || profileName;
  const lead = saved ? "Ето какво е запазено в профила ти." : "Още няма запазени рецепти.";

  return (
    <div className="prof-body">
      <div className="wrap pg-head">
        <p className="eyebrow rv">Потребителски профил</p>
        <h1 data-split><SplitWords text="Моят" /> <em><SplitWords start={1} text="профил" /></em></h1>
        <p className="lead rv">{profileName ? <>Здравей, <strong>{profileName}</strong>. {lead}</> : lead}</p>
      </div>

      <div className="wrap">
        <dl className="meta m2 rv">
          <div><dt>Запазени рецепти</dt><dd className="word">{recipeCountLabel(saved)}</dd></div>
          {account ? <div><dt>Профил</dt><dd className="word mail">{account}</dd></div> : null}
        </dl>
        <div className="prof-cols">
          <section aria-labelledby="profile-favorites" className="rv">
            <span aria-hidden="true" className="st-i"><StitchStar /></span>
            <h2 id="profile-favorites">Любими</h2>
            {saved ? <>
              <p>Имаш {savedRecipesLabel(saved)}.</p>
              <Link className="btn fill" href="/favorites">Виж любимите <span aria-hidden="true" className="ar">→</span></Link>
            </> : <>
              <p>Запази рецепти със сърцето на картата и те ще се появят тук.</p>
              <Link className="btn fill" href="/catalog">Към рецептите <span aria-hidden="true" className="ar">→</span></Link>
            </>}
          </section>
          <section aria-labelledby="profile-account" className="rv" style={{ "--d": "100ms" } as CSSProperties}>
            <span aria-hidden="true" className="st-i"><StitchStar /></span>
            <h2 id="profile-account">Акаунт</h2>
            <p>Профилът е отворен на това устройство. На чужд компютър излез, когато приключиш.</p>
            <form action={logoutAction}><button className="btn out" type="submit">Изход</button></form>
          </section>
        </div>
      </div>
    </div>
  );
}
