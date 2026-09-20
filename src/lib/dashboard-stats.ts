import { ORDERS_TIMEZONE, calculateWeightCharge, shiftDate } from "@/lib/order-list";

/**
 * Pure dashboard aggregation (no DB access) so it can be unit-tested.
 * All day/hour boundaries follow the Paris time zone, like the rest of the admin.
 *
 * Period semantics are the ones the dashboard already used:
 *   day   = today
 *   week  = the last 7 days (today included)
 *   month = calendar month to date
 *   year  = calendar year to date
 */

export type Period = "day" | "week" | "month" | "year";
export const PERIODS: { key: Period; label: string }[] = [
  { key: "day", label: "Jour" },
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "year", label: "Année" },
];
export const DEFAULT_PERIOD: Period = "day";

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface PeriodRevenue {
  total: number;
  orders: number;
  average: number;
  series: SeriesPoint[];
  /** % vs the previous equivalent period; null when it cannot be computed honestly. */
  change: number | null;
}

export interface PeriodTransport {
  total: number;
  packages: number;
  weightKg: number;
  series: SeriesPoint[];
  change: number | null;
}

export interface DashboardPeriods {
  revenue: Record<Period, PeriodRevenue>;
  transport: Record<Period, PeriodTransport>;
}

export interface RevenueRow {
  amount: number | null;
  orderDate: Date;
  createdAt: Date;
}
export interface WeightRow {
  weight: number | null;
  weightAddedAt: Date | null;
}

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ORDERS_TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
});

export function parisDateHour(date: Date): { date: string; hour: number } {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function weekdayOf(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

interface Point {
  date: string;
  hour: number;
  value: number;
  count: number;
  extra: number;
}

interface Range {
  from: string;
  to: string; // inclusive
}

function rangesFor(today: string): Record<Period, { current: Range; previous: Range }> {
  const [y, m, d] = today.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthStart = `${y}-${pad(m)}-01`;
  const prevMonthYear = m === 1 ? y - 1 : y;
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevMonthDay = Math.min(d, daysInMonth(prevMonthYear, prevMonth));
  const yearStart = `${y}-01-01`;
  return {
    day: {
      current: { from: today, to: today },
      previous: { from: shiftDate(today, -1), to: shiftDate(today, -1) },
    },
    week: {
      current: { from: shiftDate(today, -6), to: today },
      previous: { from: shiftDate(today, -13), to: shiftDate(today, -7) },
    },
    month: {
      current: { from: monthStart, to: today },
      // Same elapsed span of the previous month, so a partial month is never compared to a full one.
      previous: { from: `${prevMonthYear}-${pad(prevMonth)}-01`, to: `${prevMonthYear}-${pad(prevMonth)}-${pad(prevMonthDay)}` },
    },
    year: {
      current: { from: yearStart, to: today },
      previous: { from: `${y - 1}-01-01`, to: `${y - 1}-${pad(m)}-${pad(Math.min(d, daysInMonth(y - 1, m)))}` },
    },
  };
}

const inRange = (date: string, r: Range) => date >= r.from && date <= r.to;

function buildSeries(period: Period, today: string, points: Point[]): SeriesPoint[] {
  const y = Number(today.slice(0, 4));
  if (period === "day") {
    const buckets = Array<number>(24).fill(0);
    for (const p of points) if (p.date === today) buckets[p.hour] += p.value;
    return buckets.map((value, h) => ({ label: `${String(h).padStart(2, "0")}h`, value }));
  }
  if (period === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const date = shiftDate(today, i - 6);
      return {
        label: weekdayOf(date),
        value: points.filter((p) => p.date === date).reduce((s, p) => s + p.value, 0),
      };
    });
  }
  if (period === "month") {
    const last = Number(today.slice(8, 10));
    const buckets = Array<number>(last).fill(0);
    for (const p of points) {
      if (p.date.slice(0, 7) === today.slice(0, 7)) buckets[Number(p.date.slice(8, 10)) - 1] += p.value;
    }
    return buckets.map((value, i) => ({ label: String(i + 1), value }));
  }
  const buckets = Array<number>(12).fill(0);
  for (const p of points) {
    if (p.date.slice(0, 4) === String(y)) buckets[Number(p.date.slice(5, 7)) - 1] += p.value;
  }
  return buckets.map((value, i) => ({ label: MONTHS[i], value }));
}

export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function buildDashboardPeriods(
  revenueRows: RevenueRow[],
  weightRows: WeightRow[],
  weightRate: number,
  now = new Date(),
): DashboardPeriods {
  const today = parisDateHour(now).date;
  const ranges = rangesFor(today);

  // Revenue is dated by orderDate (a calendar date). When the order was created the same day,
  // createdAt gives the real hour for the hourly chart; otherwise the orderDate's own hour is used.
  const revenuePoints: Point[] = revenueRows.map((row) => {
    const byOrderDate = parisDateHour(row.orderDate);
    const byCreated = parisDateHour(row.createdAt);
    const hour = byCreated.date === byOrderDate.date ? byCreated.hour : byOrderDate.hour;
    return { date: byOrderDate.date, hour, value: row.amount ?? 0, count: 1, extra: 0 };
  });

  const weightPoints: Point[] = [];
  for (const row of weightRows) {
    if (!row.weight || !row.weightAddedAt) continue;
    const { date, hour } = parisDateHour(row.weightAddedAt);
    weightPoints.push({ date, hour, value: calculateWeightCharge(row.weight, weightRate), count: 1, extra: row.weight });
  }

  const sum = (points: Point[], r: Range, key: "value" | "count" | "extra") =>
    points.reduce((s, p) => (inRange(p.date, r) ? s + p[key] : s), 0);

  const revenue = {} as Record<Period, PeriodRevenue>;
  const transport = {} as Record<Period, PeriodTransport>;

  for (const { key } of PERIODS) {
    const { current, previous } = ranges[key];
    const total = sum(revenuePoints, current, "value");
    const orders = sum(revenuePoints, current, "count");
    revenue[key] = {
      total,
      orders,
      average: orders > 0 ? Math.round(total / orders) : 0,
      series: buildSeries(key, today, revenuePoints.filter((p) => inRange(p.date, current))),
      change: percentChange(total, sum(revenuePoints, previous, "value")),
    };

    const fees = sum(weightPoints, current, "value");
    transport[key] = {
      total: fees,
      packages: sum(weightPoints, current, "count"),
      weightKg: Math.round(sum(weightPoints, current, "extra") * 10) / 10,
      series: buildSeries(key, today, weightPoints.filter((p) => inRange(p.date, current))),
      change: percentChange(fees, sum(weightPoints, previous, "value")),
    };
  }

  return { revenue, transport };
}

/** Earliest Paris date any period/comparison needs (start of the previous year). */
export function dashboardHistoryStart(now = new Date()): string {
  const today = parisDateHour(now).date;
  return `${Number(today.slice(0, 4)) - 1}-01-01`;
}

// ─── Formatting (single place for the dashboard) ─────────────────────────────

const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const weightFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export const formatNumber = (n: number) => numberFormat.format(Number.isFinite(n) ? n : 0);
export const formatFcfa = (n: number) => `${formatNumber(n)} F CFA`;
export const formatKg = (n: number) => `${weightFormat.format(Number.isFinite(n) ? n : 0)} kg`;

/** 200000 → "200K", 1500000 → "1,5M" (chart axis). */
export function formatAxis(n: number): string {
  if (n >= 1_000_000) return `${weightFormat.format(n / 1_000_000)}M`;
  if (n >= 1_000) return `${weightFormat.format(n / 1_000)}K`;
  return String(n);
}

/** Round the chart maximum up to a readable value split in 4 equal steps. */
export function niceAxisMax(max: number): number {
  if (!(max > 0)) return 4;
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * pow).find((s) => s >= raw) ?? raw;
  return step * 4;
}
