"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateExchangeRate, updateShippingRate } from "@/actions/admin";
import { Save } from "lucide-react";
import type { ExchangeRate, ShippingRate } from "@/types";

export function TarifsAdmin({
  exchangeRates,
  shippingRates,
}: {
  exchangeRates: ExchangeRate[];
  shippingRates: ShippingRate[];
}) {
  const [rates, setRates] = useState(exchangeRates);
  const [shipping, setShipping] = useState(shippingRates);

  async function saveExchangeRate(id: string, rate: number, description: string) {
    const result = await updateExchangeRate(id, rate, description);
    if (result.success) {
      toast.success("Taux mis à jour");
    } else {
      toast.error("Erreur");
    }
  }

  async function saveShippingRate(
    id: string,
    data: { price?: number; percentage?: number; estimatedDelivery?: string; description?: string }
  ) {
    const result = await updateShippingRate(id, data);
    if (result.success) {
      toast.success("Tarif mis à jour");
    } else {
      toast.error("Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-black text-black">Tarifs</h1>
        <p className="text-gray-500 text-sm">Gérez les taux de change et tarifs d'expédition.</p>
      </div>

      {/* Exchange rates */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-black text-black text-lg mb-6">Taux de change</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {rates.map((rate) => (
            <ExchangeRateCard key={rate.id} rate={rate} onSave={saveExchangeRate} />
          ))}
        </div>
      </div>

      {/* Shipping rates */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-black text-black text-lg mb-6">Tarifs d'expédition</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {shipping.map((rate) => (
            <ShippingRateCard key={rate.id} rate={rate} onSave={saveShippingRate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExchangeRateCard({
  rate,
  onSave,
}: {
  rate: ExchangeRate;
  onSave: (id: string, rate: number, description: string) => Promise<void>;
}) {
  const [value, setValue] = useState(rate.rate);
  const [desc, setDesc] = useState(rate.description || "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-black mb-4">{rate.name}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Taux (FCFA par €)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
          />
        </div>
        <button
          onClick={async () => { setSaving(true); await onSave(rate.id, value, desc); setSaving(false); }}
          disabled={saving}
          className="flex items-center gap-2 bg-[#FF6500] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function ShippingRateCard({
  rate,
  onSave,
}: {
  rate: ShippingRate;
  onSave: (id: string, data: { price?: number; percentage?: number; estimatedDelivery?: string; description?: string }) => Promise<void>;
}) {
  const [price, setPrice] = useState(rate.price || 0);
  const [percentage, setPercentage] = useState(rate.percentage || 0);
  const [delivery, setDelivery] = useState(rate.estimatedDelivery || "");
  const [desc, setDesc] = useState(rate.description || "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-black mb-4">{rate.name}</h3>
      <div className="space-y-3">
        {rate.pricingType === "PER_KG" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Prix FCFA/kg</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
            />
          </div>
        )}
        {rate.pricingType === "PERCENTAGE" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pourcentage (%)</label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
            />
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Délai estimé</label>
          <input
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
          />
        </div>
        <button
          onClick={async () => {
            setSaving(true);
            await onSave(rate.id, {
              price: rate.pricingType === "PER_KG" ? price : undefined,
              percentage: rate.pricingType === "PERCENTAGE" ? percentage : undefined,
              estimatedDelivery: delivery,
              description: desc,
            });
            setSaving(false);
          }}
          disabled={saving}
          className="flex items-center gap-2 bg-[#FF6500] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
