"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, Trash2, PlusCircle } from "lucide-react";
import { addTrackingEvent, deleteTrackingEvent } from "@/actions/admin";
import { trackingEventSchema, type TrackingEventFormData } from "@/lib/validations";
import { ORDER_STATUS_LABELS } from "@/types";
import type { Order } from "@/types";
import { formatDate, formatDateInput } from "@/lib/utils";
import { countryFlag } from "@/lib/country-flag";
import { OrderStatusBadge } from "./OrderStatusBadge";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const input =
  "w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#D99A12] focus:outline-none";
const numberFormat = new Intl.NumberFormat("fr-FR");

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-900">{value ?? "Non renseigné"}</dd>
    </div>
  );
}

interface Props {
  order: Order;
  canManage: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function OrderTrackingModal({ order, canManage, onClose, onChanged }: Props) {
  const [showEventForm, setShowEventForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrackingEventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(trackingEventSchema) as any,
  });

  async function onAddEvent(data: TrackingEventFormData) {
    const result = await addTrackingEvent({ ...data, orderId: order.id });
    if (result.success) {
      toast.success("Événement ajouté");
      setShowEventForm(false);
      onChanged();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    const result = await deleteTrackingEvent(id);
    if (result.success) {
      toast.success("Supprimé");
      onChanged();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="order-details-title">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">Détails de la commande</p>
            <h2 id="order-details-title" className="font-mono text-lg font-black text-[#D99A12]">{order.trackingNumber}</h2>
          </div>
          <button onClick={onClose} aria-label="Fermer"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-6 space-y-5 border-y border-gray-100 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">{order.customerName}</p>
              <p className="text-sm text-gray-500">
                <span aria-hidden>{countryFlag(order.destinationCountry)}</span> {order.destinationCity}, {order.destinationCountry}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Téléphone" value={order.customerPhone} />
            <Detail label="Email" value={order.customerEmail} />
            <Detail label="Date de commande" value={formatDate(order.orderDate)} />
            <Detail label="Boutique" value={order.storeName} />
            <Detail label="N° commande boutique" value={order.storeOrderNumber} />
            <Detail label="Montant" value={order.amount != null ? `${numberFormat.format(order.amount)} FCFA` : null} />
            <Detail label="Nombre de colis" value={order.packageCount} />
            <Detail label="Poids" value={order.weight != null ? `${numberFormat.format(order.weight)} kg` : null} />
          </dl>

          {order.internalNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-400">Notes internes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{order.internalNotes}</p>
            </div>
          )}
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Événements de suivi</h3>
            {canManage && (
              <button
                onClick={() => {
                  reset({ orderId: order.id, status: "PENDING", title: "", eventDate: formatDateInput(), displayOrder: 0 });
                  setShowEventForm(true);
                }}
                className="flex items-center gap-1 text-sm text-[#D99A12] font-semibold"
              >
                <PlusCircle className="w-4 h-4" />Ajouter
              </button>
            )}
          </div>

          {showEventForm && (
            <form onSubmit={handleSubmit(onAddEvent)} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1">Statut *</label>
                  <select {...register("status")} className={input}>
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold mb-1">Date *</label>
                  <input {...register("eventDate")} type="date" className={input} />
                  {errors.eventDate && <p className="mt-1 text-xs text-red-500">Date invalide</p>}</div>
              </div>
              <div><label className="block text-xs font-semibold mb-1">Titre *</label>
                <input {...register("title")} className={input} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1">Localisation</label>
                  <input {...register("location")} className={input} /></div>
                <div><label className="block text-xs font-semibold mb-1">Commentaire</label>
                  <input {...register("description")} className={input} /></div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowEventForm(false)} className="px-3 py-1.5 border rounded-lg text-xs">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-[#D99A12] text-white rounded-lg text-xs disabled:opacity-50">
                  {isSubmitting ? "..." : "Ajouter"}
                </button>
              </div>
            </form>
          )}

          {order.trackingEvents.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun événement</p>
          ) : (
            <div className="space-y-2">
              {order.trackingEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-sm">{e.title}</p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                      <span>{formatDate(e.eventDate)}</span>
                      {e.location && <span>📍 {e.location}</span>}
                    </div>
                  </div>
                  {canManage && (
                    <button onClick={() => handleDeleteEvent(e.id)} className="p-1 hover:bg-red-50 rounded" aria-label="Supprimer l'événement">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
