import { logoutAction } from "../server/auth/actions";
import { getCurrentUser } from "../server/auth/session";
import { SiteHeaderClient } from "./site-header-client";
import { getCurrentUserFavoriteSlugs } from "../server/favorites/service";

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  const favoriteCount = currentUser ? (await getCurrentUserFavoriteSlugs()).length : 0;
  return <SiteHeaderClient currentUser={currentUser} logoutAction={logoutAction} favoriteCount={favoriteCount} />;
}
