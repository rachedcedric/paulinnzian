import assert from "node:assert/strict";
import test from "node:test";
import {
  buildOrderListQuery, calculateWeightCharge, csvCell, dateInTimeZone, exchangeMargin, getPageWindow, nextDay,
  nextTrackingNumber, orderShippingFee, parseOrderListParams, shiftDate, zonedDayStart,
} from "../src/lib/order-list";

test("the next tracking number follows the previous order", () => {
  assert.equal(nextTrackingNumber("ABJ-2026-252"), "ABJ-2026-253");
  assert.equal(nextTrackingNumber("ABJ-2026-009"), "ABJ-2026-010");
  assert.equal(nextTrackingNumber("ABJ-2026-999"), "ABJ-2026-1000");
  assert.equal(nextTrackingNumber(null, 2026), "ABJ-2026-001");
  assert.equal(nextTrackingNumber("SANS-NUMERO", 2026), "ABJ-2026-001");
});

test("standard orders pay per kg at their own rate, luxury orders pay a share of the amount", () => {
  const order = { amount: 200_000, weight: 1.3, kgRate: 15_000, luxePercent: null };
  assert.equal(orderShippingFee({ ...order, articleType: "STANDARD" }), 30_000); // Express: 2 kg billed
  assert.equal(orderShippingFee({ ...order, articleType: "STANDARD", kgRate: null }, 9_800), 19_600); // old order → default rate
  assert.equal(orderShippingFee({ ...order, articleType: "LUXE", luxePercent: 10 }), 20_000); // weight ignored
  assert.equal(orderShippingFee({ ...order, articleType: "LUXE", luxePercent: 10, amount: null }), 0);
});

test("exchange margin is 14.04 FCFA per euro paid at 670", () => {
  assert.equal(exchangeMargin(670), 14); // 1 € → 14.04, rounded to the franc
  assert.equal(exchangeMargin(67_000), 1_404); // 100 €
  assert.equal(exchangeMargin(null), 0);
  assert.equal(exchangeMargin(-5), 0);
});

test("transport fees round each entered weight up to the next kilogram", () => {
  assert.equal(calculateWeightCharge(1.3, 8_000), 16_000);
  assert.equal(calculateWeightCharge(2, 8_000), 16_000);
  assert.equal(calculateWeightCharge(null, 8_000), 0);
});

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
  assert.equal(shiftDate("2026-03-01", -6), "2026-02-23");
  assert.equal(dateInTimeZone(new Date("2026-09-19T22:30:00Z")), "2026-09-20");
});

test("csv cells are escaped and formula-safe", () => {
  assert.equal(csvCell('a;b"c'), '"a;b""c"');
  assert.equal(csvCell("=CMD()"), "'=CMD()");
  assert.equal(csvCell("+22507000003"), "+22507000003");
  assert.equal(csvCell("-cmd"), "'-cmd");
  assert.equal(csvCell(null), "");
});
