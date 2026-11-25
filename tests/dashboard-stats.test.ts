import assert from "node:assert/strict";
import test from "node:test";
import { buildDashboardPeriods, exchangeProfit, formatFcfa, niceAxisMax, percentChange } from "../src/lib/dashboard-stats";
import { calculateWeightCharge } from "../src/lib/order-list";

// 2026-09-18 15:30 Paris (CEST = UTC+2)
const NOW = new Date("2026-09-18T13:30:00Z");
const at = (iso: string) => new Date(iso);
/** Per-kg fee rows, as getDashboardStats builds them for standard orders. */
const perKg = (rows: { weight: number | null; weightAddedAt: Date }[], rate: number) =>
  rows.map((row) => ({ fee: calculateWeightCharge(row.weight, rate), weight: row.weight, date: row.weightAddedAt }));

test("day / week / month / year totals, counts and average", () => {
  const rows = [
    { amount: 10000, orderDate: at("2026-09-18T00:00:00Z"), createdAt: at("2026-09-18T08:15:00Z") }, // today, 10h Paris
    { amount: 20000, orderDate: at("2026-09-18T00:00:00Z"), createdAt: at("2026-09-18T11:00:00Z") }, // today, 13h
    { amount: 5000, orderDate: at("2026-09-17T00:00:00Z"), createdAt: at("2026-09-17T09:00:00Z") }, // yesterday
    { amount: 7000, orderDate: at("2026-09-02T00:00:00Z"), createdAt: at("2026-09-02T09:00:00Z") }, // this month
    { amount: 9000, orderDate: at("2026-03-02T00:00:00Z"), createdAt: at("2026-03-02T09:00:00Z") }, // this year
    { amount: null, orderDate: at("2026-09-18T00:00:00Z"), createdAt: at("2026-09-18T09:00:00Z") }, // today, no amount
  ];
  const { revenue } = buildDashboardPeriods(rows, [], NOW);
  assert.equal(revenue.day.previousTotal, 5000);
  assert.equal(revenue.day.total, 30000);
  assert.equal(revenue.day.orders, 3);
  assert.equal(revenue.day.average, 10000);
  assert.equal(revenue.day.series.length, 24);
  assert.equal(revenue.day.series[10].value, 10000);
  assert.equal(revenue.day.series[13].value, 20000);
  assert.equal(revenue.week.total, 35000);
  assert.equal(revenue.month.total, 42000);
  assert.equal(revenue.month.series.length, 18);
  assert.equal(revenue.year.total, 51000);
  assert.equal(revenue.year.series[2].value, 9000);
  assert.equal(revenue.day.change, 500); // 30000 vs 5000 yesterday
});

test("no data → zeros, no NaN, no fake change", () => {
  const { revenue, transport } = buildDashboardPeriods([], [], NOW);
  assert.equal(revenue.day.total, 0);
  assert.equal(revenue.day.average, 0);
  assert.equal(revenue.day.change, null);
  assert.equal(transport.year.weightKg, 0);
  assert.ok(revenue.week.series.every((p) => p.value === 0));
});

test("transport uses ceil(weight) × rate and keeps real weight", () => {
  const rows = [
    { weight: 1.2, weightAddedAt: at("2026-09-18T07:00:00Z") }, // 9h Paris → 2 kg billed
    { weight: 3, weightAddedAt: at("2026-09-18T07:30:00Z") },
    { weight: 2, weightAddedAt: at("2026-09-17T07:30:00Z") },
    { weight: null, weightAddedAt: at("2026-09-18T07:30:00Z") },
  ];
  const { transport } = buildDashboardPeriods([], perKg(rows, 9800), NOW);
  assert.equal(transport.day.total, (2 + 3) * 9800);
  assert.equal(transport.day.previousTotal, 2 * 9800);
  assert.equal(transport.day.packages, 2);
  assert.equal(transport.day.weightKg, 4.2);
  assert.equal(transport.day.series[9].value, 5 * 9800);
  assert.equal(transport.week.total, (2 + 3 + 2) * 9800);
  assert.equal(transport.day.change, 150); // 49000 vs 19600
});

test("Paris midnight boundary: 23:30 UTC belongs to the next Paris day", () => {
  const rows = [{ weight: 1, weightAddedAt: at("2026-09-17T22:30:00Z") }]; // 00:30 on the 18th, Paris
  assert.equal(buildDashboardPeriods([], perKg(rows, 100), NOW).transport.day.total, 100);
});

test("luxury fees (% of the amount, no weight) count as transport revenue", () => {
  const rows = [
    { fee: 20000, weight: null, date: at("2026-09-18T07:00:00Z") }, // luxury order: 10 % of 200 000
    { fee: 9800, weight: 1, date: at("2026-09-18T08:00:00Z") },
    { fee: 0, weight: null, date: at("2026-09-18T08:00:00Z") }, // nothing billed → ignored
  ];
  const { transport } = buildDashboardPeriods([], rows, NOW);
  assert.equal(transport.day.total, 29800);
  assert.equal(transport.day.packages, 2);
  assert.equal(transport.day.weightKg, 1);
});

test("helpers", () => {
  assert.equal(percentChange(10, 0), null);
  assert.equal(percentChange(90, 100), -10);
  assert.equal(niceAxisMax(161837), 200000);
  assert.equal(niceAxisMax(0), 4);
  assert.equal(formatFcfa(2311125).replace(/\s/g, " "), "2 311 125 F CFA");
});

test("Mes revenus = exchange margin only: (€ × 670) − (€ × 655.96)", () => {
  // 100 € order stored as 67 000 F CFA → 67 000 − 65 596 = 1 404 F CFA; no transport fee added.
  const profit = exchangeProfit({
    total: 67_000,
    previousTotal: 33_500,
    orders: 1,
    average: 67_000,
    series: [{ label: "10h", value: 67_000 }, { label: "11h", value: 0 }],
    change: null,
  });
  assert.equal(profit.total, 1_404);
  assert.equal(profit.euros, 100);
  assert.equal(profit.change, 100);
  assert.deepEqual(profit.series, [{ label: "10h", value: 1_404 }, { label: "11h", value: 0 }]);
});
