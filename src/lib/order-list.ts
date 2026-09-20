import { z } from "zod";
import type { OrderStatus } from "@prisma/client";

/** Pure helpers shared by the server (queries/export) and the client (URL building). */

export const ORDER_STATUSES = [
  "PENDING",
  "PURCHASED",
  "RECEIVED_PARIS",
  "SHIPPED_DESTINATION",
  "ARRIVED_DESTINATION",
  "DELIVERED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

export const ORDER_SORT_KEYS = [
  "trackingNumber",
  "customerName",
  "destinationCity",
  "status",
  "createdAt",
  "amount",
] as const;
export type OrderSortKey = (typeof ORDER_SORT_KEYS)[number];

export const ORDER_EXPORT_MAX_ROWS = 5_000;
export const ORDERS_TIMEZONE = "Europe/Paris";

export interface OrderListParams {
  page: number;
  limit: PageSize;
  sort: OrderSortKey;
  order: "asc" | "desc";
  status?: (typeof ORDER_STATUSES)[number];
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  search: string;
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

const paramsSchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).catch(1),
  limit: z.coerce
    .number()
    .refine((n) => (PAGE_SIZES as readonly number[]).includes(n))
    .catch(DEFAULT_PAGE_SIZE),
  sort: z.enum(ORDER_SORT_KEYS).catch("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  destination: z.string().trim().min(1).max(100).optional().catch(undefined),
  dateFrom: z.string().refine(isValidDateString).optional().catch(undefined),
  dateTo: z.string().refine(isValidDateString).optional().catch(undefined),
  search: z.string().trim().max(100).catch(""),
});

function first(value: unknown): string | number | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" || typeof v === "number" ? v : undefined;
}

/** Never trusts the input: every invalid value silently falls back to its default. */
export function parseOrderListParams(raw: Record<string, unknown> = {}): OrderListParams {
  const parsed = paramsSchema.parse({
    page: first(raw.page),
    limit: first(raw.limit),
    sort: first(raw.sort),
    order: first(raw.order),
    status: first(raw.status),
    destination: first(raw.destination),
    dateFrom: first(raw.dateFrom),
    dateTo: first(raw.dateTo),
    search: first(raw.search),
  });

  let { dateFrom, dateTo } = parsed;
  if (dateFrom && dateTo && dateFrom > dateTo) [dateFrom, dateTo] = [dateTo, dateFrom];

  return { ...parsed, limit: parsed.limit as PageSize, dateFrom, dateTo };
}

export const ORDER_LIST_DEFAULTS = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  sort: "createdAt",
  order: "desc",
} as const;

/** Builds a clean query string (defaults and empty values are omitted). */
export function buildOrderListQuery(params: OrderListParams): string {
  const query = new URLSearchParams();
  if (params.page !== ORDER_LIST_DEFAULTS.page) query.set("page", String(params.page));
  if (params.limit !== ORDER_LIST_DEFAULTS.limit) query.set("limit", String(params.limit));
  if (params.sort !== ORDER_LIST_DEFAULTS.sort) query.set("sort", params.sort);
  if (params.order !== ORDER_LIST_DEFAULTS.order) query.set("order", params.order);
  if (params.status) query.set("status", params.status);
  if (params.destination) query.set("destination", params.destination);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function hasActiveOrderFilters(params: OrderListParams) {
  return Boolean(params.search || params.status || params.destination || params.dateFrom || params.dateTo);
}

export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** 1 2 3 4 5 … 23 — window that adapts to the current page. */
export function getPageWindow(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  if (page >= totalPages - 3) {
    return [1, "ellipsis-start", ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  }
  return [1, "ellipsis-start", page - 1, page, page + 1, "ellipsis-end", totalPages];
}

// ─── Time zone (day boundaries follow the Paris office, dates display the same way) ──

function zoneOffsetMs(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** 00:00 of the given YYYY-MM-DD in the Paris time zone, as a real instant. */
export function zonedDayStart(dateStr: string, timeZone = ORDERS_TIMEZONE): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d);
  return new Date(utcMidnight - zoneOffsetMs(new Date(utcMidnight), timeZone));
}

export function nextDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

export function shiftDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function dateInTimeZone(date = new Date(), timeZone = ORDERS_TIMEZONE): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatOrderDateTime(value: Date | string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("fr-FR", {
      timeZone: ORDERS_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("fr-FR", {
      timeZone: ORDERS_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

export function calculateWeightCharge(weight: number | null | undefined, rate: number) {
  if (!weight || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(rate) || rate < 0) return 0;
  return Math.ceil(weight) * rate;
}

// ─── CSV ────────────────────────────────────────────────────────────────────

/**
 * Escapes one CSV cell (";" separated, French Excel). Cells that Excel could run as a
 * formula (=, @, tab, CR, or +/- followed by non-numeric text) get a leading apostrophe.
 */
export function csvCell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  const looksNumeric = /^[+-]?\d[\d\s().-]*$/.test(text);
  if (/^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !looksNumeric)) text = `'${text}`;
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function csvRow(cells: (string | number | null | undefined)[]) {
  return cells.map(csvCell).join(";");
}
