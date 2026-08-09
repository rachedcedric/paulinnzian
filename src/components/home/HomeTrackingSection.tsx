"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, PackageSearch, Search } from "lucide-react";
import { trackOrder } from "@/actions/public";
import { ORDER_STATUS_LABELS } from "@/types";
import type { OrderStatus } from "@/types";

interface TrackingResult {
  trackingNumber: string;
  customerName: string;
  destinationCity: string;
  destinationCountry: string;
  status: OrderStatus;
}

export function HomeTrackingSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);
    const result = await trackOrder(trackingNumber);
    setLoading(false);

    if (result.success && result.order) {
      setOrder(result.order as TrackingResult);
      return;
    }
    setError(result.error ?? "Impossible de retrouver cette commande");
  }

  return (
    <section className="bg-black px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[#FF6500]">
            <PackageSearch className="h-5 w-5" />
            <span className="text-xs font-bold uppercase">Suivi en temps réel</span>
          </div>
          <h2 className="text-2xl font-black text-white sm:text-3xl">SUIVRE MA COMMANDE</h2>
          <p className="mt-2 max-w-md text-sm text-gray-400">
            Renseignez votre numéro de suivi pour connaître la position et le statut de votre commande.
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Ex : PNZ-2026-001245"
                aria-label="Numéro de suivi"
                className="h-14 w-full rounded-xl border border-white/15 bg-white pl-12 pr-4 text-black outline-none focus:border-[#FF6500]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-14 rounded-xl bg-[#FF6500] px-7 font-bold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-50"
            >
              {loading ? "Recherche..." : "Suivre"}
            </button>
          </form>

          {error && (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {order && (
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-400">{order.trackingNumber} · {order.customerName}</p>
                <p className="mt-1 font-bold text-white">{ORDER_STATUS_LABELS[order.status]}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3 text-[#FF6500]" />
                  {order.destinationCity}, {order.destinationCountry}
                </p>
              </div>
              <Link
                href="/suivi"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6500] hover:text-white"
              >
                Voir le suivi détaillé <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}