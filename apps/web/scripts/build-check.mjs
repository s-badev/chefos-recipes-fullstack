// Verification build into .next-check, so a running `next dev` keeps its own .next intact.
// Usage: npm run build:check --workspace apps/web   then   npm run start:check --workspace apps/web -- -p 3000
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const nextEnvPath = fileURLToPath(new URL("../next-env.d.ts", import.meta.url));
const command = process.argv[2] === "start" ? ["start", ...process.argv.slice(3)] : ["build"];

// Next rewrites next-env.d.ts to point at the active distDir; keep the committed .next version.
const nextEnv = readFileSync(nextEnvPath, "utf8");
const result = spawnSync(process.execPath, [nextBin, ...command], {
  stdio: "inherit",
  env: { ...process.env, NEXT_DIST_DIR: ".next-check" }
});
if (readFileSync(nextEnvPath, "utf8") !== nextEnv) writeFileSync(nextEnvPath, nextEnv);

process.exit(result.status ?? 1);
