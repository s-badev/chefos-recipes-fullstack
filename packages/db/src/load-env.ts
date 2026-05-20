import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const packageSrcDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(packageSrcDir, "../../../.env");

let hasLoadedRootEnv = false;

export function loadRootEnv() {
  if (hasLoadedRootEnv) {
    return;
  }

  if (existsSync(rootEnvPath)) {
    loadEnvFile(rootEnvPath);
  }

  hasLoadedRootEnv = true;
}
