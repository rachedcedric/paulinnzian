"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Package, Star, Cpu } from "lucide-react";
import type { ShippingRate } from "@/types";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";

const shippingIcons = [Package, Zap, Star, Cpu];

export function PricingClient({
  shippingRates,
}: {
  shippingRates: ShippingRate[];
}) {
  const { whatsappUrl } = useSiteConfig();
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              NOS <span className="text-[#D99A12]">TARIFS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Des tarifs transparents, sans frais cachés ni commission.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Shipping Rates */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-black text-black mb-3">
              TARIFS <span className="text-[#D99A12]">D'EXPÉDITION</span>
            </h2>
            <p className="text-gray-500 mb-8">De Paris vers votre destination.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingRates.map((rate, i) => {
              const Icon = shippingIcons[i % shippingIcons.length];
              return (
                <motion.div
                  key={rate.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-7 relative overflow-hidden ${
                    i === 0 ? "bg-black text-white" : "bg-[#F5F5F5]"
                  }`}
                >
                  {i === 0 && (
                    <div className="absolute top-0 right-0 bg-[#D99A12] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                      POPULAIRE
                    </div>
                  )}
                  <Icon className={`w-8 h-8 mb-4 ${i === 0 ? "text-[#D99A12]" : "text-[#D99A12]"}`} />
                  <h3 className={`font-black text-lg mb-2 ${i === 0 ? "text-white" : "text-black"}`}>
                    {rate.name}
                  </h3>
                  <div className="mb-3">
                    {rate.pricingType === "PER_KG" && rate.price !== null && (
                      <span className={`text-2xl font-black ${i === 1 ? "text-[#D99A12]" : "text-[#D99A12]"}`}>
                        {rate.price.toLocaleString("fr-FR")} FCFA
                        <span className={`text-sm font-normal ${i === 1 ? "text-gray-400" : "text-gray-500"}`}> /kg</span>
                      </span>
                    )}
                    {rate.pricingType === "PERCENTAGE" && rate.percentage !== null && (
                      <span className={`text-2xl font-black ${i === 1 ? "text-[#D99A12]" : "text-[#D99A12]"}`}>
                        {rate.percentage}%
                        <span className={`text-sm font-normal ${i === 1 ? "text-gray-400" : "text-gray-500"}`}> de la valeur</span>
                      </span>
                    )}
                  </div>
                  {rate.description && (
                    <p className={`text-sm mb-3 ${i === 1 ? "text-gray-400" : "text-gray-500"}`}>
                      {rate.description}
                    </p>
                  )}
                  {rate.estimatedDelivery && (
                    <div className={`text-xs font-semibold flex items-center gap-1 ${i === 1 ? "text-[#25D366]" : "text-gray-600"}`}>
                      <Zap className="w-3 h-3" />
                      {rate.estimatedDelivery}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#D99A12] rounded-3xl p-10 text-white text-center">
          <h3 className="text-2xl font-black mb-3">Prêt à commander ?</h3>
          <p className="mb-6 text-white/80">
            Envoyez vos liens produits et obtenez un devis immédiat.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#D99A12] font-bold px-8 py-4 rounded-full hover:shadow-lg transition-all"
          >
            Commander sur WhatsApp
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
