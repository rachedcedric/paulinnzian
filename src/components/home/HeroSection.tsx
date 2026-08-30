"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Calculator, Crown, ShieldCheck, Truck, Headset } from "lucide-react";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";
import { HeroVisual } from "./HeroVisual";
import type { Store } from "@/types";

const ADVANTAGES = [
  {
    icon: Crown,
    title: "Zéro frais de commission",
    text: "Vous payez le prix exact de vos paniers.",
  },
  {
    icon: ShieldCheck,
    title: "Achats sécurisés",
    text: "Paiement sécurisé avec notre moyen de paiement.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    text: "Paris → Abidjan & Dakar.",
  },
  {
    icon: Headset,
    title: "Suivi personnalisé",
    text: "Du panier à la réception de vos colis.",
  },
];

export function HeroSection({ stores }: { stores: Store[] }) {
  const {
    whatsappUrl,
    heroEyebrow,
    heroTitle,
    heroTitleHighlight,
    heroTitleAfter,
    heroTagline,
    heroSubtitle,
    heroCtaPrimary,
    heroCtaSecondary,
    heroImage,
  } = useSiteConfig();

  return (
    <section className="relative overflow-hidden bg-[#FAFAF8] pt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#D99A12] mb-4">
              {heroEyebrow}
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-black mb-4">
              {heroTitle}{" "}
              <span className="font-display italic text-[#D99A12] font-normal">{heroTitleHighlight}</span>
              <br />
              {heroTitleAfter}
            </h1>

            <p className="font-script font-semibold text-2xl sm:text-3xl text-[#071225] mb-5">
              {heroTagline}
            </p>

            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:shadow-lg hover:scale-[1.02] min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#090B10]"
              >
                <MessageCircle className="w-5 h-5" />
                {heroCtaPrimary}
                <span aria-hidden="true">→</span>
              </a>
              <Link
                href="/devis-achat"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#090B10] text-[#090B10] hover:bg-[#090B10] hover:text-white font-bold px-8 py-4 rounded-full text-base transition-all min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D99A12]"
              >
                <Calculator className="w-5 h-5" />
                {heroCtaSecondary}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <HeroVisual stores={stores} image={heroImage} />
          </motion.div>
        </div>
      </div>

      {/* Avantages */}
      <div className="relative bg-[#090B10]/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {ADVANTAGES.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-2 sm:flex-row sm:text-left">
                <div className="w-10 h-10 rounded-full bg-[#D99A12]/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#D99A12]" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm leading-tight">{item.title}</p>
                  <p className="text-gray-400 text-[11px] sm:text-xs mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
