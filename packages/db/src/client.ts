import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema.js";

const missingDatabaseUrlMessage =
  "DATABASE_URL is required to create the Chefo's Recipes database client.";

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(missingDatabaseUrlMessage);
  }

  return databaseUrl;
}

export function createDbClient(databaseUrl = getDatabaseUrl()) {
  // The real Neon PostgreSQL connection will be enabled later by API routes.
  // This factory only prepares the typed Drizzle client when explicitly called.
  return drizzle(databaseUrl, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;

let dbClient: DbClient | undefined;

export function getDb() {
  dbClient ??= createDbClient();

  return dbClient;
}
