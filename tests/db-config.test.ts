import assert from "node:assert/strict";
import test from "node:test";
import { mariaDbConfig } from "../src/lib/db";

test("DATABASE_URL becomes driver settings, with every session pinned to the tables' collation", () => {
  // Same shape as production: percent-encoded password, pool options in the query string.
  const config = mariaDbConfig("mysql://app_user:p%40ss%21w%2Bd@127.0.0.1:3306/app_db?connectionLimit=1&connectTimeout=10000");
  assert.deepEqual(config, {
    host: "127.0.0.1",
    port: 3306,
    user: "app_user",
    password: "p@ss!w+d",
    database: "app_db",
    connectionLimit: 1,
    connectTimeout: 10000,
    initSql: "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
  });
});

test("a URL without port or options keeps the driver defaults", () => {
  assert.deepEqual(mariaDbConfig("mysql://dev:dev@localhost/dev_db"), {
    host: "localhost",
    port: 3306,
    user: "dev",
    password: "dev",
    database: "dev_db",
    initSql: "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
  });
});
