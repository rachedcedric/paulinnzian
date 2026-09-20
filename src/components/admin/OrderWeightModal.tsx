"use client";

import { useState } from "react";
import { Scale, X } from "lucide-react";
import { toast } from "sonner";
import { updateOrderWeight } from "@/actions/admin";
import { calculateWeightCharge } from "@/lib/order-list";
import { formatDateInput } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  order: Order;
  weightRate: number;
  onClose: () => void;
  onSaved: () => void;
}

const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const input = "mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D99A12]";

export function OrderWeightModal({ order, weightRate, onClose, onSaved }: Props) {
  const [weight, setWeight] = useState(order.weight?.toString() ?? "");
  const [weightAddedAt, setWeightAddedAt] = useState(formatDateInput(order.weightAddedAt ?? new Date()));
  const [saving, setSaving] = useState(false);
  const numericWeight = Number(weight);
  const charge = calculateWeightCharge(numericWeight, weightRate);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await updateOrderWeight({ orderId: order.id, weight, weightAddedAt });
    setSaving(false);

    if (result.success) {
      toast.success("Frais de transport enregistrés");
      onSaved();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="weight-modal-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="weight-modal-title" className="font-black text-gray-900">Frais de transport au kg</h2>
            <p className="mt-1 font-mono text-sm text-[#D99A12]">{order.trackingNumber}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-xs font-semibold text-gray-600">
            Poids réel (kg)
            <input
              type="number"
              min="0.01"
              max="100000"
              step="0.01"
              required
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="Ex. 1,3"
              className={input}
            />
          </label>

          <label className="block text-xs font-semibold text-gray-600">
            Date d&apos;ajout du poids
            <input
              type="date"
              required
              value={weightAddedAt}
              onChange={(event) => setWeightAddedAt(event.target.value)}
              className={input}
            />
          </label>

          <div className="flex items-center gap-3 border-y border-gray-100 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {Number.isFinite(numericWeight) && numericWeight > 0 ? `${Math.ceil(numericWeight)} kg facturé(s)` : "Poids à renseigner"}
                {weightRate > 0 && ` × ${numberFormat.format(weightRate)} FCFA`}
              </p>
              <p className="text-xl font-black text-gray-900">{numberFormat.format(charge)} FCFA</p>
            </div>
          </div>

          {weightRate <= 0 && <p className="text-xs font-medium text-red-600">Aucun tarif actif par kilogramme n&apos;est configuré.</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700">Annuler</button>
            <button type="submit" disabled={saving || weightRate <= 0} className="flex-1 rounded-xl bg-[#D99A12] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#C8912D] disabled:opacity-50">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}