"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZES, getPageWindow } from "@/lib/order-list";

interface Props {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  disabled?: boolean;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
}

export function OrdersPagination({ page, limit, total, totalPages, disabled, onPage, onLimit }: Props) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 border-t border-gray-100 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <p className="text-sm text-gray-500">
        Affichage de <strong className="text-gray-900">{from}</strong> à{" "}
        <strong className="text-gray-900">{to}</strong> sur{" "}
        <strong className="text-gray-900">{total}</strong> commande{total > 1 ? "s" : ""}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`${btn} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </button>

        {getPageWindow(page, totalPages).map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              disabled={disabled}
              onClick={() => item !== page && onPage(item)}
              className={`${btn} ${
                item === page
                  ? "border-[#D99A12] bg-[#D99A12] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-1 text-gray-400" aria-hidden>
              …
            </span>
          ),
        )}

        <button
          type="button"
          className={`${btn} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
          disabled={disabled || page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-500">
        Éléments par page
        <select
          value={limit}
          disabled={disabled}
          onChange={(e) => onLimit(Number(e.target.value))}
          className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D99A12]"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
