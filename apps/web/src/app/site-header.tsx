import { logoutAction } from "../server/auth/actions";
import { getCurrentUser } from "../server/auth/session";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  return <SiteHeaderClient currentUser={currentUser} logoutAction={logoutAction} />;
}
