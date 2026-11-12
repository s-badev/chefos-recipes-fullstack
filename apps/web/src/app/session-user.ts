import "server-only";
import { cache } from "react";
import { getCurrentUser } from "../server/auth/session";

/** One session read per request, shared by the header and the footer (no second database lookup). */
export const getSessionUser = cache(getCurrentUser);
