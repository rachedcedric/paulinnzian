import { ORDER_STATUS_LABELS } from "@/types";

// Colors live here (not in ORDER_STATUS_COLORS) so the public tracking pages keep their own palette.
const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PURCHASED: "bg-blue-50 text-blue-700 ring-blue-200",
  RECEIVED_PARIS: "bg-violet-50 text-violet-700 ring-violet-200",
  SHIPPED_DESTINATION: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  ARRIVED_DESTINATION: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};
const FALLBACK = "bg-gray-100 text-gray-600 ring-gray-200";

export function OrderStatusBadge({ status }: { status: string }) {
  const label = (ORDER_STATUS_LABELS as Record<string, string>)[status] ?? status;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status] ?? FALLBACK}`}
    >
      {label}
    </span>
  );
}
