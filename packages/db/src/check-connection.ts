import { neon } from "@neondatabase/serverless";

import { loadRootEnv } from "./load-env.js";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  console.log(`DATABASE_URL exists: ${databaseUrl ? "yes" : "no"}`);

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Set it in the root .env file or the shell environment."
    );
  }

  return databaseUrl;
}

function getSafeConnectionDetails(databaseUrl: string) {
  try {
    const parsedUrl = new URL(databaseUrl);
    const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ""));

    return {
      databaseName: databaseName || "(missing)",
      hostname: parsedUrl.hostname || "(missing)",
      usesPooler: parsedUrl.hostname.includes("-pooler")
    };
  } catch {
    throw new Error("DATABASE_URL is set but is not a valid URL.");
  }
}

function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.startsWith("DATABASE_URL")) {
    return error.message;
  }

  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? ` Error code: ${error.code}.`
      : "";

  return `Could not connect to Neon. Check the local DATABASE_URL value and Neon database access.${errorCode}`;
}

async function checkConnection() {
  console.log("Loading environment...");
  loadRootEnv();

  console.log("Checking DATABASE_URL...");
  const databaseUrl = getDatabaseUrl();
  const { databaseName, hostname, usesPooler } =
    getSafeConnectionDetails(databaseUrl);

  console.log(`Hostname: ${hostname}`);
  console.log(`Host includes -pooler: ${usesPooler ? "yes" : "no"}`);
  console.log(`Database name: ${databaseName}`);

  console.log("Running SELECT 1...");
  const sql = neon(databaseUrl);
  await sql("SELECT 1");

  console.log("Connection check succeeded.");
}

checkConnection().catch((error: unknown) => {
  console.error("Connection check failed.");
  console.error(getSafeErrorMessage(error));

  process.exitCode = 1;
});
