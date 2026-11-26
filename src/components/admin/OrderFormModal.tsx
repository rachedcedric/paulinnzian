"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createOrder, updateOrder } from "@/actions/admin";
import { orderSchema, type OrderFormData } from "@/lib/validations";
import { ORDER_FORM_STATUSES, orderShippingFee } from "@/lib/order-list";
import { ORDER_STATUS_LABELS } from "@/types";
import type { Order, OrderStatus } from "@/types";
import { formatDateInput } from "@/lib/utils";

export interface KgRateOption {
  id: string;
  name: string;
  price: number;
}

const nf = new Intl.NumberFormat("fr-FR");
const input =
  "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none";

function defaultsFor(order: Order | null, kgRates: KgRateOption[], nextTrackingNumber: string): Partial<OrderFormData> {
  if (!order) {
    return {
      trackingNumber: nextTrackingNumber,
      status: "PURCHASED",
      articleType: "STANDARD",
      shippingRateId: kgRates[0]?.id ?? "",
      destinationCountry: "Côte d'Ivoire",
      destinationCity: "Abidjan",
      orderDate: formatDateInput(),
    };
  }
  return {
    trackingNumber: order.trackingNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    // No email field any more; kept so editing an older order does not erase its stored email.
    customerEmail: order.customerEmail || "",
    storeName: order.storeName || "",
    storeOrderNumber: order.storeOrderNumber || "",
    internalNotes: order.internalNotes || "",
    status: order.status,
    articleType: order.articleType,
    // "" keeps the price frozen on the order when it matches no current tariff.
    shippingRateId:
      kgRates.find((rate) => rate.price === order.kgRate)?.id ?? (order.kgRate == null ? kgRates[0]?.id ?? "" : ""),
    destinationCity: order.destinationCity,
    destinationCountry: order.destinationCountry,
    amount: order.amount ?? undefined,
    packageCount: order.packageCount ?? undefined,
    orderDate: new Date(order.orderDate).toISOString().split("T")[0],
  };
}

interface Props {
  editing: Order | null;
  kgRates: KgRateOption[];
  luxePercent: number | null;
  nextTrackingNumber: string;
  onClose: () => void;
  onSaved: () => void;
}

/** Mounted only while open, so the defaults (next tracking number included) are fresh each time. */
export function OrderFormModal({ editing, kgRates, luxePercent, nextTrackingNumber, onClose, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(orderSchema) as any,
    defaultValues: defaultsFor(editing, kgRates, nextTrackingNumber),
  });

  const articleType = useWatch({ control, name: "articleType" });
  const amount = Number(useWatch({ control, name: "amount" })) || null;

  // Old orders may carry "En attente"/"Annulé": keep their status selectable so an edit never changes it silently.
  const statusOptions: OrderStatus[] = [...ORDER_FORM_STATUSES];
  if (editing && !statusOptions.includes(editing.status)) statusOptions.unshift(editing.status);

  const percent = (editing?.articleType === "LUXE" ? editing.luxePercent : null) ?? luxePercent;
  const luxeFee = orderShippingFee({ articleType: "LUXE", amount, weight: null, kgRate: null, luxePercent: percent });
  const frozenRate =
    editing && editing.kgRate != null && !kgRates.some((rate) => rate.price === editing.kgRate) ? editing.kgRate : null;

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
            <div><label htmlFor="order-tracking" className="block text-xs font-semibold mb-1">Numéro de suivi *</label>
              <input id="order-tracking" {...register("trackingNumber")} placeholder="ABJ-2026-001" className={input} />
              {errors.trackingNumber && <p className="text-red-500 text-xs">{errors.trackingNumber.message}</p>}</div>
            <div><label htmlFor="order-status" className="block text-xs font-semibold mb-1">Statut *</label>
              <select id="order-status" {...register("status")} className={input}>
                {statusOptions.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label htmlFor="order-article-type" className="block text-xs font-semibold mb-1">Type d&apos;articles *</label>
              <select id="order-article-type" {...register("articleType")} className={input}>
                <option value="STANDARD">Standard — facturé au kg</option>
                <option value="LUXE" disabled={percent == null}>
                  Luxe — {percent != null ? `${nf.format(percent)} % du montant` : "aucun tarif actif"}
                </option>
              </select></div>
            {articleType === "LUXE" ? (
              <div>
                <p className="block text-xs font-semibold mb-1">Frais de transport</p>
                <p className={`${input} bg-gray-50 text-gray-700`}>
                  {luxeFee > 0 ? `${nf.format(luxeFee)} FCFA` : "Saisissez le montant"}
                  <span className="text-gray-400"> · {percent != null ? nf.format(percent) : "—"} % du montant</span>
                </p>
              </div>
            ) : (
              <div><label htmlFor="order-kg-rate" className="block text-xs font-semibold mb-1">Tarif au kg *</label>
                <select id="order-kg-rate" {...register("shippingRateId")} className={input}>
                  {frozenRate != null && <option value="">Tarif enregistré — {nf.format(frozenRate)} FCFA/kg</option>}
                  {kgRates.map((rate) => (
                    <option key={rate.id} value={rate.id}>{rate.name} — {nf.format(rate.price)} FCFA/kg</option>
                  ))}
                </select>
                {kgRates.length === 0 && <p className="text-red-500 text-xs">Aucun tarif au kg actif (voir Tarifs).</p>}</div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Nom client *</label>
              <input {...register("customerName")} className={input} /></div>
            <div><label className="block text-xs font-semibold mb-1">Téléphone *</label>
              <input {...register("customerPhone")} className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1">Boutique</label>
              <input {...register("storeName")} className={input} /></div>
            <div><label className="block text-xs font-semibold mb-1">Numéro commande boutique</label>
              <input {...register("storeOrderNumber")} className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
