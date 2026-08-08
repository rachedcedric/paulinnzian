"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Eye, PlusCircle } from "lucide-react";
import { createOrder, updateOrder, deleteOrder, addTrackingEvent, deleteTrackingEvent } from "@/actions/admin";
import { orderSchema, trackingEventSchema, type OrderFormData, type TrackingEventFormData } from "@/lib/validations";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";
import type { Order } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function OrdersAdmin({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [search, setSearch] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(orderSchema) as any,
  });

  const { register: regEvent, handleSubmit: handleEvent, reset: resetEvent, formState: { isSubmitting: eventSubmitting } } = useForm<TrackingEventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(trackingEventSchema) as any,
  });

  const filtered = orders.filter((o) =>
    !search ||
    o.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search)
  );

  async function onSubmit(data: OrderFormData) {
    const result = editing ? await updateOrder(editing.id, data) : await createOrder(data);
    if (result.success) {
      toast.success(editing ? "Commande modifiée" : "Commande créée");
      window.location.reload();
    } else {
      toast.error(result.error || "Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette commande ?")) return;
    const result = await deleteOrder(id);
    if (result.success) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Commande supprimée");
    }
  }

  async function onAddEvent(data: TrackingEventFormData) {
    if (!viewOrder) return;
    const result = await addTrackingEvent({ ...data, orderId: viewOrder.id });
    if (result.success) {
      toast.success("Événement ajouté");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    const result = await deleteTrackingEvent(id);
    if (result.success) {
      toast.success("Supprimé");
      window.location.reload();
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-black text-black">Commandes</h1>
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
          />
          <button
            onClick={() => { setEditing(null); reset({ status: "PENDING", destinationCountry: "Côte d'Ivoire", destinationCity: "Abidjan" }); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#FF6500] text-white px-5 py-2.5 rounded-xl font-semibold"
          >
            <Plus className="w-5 h-5" />Créer
          </button>
        </div>
      </div>

      {/* Order Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black">{editing ? "Modifier" : "Créer"} une commande</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1">Numéro de suivi *</label>
                  <input {...register("trackingNumber")} placeholder="PNZ-2026-001245" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" />
                  {errors.trackingNumber && <p className="text-red-500 text-xs">{errors.trackingNumber.message}</p>}</div>
                <div><label className="block text-xs font-semibold mb-1">Statut *</label>
                  <select {...register("status")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none">
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1">Nom client *</label>
                  <input {...register("customerName")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                <div><label className="block text-xs font-semibold mb-1">Téléphone *</label>
                  <input {...register("customerPhone")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1">Email</label>
                  <input {...register("customerEmail")} type="email" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                <div><label className="block text-xs font-semibold mb-1">Boutique</label>
                  <input {...register("storeName")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-semibold mb-1">Montant (FCFA)</label>
                  <input {...register("amount")} type="number" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                <div><label className="block text-xs font-semibold mb-1">Nb colis</label>
                  <input {...register("packageCount")} type="number" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                <div><label className="block text-xs font-semibold mb-1">Poids (kg) <span className="font-normal text-gray-400">— renseigné à l'arrivée</span></label>
                  <input {...register("weight")} type="number" step="0.1" placeholder="ex: 1.3" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1">Ville destination *</label>
                  <input {...register("destinationCity")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                <div><label className="block text-xs font-semibold mb-1">Pays *</label>
                  <input {...register("destinationCountry")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1">Notes internes</label>
                <textarea {...register("internalNotes")} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none resize-none" /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#FF6500] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {isSubmitting ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-[#FF6500]">{viewOrder.trackingNumber}</h2>
                <p className="text-sm text-gray-500">{viewOrder.customerName} • {viewOrder.destinationCity}</p>
              </div>
              <button onClick={() => setViewOrder(null)}><X className="w-5 h-5" /></button>
            </div>

            {/* Tracking events */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Événements de suivi</h3>
                <button onClick={() => { resetEvent({ orderId: viewOrder.id, status: "PENDING", title: "", eventDate: new Date().toISOString().split("T")[0], displayOrder: 0 }); setShowEventForm(true); }} className="flex items-center gap-1 text-sm text-[#FF6500] font-semibold">
                  <PlusCircle className="w-4 h-4" />Ajouter
                </button>
              </div>

              {showEventForm && (
                <form onSubmit={handleEvent(onAddEvent)} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold mb-1">Statut *</label>
                      <select {...regEvent("status")} className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#FF6500] focus:outline-none">
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select></div>
                    <div><label className="block text-xs font-semibold mb-1">Date *</label>
                      <input {...regEvent("eventDate")} type="date" className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                  </div>
                  <div><label className="block text-xs font-semibold mb-1">Titre *</label>
                    <input {...regEvent("title")} className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold mb-1">Localisation</label>
                      <input {...regEvent("location")} className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                    <div><label className="block text-xs font-semibold mb-1">Commentaire</label>
                      <input {...regEvent("description")} className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowEventForm(false)} className="px-3 py-1.5 border rounded-lg text-xs">Annuler</button>
                    <button type="submit" disabled={eventSubmitting} className="px-3 py-1.5 bg-[#FF6500] text-white rounded-lg text-xs disabled:opacity-50">
                      {eventSubmitting ? "..." : "Ajouter"}
                    </button>
                  </div>
                </form>
              )}

              {viewOrder.trackingEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun événement</p>
              ) : (
                <div className="space-y-2">
                  {viewOrder.trackingEvents.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm">{e.title}</p>
                        <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                          <span>{formatDate(e.eventDate)}</span>
                          {e.location && <span>📍 {e.location}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEvent(e.id)} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Suivi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Destination</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-[#FF6500] font-bold">{order.trackingNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-black">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.destinationCity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewOrder(order)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Voir / Suivi">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => { setEditing(order); reset({ trackingNumber: order.trackingNumber, customerName: order.customerName, customerPhone: order.customerPhone, customerEmail: order.customerEmail || "", storeName: order.storeName || "", storeOrderNumber: order.storeOrderNumber || "", internalNotes: order.internalNotes || "", status: order.status, destinationCity: order.destinationCity, destinationCountry: order.destinationCountry, amount: order.amount ?? undefined, packageCount: order.packageCount ?? undefined, weight: order.weight ?? undefined, orderDate: new Date(order.orderDate).toISOString().split("T")[0] }); setShowForm(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">Aucune commande trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
