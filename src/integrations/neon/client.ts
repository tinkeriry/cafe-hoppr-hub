import { neon } from "@neondatabase/serverless";

const databaseUrl = import.meta.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "VITE_DATABASE_URL is not set. Please ensure the environment variable is configured in your build process."
  );
}

const sql = neon(databaseUrl, {
  disableWarningInBrowsers: true,
});

export { sql };
