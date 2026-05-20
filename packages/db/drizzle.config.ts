import { defineConfig } from "drizzle-kit";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFile } from "node:process";

const configDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(configDir, "../../.env");

if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});
