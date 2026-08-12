"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Package, Plane, MessageCircle, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";
import type { ExchangeRate } from "@/types";

function formatExchangeRate(rate?: ExchangeRate) {
  if (!rate) return "Non configuré";
  const source = rate.currencyFrom === "EUR" ? "€" : rate.currencyFrom;
  const target = rate.currencyTo === "XOF" ? "FCFA" : rate.currencyTo;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(rate.rate)} ${target}/${source}`;
}

export function HeroSection({ exchangeRates }: { exchangeRates: ExchangeRate[] }) {
  const { whatsappUrl, heroTitle, heroSubtitle } = useSiteConfig();
  const sheinRate = exchangeRates.find((rate) => rate.name.toLowerCase().includes("shein"));
  const otherRate = exchangeRates.find((rate) => rate.id !== sheinRate?.id);
  return (
    <section className="overflow-hidden bg-white pt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Content */}
          <motion.div
            initial={false}
          >
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-black mb-6">
              {heroTitle || <>ACHETEZ <span className="text-[#FF6500]">MOINS CHER</span> SUR VOS BOUTIQUES PRÉFÉRÉES.</>}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              {heroSubtitle || <>Votre Personal Shopper pour vos achats en Europe. Je valide vos commandes, réceptionne vos colis à Paris et organise leur réexpédition. <strong className="text-black">Vous payez le prix réel de votre panier, sans frais cachés ni commission.</strong></>}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["ZÉRO FRAIS CACHÉ", "ZÉRO COMMISSION", "SERVICE SÉCURISÉ"].map((badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1.5 bg-[#F5F5F5] text-black text-xs font-bold px-4 py-2 rounded-full"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF6500]" />
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:shadow-lg hover:shadow-green-200"
              >
                <MessageCircle className="w-5 h-5" />
                Commander sur WhatsApp
              </a>
              <Link
                href="/tarifs"
                className="inline-flex items-center justify-center gap-2 border-2 border-black text-black hover:bg-black hover:text-white font-bold px-8 py-4 rounded-full text-base transition-all"
              >
                <TrendingDown className="w-5 h-5" />
                Découvrir nos tarifs
              </Link>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={false}
            className="relative"
          >
            <div className="relative bg-[#F5F5F5] rounded-3xl p-8 lg:p-10 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#FF6500]/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FF6500]/5 rounded-full" />

              {/* Stats cards */}
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { icon: Package, label: "Boutiques disponibles", value: "26+" },
                  { icon: Plane, label: "Réexpédition vers", value: "Abidjan & +" },
                  { icon: TrendingDown, label: sheinRate?.name || "Taux SHEIN", value: formatExchangeRate(sheinRate) },
                  { icon: TrendingDown, label: otherRate?.name || "Autres boutiques", value: formatExchangeRate(otherRate) },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white rounded-2xl p-5 shadow-sm"
                  >
                    <stat.icon className="w-8 h-8 text-[#FF6500] mb-3" />
                    <p className="text-2xl font-black text-black">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Shopping flow illustration */}
              <div className="mt-6 bg-black rounded-2xl p-4 text-white text-center">
                <p className="text-xs text-gray-400 mb-1">Comment ça marche</p>
                <div className="flex items-center justify-center gap-2 text-sm font-bold">
                  <span>Lien produit</span>
                  <span className="text-[#FF6500]">→</span>
                  <span>Paiement</span>
                  <span className="text-[#FF6500]">→</span>
                  <span>Livraison</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
