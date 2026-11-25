import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * DATABASE_URL as driver settings, with every session pinned to the tables' collation.
 * The production MariaDB (11.8) ignores the collation the driver asks for at login: sessions start in
 * utf8mb4_uca1400_ai_ci while parameters arrive in another collation, so Prisma's `contains`
 * (LIKE CONCAT('%', ?, '%')) fails with "Illegal mix of collations". initSql fixes it on each connection.
 * An object, not a URL option: the adapter re-encodes URL options and the driver does not decode '+'.
 */
export function mariaDbConfig(connectionString: string) {
  const url = new URL(connectionString);
  const options = Object.fromEntries(
    [...url.searchParams].map(([key, value]) => [key, /^\d+$/.test(value) ? Number(value) : value]),
  );
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    ...options,
    initSql: "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
  };
}

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaMariaDb(mariaDbConfig(connectionString));
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
