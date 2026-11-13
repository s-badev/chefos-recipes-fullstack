import { logoutAction } from "../server/auth/actions";
import { SiteHeaderClient } from "./site-header-client";
import { getCurrentUserFavoriteSlugs } from "../server/favorites/service";
import { getSessionUser } from "./session-user";

export async function SiteHeader() {
  const currentUser = await getSessionUser();

  const favoriteCount = currentUser ? (await getCurrentUserFavoriteSlugs()).length : 0;
  return <SiteHeaderClient currentUser={currentUser} logoutAction={logoutAction} favoriteCount={favoriteCount} />;
}
