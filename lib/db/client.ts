import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.warn("[db] TURSO_DATABASE_URL not set — using in-memory SQLite for dev");
  }

  const client = createClient({
    url: url ?? "file:local.db",
    authToken: authToken,
  });

  _db = drizzle(client, { schema });
  return _db;
}
