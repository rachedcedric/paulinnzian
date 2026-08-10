"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, MapPin, CheckCircle, Circle, Clock } from "lucide-react";
import { trackOrder } from "@/actions/public";
import { ORDER_STATUS_LABELS } from "@/types";
import type { OrderStatus } from "@/types";
import { formatDate } from "@/lib/utils";

type TrackingOrder = {
  trackingNumber: string;
  customerName: string;
  destinationCity: string;
  destinationCountry: string;
  status: OrderStatus;
  orderDate: Date | string;
  updatedAt: Date | string;
  trackingEvents: {
    id: string;
    status: OrderStatus;
    title: string;
    description: string | null;
    location: string | null;
    eventDate: Date | string;
    displayOrder: number;
  }[];
};

export function TrackingClient() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    const result = await trackOrder(trackingNumber.trim());
    setLoading(false);

    if (result.success && result.order) {
      setOrder(result.order as TrackingOrder);
    } else {
      setError(result.error || "Erreur inconnue");
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Package className="w-12 h-12 text-[#FF6500] mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              SUIVRE VOTRE <span className="text-[#FF6500]">COMMANDE</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Entrez votre numéro de suivi pour connaître l'avancement de votre commande.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ex: PNZ-2026-001245"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6500] text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF6500] hover:bg-[#e55a00] disabled:opacity-50 text-white font-bold px-6 py-4 rounded-xl transition-colors whitespace-nowrap"
          >
            {loading ? "..." : "SUIVRE"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Order Result */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order info */}
            <div className="bg-[#F5F5F5] rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Numéro de suivi</p>
                  <p className="font-black text-xl text-[#FF6500]">{order.trackingNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-[#FF6500]/10 text-[#FF6500]`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Client</p>
                  <p className="font-semibold text-black">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Destination</p>
                  <p className="font-semibold text-black flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF6500]" />
                    {order.destinationCity}, {order.destinationCountry}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date commande</p>
                  <p className="font-semibold text-black">{formatDate(order.orderDate)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-black mb-6">Suivi de livraison</h3>
              <div className="space-y-0">
                {order.trackingEvents.length > 0 ? (
                  order.trackingEvents.map((event, i) => {
                    const isLast = i === order.trackingEvents.length - 1;
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isLast ? "bg-[#FF6500]" : "bg-gray-200"
                          }`}>
                            {isLast
                              ? <Circle className="w-4 h-4 text-white fill-white" />
                              : <CheckCircle className="w-4 h-4 text-white fill-gray-400" />
                            }
                          </div>
                          {!isLast && <div className="w-0.5 h-8 bg-gray-200 my-1" />}
                        </div>
                        <div className="pb-8 pt-1">
                          <p className={`font-bold ${isLast ? "text-[#FF6500]" : "text-black"}`}>
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(event.eventDate)}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Aucun événement de suivi pour l'instant.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
