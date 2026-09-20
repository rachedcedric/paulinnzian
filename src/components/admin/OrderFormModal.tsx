"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createOrder, updateOrder } from "@/actions/admin";
import { orderSchema, type OrderFormData } from "@/lib/validations";
import { ORDER_STATUS_LABELS } from "@/types";
import type { Order } from "@/types";
import { formatDateInput } from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const input =
  "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none";

function defaultsFor(order: Order | null): Partial<OrderFormData> {
  if (!order) {
    return {
      status: "PENDING",
      destinationCountry: "Côte d'Ivoire",
      destinationCity: "Abidjan",
      orderDate: formatDateInput(),
    };
  }
  return {
    trackingNumber: order.trackingNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail || "",
    storeName: order.storeName || "",
    storeOrderNumber: order.storeOrderNumber || "",
    internalNotes: order.internalNotes || "",
    status: order.status,
    destinationCity: order.destinationCity,
    destinationCountry: order.destinationCountry,
    amount: order.amount ?? undefined,
    packageCount: order.packageCount ?? undefined,
    orderDate: new Date(order.orderDate).toISOString().split("T")[0],
  };
}

interface Props {
  editing: Order | null;
  onClose: () => void;
  onSaved: () => void;
}

export function OrderFormModal({ editing, onClose, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(orderSchema) as any,
    defaultValues: defaultsFor(editing),
  });

  useEffect(() => {
    reset(defaultsFor(editing));
  }, [editing, reset]);

  async function onSubmit(data: OrderFormData) {
    const result = editing ? await updateOrder(editing.id, data) : await createOrder(data);
    if (result.success) {
      toast.success(editing ? "Commande modifiée" : "Commande créée");
      onSaved();
    } else {
      toast.error(result.error || "Erreur");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black">{editing ? "Modifier" : "Créer"} une commande</h2>
          <button onClick={onClose} aria-label="Fermer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Numéro de suivi *</label>
              <input {...register("trackingNumber")} placeholder="PNZ-2026-001245" className={input} />
              {errors.trackingNumber && <p className="text-red-500 text-xs">{errors.trackingNumber.message}</p>}</div>
            <div><label className="block text-xs font-semibold mb-1">Statut *</label>
              <select {...register("status")} className={input}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Nom client *</label>
              <input {...register("customerName")} className={input} /></div>
            <div><label className="block text-xs font-semibold mb-1">Téléphone *</label>
              <input {...register("customerPhone")} className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Email</label>
              <input {...register("customerEmail")} type="email" className={input} /></div>
            <div><label className="block text-xs font-semibold mb-1">Boutique</label>
              <input {...register("storeName")} className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Numéro commande boutique</label>
              <input {...register("storeOrderNumber")} className={input} /></div>
            <div><label className="block text-xs font-semibold mb-1">Date de commande</label>
              <input {...register("orderDate")} type="date" className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Montant (FCFA)</label>
              <input {...register("amount")} type="number" className={input} /></div>
            <div><label className="block text-xs font-semibold mb-1">Nb colis</label>
              <input {...register("packageCount")} type="number" className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Ville destination *</label>
              <input {...register("destinationCity")} className={input} /></div>
            <div><label className="block text-xs font-semibold mb-1">Pays *</label>
              <input {...register("destinationCountry")} className={input} /></div>
          </div>
          <div><label className="block text-xs font-semibold mb-1">Notes internes</label>
            <textarea {...register("internalNotes")} rows={2} className={`${input} resize-none`} /></div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-semibold">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#D99A12] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {isSubmitting ? "..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
