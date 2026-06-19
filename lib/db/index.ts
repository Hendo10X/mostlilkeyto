import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { schema } from "./schema";

const globalForDb = global as unknown as { pool?: Pool };

// Reuse the pool across hot-reloads / serverless invocations.
const pool =
  globalForDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// neon-serverless (WebSocket) driver so multi-statement transactions
// (createPoll, votePoll) work — the HTTP driver cannot do those.
export const db = drizzle(pool, { schema });
