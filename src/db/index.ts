import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Lazy database client.
 *
 * neon() throws when DATABASE_URL is missing, and Next evaluates top-level
 * module code during `next build` — initialising at import time would crash
 * the build before the database exists. A plain function (never a Proxy,
 * which breaks libraries that introspect the client) defers that cost.
 *
 * Two drivers, picked from the URL: Neon's HTTP driver in production, and
 * node-postgres for a plain local Postgres. Neon's driver speaks HTTP to
 * their proxy and cannot reach localhost, so without this you cannot run
 * the app against a local database at all.
 */

function isNeonUrl(url: string) {
  return /neon\.(tech|build)/.test(url) || url.includes("pooler.");
}

type Db =
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePg<typeof schema>>;

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Run `vercel env pull .env.local` after provisioning Neon.",
    );
  }

  if (isNeonUrl(url)) {
    return drizzleNeon(neon(url), { schema });
  }

  return drizzlePg(new Pool({ connectionString: url }), { schema });
}

let cached: Db | null = null;

export function getDb(): Db {
  if (!cached) cached = createDb();
  return cached;
}

/** True when a database is configured. Lets callers degrade rather than throw. */
export function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
