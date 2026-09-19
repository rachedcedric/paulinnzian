import assert from "node:assert/strict";
import test from "node:test";
import {
  buildOrderListQuery, csvCell, getPageWindow, nextDay, parseOrderListParams, zonedDayStart,
} from "../src/lib/order-list";

test("invalid params fall back to safe defaults", () => {
  const p = parseOrderListParams({ page: "-3", limit: "9999", sort: "evil", order: "x", status: "NOPE", dateFrom: "abc" });
  assert.equal(p.page, 1);
  assert.equal(p.limit, 10);
  assert.equal(p.sort, "createdAt");
  assert.equal(p.order, "desc");
  assert.equal(p.status, undefined);
  assert.equal(p.dateFrom, undefined);
});

test("valid params are kept, swapped dates are ordered, query omits defaults", () => {
  const p = parseOrderListParams({ page: "2", limit: "50", status: "DELIVERED", dateFrom: "2026-03-10", dateTo: "2026-03-01" });
  assert.equal(p.limit, 50);
  assert.equal(p.dateFrom, "2026-03-01");
  assert.equal(buildOrderListQuery(parseOrderListParams({})), "");
  assert.equal(buildOrderListQuery(p), "?page=2&limit=50&status=DELIVERED&dateFrom=2026-03-01&dateTo=2026-03-10");
});

test("page window with ellipsis", () => {
  assert.deepEqual(getPageWindow(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(getPageWindow(1, 23), [1, 2, 3, 4, 5, "ellipsis-end", 23]);
  assert.deepEqual(getPageWindow(10, 23), [1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 23]);
  assert.deepEqual(getPageWindow(23, 23), [1, "ellipsis-start", 19, 20, 21, 22, 23]);
});

test("Paris day boundaries handle DST", () => {
  assert.equal(zonedDayStart("2026-01-15").toISOString(), "2026-01-14T23:00:00.000Z");
  assert.equal(zonedDayStart("2026-07-15").toISOString(), "2026-07-14T22:00:00.000Z");
  assert.equal(nextDay("2026-02-28"), "2026-03-01");
});

test("csv cells are escaped and formula-safe", () => {
  assert.equal(csvCell('a;b"c'), '"a;b""c"');
  assert.equal(csvCell("=CMD()"), "'=CMD()");
  assert.equal(csvCell("+22507000003"), "+22507000003");
  assert.equal(csvCell("-cmd"), "'-cmd");
  assert.equal(csvCell(null), "");
});
