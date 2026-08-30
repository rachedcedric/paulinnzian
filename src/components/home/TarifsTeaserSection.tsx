import Link from "next/link";
import { TrendingDown, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { DEVIS_FCFA_PER_EUR, formatFcfa } from "@/lib/devis";
import type { ShippingRate } from "@/types";

export function TarifsTeaserSection({ shippingRates }: { shippingRates: ShippingRate[] }) {
  const standardRate = shippingRates.find(
    (rate) => rate.pricingType === "PER_KG" && rate.price !== null
  );

  return (
    <section className="bg-[#FAFAF8] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-3">Nos tarifs transparents</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Aucun frais caché. Vous payez uniquement le montant réel de vos achats selon le taux affiché.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[#090B10] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#D99A12]/15 rounded-full" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#D99A12]/15 flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-[#D99A12]" />
              </div>
              <p className="text-4xl font-black mb-1">
                1 € = <span className="text-[#D99A12]">{DEVIS_FCFA_PER_EUR}</span> FCFA
              </p>
              <p className="text-gray-400 text-sm">Toutes les boutiques incluses</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-[#D99A12]/10 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#D99A12]" />
            </div>
            <p className="text-4xl font-black text-black mb-1">
              {standardRate?.price ? formatFcfa(standardRate.price) : "9 800 FCFA"}
              <span className="text-base font-bold text-gray-500"> / kg</span>
            </p>
            <p className="text-gray-500 text-sm">Expédition Paris → Abidjan &amp; Dakar</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4 text-[#D99A12]" />
            Aucun frais caché, aucune commission cachée.
          </p>
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] text-white font-bold px-6 py-3 rounded-full text-sm transition-all"
          >
            Voir tous nos tarifs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
