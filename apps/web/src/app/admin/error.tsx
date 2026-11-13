"use client";

import Link from "next/link";
import { StitchStar } from "../stitch";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="admin-form-view wrap">
      <div className="admin-error-state admin-route-error">
        <StitchStar className="admin-empty-star" />
        <div>
          <p className="eyebrow">Нещо се обърка</p>
          <h1>Админ панелът не успя да се зареди</h1>
          <p>Опитай отново. Ако проблемът остане, върни се към каталога.</p>
          <div className="admin-actions">
            <button className="btn fill" onClick={reset} type="button">Опитай пак</button>
            <Link className="btn" href="/catalog">Виж каталога</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
