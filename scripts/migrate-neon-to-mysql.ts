/**
 * One-time data migration: Neon (PostgreSQL) → Hostinger (MySQL).
 *
 * Run this ONLY when both are true:
 *   1. Neon is reachable again (its quota block must be lifted, even temporarily).
 *   2. The real Hostinger MySQL database exists and its schema has been created
 *      via `npx prisma db push` against DATABASE_URL pointing at Hostinger.
 *
 * This script does NOT touch the Neon source — it only reads from it.
 * It is safe to re-run: every table is upserted by primary key, so running it
 * twice will not duplicate rows.
 *
 * Usage:
 *   npm install pg --no-save          # temporary, only needed for this script
 *   NEON_DATABASE_URL="postgresql://..." \
 *   MYSQL_DATABASE_URL="mysql://..." \
 *   npx tsx scripts/migrate-neon-to-mysql.ts
 */
import { Client as PgClient } from "pg";
import mariadb from "mariadb";

const NEON_URL = process.env.NEON_DATABASE_URL;
const MYSQL_URL = process.env.MYSQL_DATABASE_URL?.replace(/^mysql:/, "mariadb:");

if (!NEON_URL) throw new Error("NEON_DATABASE_URL is not set");
if (!MYSQL_URL) throw new Error("MYSQL_DATABASE_URL is not set");

// Order matters: parents before children (foreign keys).
const TABLES = [
  "admin_users",
  "stores",
  "exchange_rates",
  "shipping_rates",
  "clients",
  "orders",
  "tracking_events",
  "testimonials",
  "faqs",
  "contact_messages",
  "site_settings",
] as const;

async function main() {
  const pg = new PgClient({ connectionString: NEON_URL });
  await pg.connect();
  const mysql = await mariadb.createConnection(MYSQL_URL!);

  const summary: Record<string, number> = {};

  try {
    for (const table of TABLES) {
      const { rows } = await pg.query(`SELECT * FROM ${table}`);
      if (rows.length === 0) {
        summary[table] = 0;
        continue;
      }

      const columns = Object.keys(rows[0]);
      const placeholders = `(${columns.map(() => "?").join(", ")})`;
      const updateClause = columns
        .filter((c) => c !== "id" && c !== "key") // primary keys never need updating
        .map((c) => `\`${c}\` = VALUES(\`${c}\`)`)
        .join(", ");

      const sql = `
        INSERT INTO ${table} (${columns.map((c) => `\`${c}\``).join(", ")})
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE ${updateClause}
      `;

      for (const row of rows) {
        const values = columns.map((c) => row[c]);
        await mysql.query(sql, values);
      }

      summary[table] = rows.length;
      console.log(`✓ ${table}: ${rows.length} lignes migrées`);
    }

    console.log("\nRésumé:", JSON.stringify(summary, null, 2));
    console.log("\nVérifiez les comptes AVANT de couper Neon (ne le faites jamais automatiquement).");
  } finally {
    await pg.end();
    await mysql.end();
  }
}

main().catch((err) => {
  console.error("MIGRATION_FAILED", err);
  process.exit(1);
});
