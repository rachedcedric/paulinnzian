"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Download, Eye, Package, Pencil,
  Plus, Scale, Search, Timer, Trash2, Users, X,
} from "lucide-react";
import { adminExportOrdersCsv, deleteOrder } from "@/actions/admin";
import {
  ORDER_STATUSES, buildOrderListQuery, formatOrderDateTime, hasActiveOrderFilters,
  type OrderListParams, type OrderSortKey,
} from "@/lib/order-list";
import { countryFlag } from "@/lib/country-flag";
import { ORDER_STATUS_LABELS } from "@/types";
import type { Order } from "@/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrdersPagination } from "./OrdersPagination";
import { OrderFormModal } from "./OrderFormModal";
import { OrderTrackingModal } from "./OrderTrackingModal";
import { OrderWeightModal } from "./OrderWeightModal";

export interface OrdersAdminProps {
  orders: Order[];
  params: OrderListParams;
  total: number;
  totalPages: number;
  stats: { total: number; inProgress: number; delivered: number; uniqueClients: number };
  destinations: string[];
  weightRate: number;
  canManage: boolean;
}

const nf = new Intl.NumberFormat("fr-FR");
const field =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D99A12]";

const COLUMNS: { key: OrderSortKey; label: string; align?: "right" }[] = [
  { key: "trackingNumber", label: "N° Suivi" },
  { key: "customerName", label: "Client" },
  { key: "destinationCity", label: "Destination" },
  { key: "status", label: "Statut" },
  { key: "createdAt", label: "Date" },
  { key: "amount", label: "Montant", align: "right" },
];

export function OrdersAdmin({ orders, params, total, totalPages, stats, destinations, weightRate, canManage }: OrdersAdminProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [weightTarget, setWeightTarget] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Draft filters are applied only on "Rechercher"; the search box applies itself (debounced).
  const [draft, setDraft] = useState({
    status: params.status ?? "",
    destination: params.destination ?? "",
    dateFrom: params.dateFrom ?? "",
    dateTo: params.dateTo ?? "",
  });
  const [search, setSearch] = useState(params.search);
  const lastPushedSearch = useRef(params.search);

  // Keep the draft filters in sync when the URL changes from outside (back/forward, reset).
  const filtersKey = [params.status, params.destination, params.dateFrom, params.dateTo].join("|");
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setDraft({
      status: params.status ?? "",
      destination: params.destination ?? "",
      dateFrom: params.dateFrom ?? "",
      dateTo: params.dateTo ?? "",
    });
  }

  useEffect(() => {
    if (params.search !== lastPushedSearch.current) {
      lastPushedSearch.current = params.search;
      setSearch(params.search);
    }
  }, [params.search]);

  function navigate(next: Partial<OrderListParams>, mode: "push" | "replace" = "push") {
    const target = `${pathname}${buildOrderListQuery({ ...params, ...next })}`;
    startTransition(() => (mode === "push" ? router.push(target) : router.replace(target)));
  }

  // Debounced search (resets to page 1).
  useEffect(() => {
    const value = search.trim();
    if (value === params.search) return;
    const timer = setTimeout(() => {
      lastPushedSearch.current = value;
      const target = `${pathname}${buildOrderListQuery({ ...params, search: value, page: 1 })}`;
      startTransition(() => router.replace(target));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, params, pathname, router]);

  function applyFilters() {
    navigate({
      page: 1,
      search: search.trim(),
      status: (draft.status || undefined) as OrderListParams["status"],
      destination: draft.destination || undefined,
      dateFrom: draft.dateFrom || undefined,
      dateTo: draft.dateTo || undefined,
    });
  }

  function resetFilters() {
    setSearch("");
    lastPushedSearch.current = "";
    setDraft({ status: "", destination: "", dateFrom: "", dateTo: "" });
    navigate({ page: 1, search: "", status: undefined, destination: undefined, dateFrom: undefined, dateTo: undefined });
  }

  function toggleSort(key: OrderSortKey) {
    const order = params.sort === key ? (params.order === "asc" ? "desc" : "asc") : key === "createdAt" ? "desc" : "asc";
    navigate({ sort: key, order, page: 1 });
  }

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteOrder(deleteTarget.id);
      if (result.success) {
        toast.success("Commande supprimée");
        setDeleteTarget(null);
        refresh();
      } else {
        toast.error("Suppression impossible");
      }
    } catch {
      toast.error("Suppression impossible");
    } finally {
      setDeleting(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const { csv, count, truncated } = await adminExportOrdersCsv(params);
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(truncated ? `${count} commandes exportées (limite atteinte)` : `${count} commande(s) exportée(s)`);
    } catch {
      toast.error("Export impossible");
    } finally {
      setExporting(false);
    }
  }

  const viewOrder = viewId ? orders.find((o) => o.id === viewId) ?? null : null;
  const filtersActive = hasActiveOrderFilters(params);
  const showAmount = true;

  function openEdit(order: Order) {
    setEditing(order);
    setShowForm(true);
  }

  const actions = (order: Order) => (
    <div className="flex items-center justify-end gap-1">
      <button onClick={() => setViewId(order.id)} className="rounded-lg p-2 hover:bg-gray-100" title="Voir les détails" aria-label={`Voir les détails de la commande ${order.trackingNumber}`}>
        <Eye className="h-4 w-4 text-gray-500" />
      </button>
      {canManage && (
        <>
          <button onClick={() => setWeightTarget(order)} className="rounded-lg p-2 hover:bg-blue-50" title={order.weight ? "Modifier les frais au kg" : "Ajouter les frais au kg"} aria-label={`${order.weight ? "Modifier" : "Ajouter"} les frais au kg de la commande ${order.trackingNumber}`}>
            <Scale className="h-4 w-4 text-blue-600" />
          </button>
          <button onClick={() => openEdit(order)} className="rounded-lg p-2 hover:bg-gray-100" title="Modifier" aria-label="Modifier">
            <Pencil className="h-4 w-4 text-gray-500" />
          </button>
          <button onClick={() => setDeleteTarget(order)} className="rounded-lg p-2 hover:bg-red-50" title="Supprimer" aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </>
      )}
    </div>
  );

  const statCards = [
    { label: "Total commandes", value: stats.total, icon: Package, tone: "bg-amber-50 text-[#D99A12]" },
    { label: "En cours", value: stats.inProgress, icon: Timer, tone: "bg-blue-50 text-blue-600" },
    { label: "Commandes livrées", value: stats.delivered, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Clients uniques", value: stats.uniqueClients, icon: Users, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="min-h-full bg-[#F7F9FC] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion des commandes</h1>
          <p className="mt-1 text-sm text-gray-500">Suivez et gérez toutes vos commandes en un seul endroit.</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#D99A12] px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-[#C8912D]"
          >
            <Plus className="h-5 w-5" />Nouvelle commande
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={100}
          placeholder="Rechercher une commande, un client, un numéro de suivi..."
          aria-label="Rechercher une commande"
          className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D99A12]"
        />
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-black text-gray-900">{nf.format(value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form
        onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
        className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="text-xs font-semibold text-gray-500">
          Statut
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className={`${field} mt-1 font-normal`}>
            <option value="">Tous les statuts</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-500">
          Destination
          <select value={draft.destination} onChange={(e) => setDraft({ ...draft, destination: e.target.value })} className={`${field} mt-1 font-normal`}>
            <option value="">Toutes les destinations</option>
            {destinations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-500">
          Période — du
          <input type="date" value={draft.dateFrom} max={draft.dateTo || undefined} onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value })} className={`${field} mt-1 font-normal`} />
        </label>
        <label className="text-xs font-semibold text-gray-500">
          au
          <input type="date" value={draft.dateTo} min={draft.dateFrom || undefined} onChange={(e) => setDraft({ ...draft, dateTo: e.target.value })} className={`${field} mt-1 font-normal`} />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
          <button type="submit" className="h-10 flex-1 rounded-lg bg-[#D99A12] px-4 text-sm font-semibold text-white hover:bg-[#C8912D]">Rechercher</button>
          <button type="button" onClick={resetFilters} className="h-10 flex-1 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">Réinitialiser</button>
        </div>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Liste des commandes</h2>
            <p className="text-sm text-gray-900" aria-live="polite">
              <strong>{nf.format(total)}</strong> commande{total > 1 ? "s" : ""} au total
            </p>
          </div>
          {canManage && (
            <button onClick={exportCsv} disabled={exporting || total === 0} className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              <Download className="h-4 w-4" />{exporting ? "Export..." : "Exporter"}
            </button>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/70">
                {COLUMNS.filter((c) => showAmount || c.key !== "amount").map((c) => {
                  const active = params.sort === c.key;
                  const Icon = !active ? ArrowUpDown : params.order === "asc" ? ArrowUp : ArrowDown;
                  return (
                    <th key={c.key} aria-sort={active ? (params.order === "asc" ? "ascending" : "descending") : "none"} className={`px-4 py-3 font-semibold text-gray-500 ${c.align === "right" ? "text-right" : "text-left"}`}>
                      <button onClick={() => toggleSort(c.key)} className={`inline-flex items-center gap-1 hover:text-gray-900 ${active ? "text-gray-900" : ""}`}>
                        {c.label}<Icon className={`h-3.5 w-3.5 ${active ? "text-[#D99A12]" : "text-gray-300"}`} />
                      </button>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPending
                ? Array.from({ length: Math.min(params.limit, 10) }, (_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={7} className="px-4 py-4"><div className="h-6 animate-pulse rounded bg-gray-100" /></td>
                    </tr>
                  ))
                : orders.map((order) => {
                    const { date, time } = formatOrderDateTime(order.createdAt);
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-mono text-sm font-bold text-[#D99A12]">{order.trackingNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-400">{order.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <span className="mr-1.5" aria-hidden>{countryFlag(order.destinationCountry)}</span>{order.destinationCity}
                        </td>
                        <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                        <td className="px-4 py-3 text-gray-700">
                          <p>{date}</p><p className="text-xs text-gray-400">{time}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {order.amount != null ? `${nf.format(order.amount)} FCFA` : <span className="font-normal text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">{actions(order)}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {isPending
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />)
            : orders.map((order) => {
                const { date, time } = formatOrderDateTime(order.createdAt);
                return (
                  <div key={order.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-sm font-bold text-[#D99A12]">{order.trackingNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                      <span><span aria-hidden>{countryFlag(order.destinationCountry)}</span> {order.destinationCity}</span>
                      <span>{date} · {time}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{order.amount != null ? `${nf.format(order.amount)} FCFA` : "—"}</span>
                      {actions(order)}
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Empty states */}
        {!isPending && orders.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-semibold text-gray-700">{filtersActive ? "Aucune commande ne correspond à vos critères." : "Aucune commande trouvée."}</p>
            {filtersActive && (
              <button onClick={resetFilters} className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {total > 0 && (
          <OrdersPagination
            page={params.page}
            limit={params.limit}
            total={total}
            totalPages={totalPages}
            disabled={isPending}
            onPage={(page) => navigate({ page })}
            onLimit={(limit) => navigate({ limit: limit as OrderListParams["limit"], page: 1 })}
          />
        )}
      </div>

      {showForm && (
        <OrderFormModal
          editing={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refresh(); }}
        />
      )}

      {viewOrder && (
        <OrderTrackingModal
          order={viewOrder}
          weightRate={weightRate}
          canManage={canManage}
          onClose={() => setViewId(null)}
          onChanged={refresh}
          onEditWeight={() => { setViewId(null); setWeightTarget(viewOrder); }}
        />
      )}

      {weightTarget && (
        <OrderWeightModal
          order={weightTarget}
          weightRate={weightRate}
          onClose={() => setWeightTarget(null)}
          onSaved={() => { setWeightTarget(null); refresh(); }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <div className="flex items-start justify-between">
              <h2 id="delete-title" className="font-black text-gray-900">Supprimer cette commande ?</h2>
              <button onClick={() => setDeleteTarget(null)} aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-2 text-sm text-gray-500">Cette action est irréversible.</p>
            <p className="mt-1 font-mono text-xs text-gray-400">{deleteTarget.trackingNumber}</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold">Annuler</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? "..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
