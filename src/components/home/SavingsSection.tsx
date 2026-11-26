import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { DEVIS_FCFA_PER_EUR, formatFcfa } from "@/lib/devis";
import type { ShippingRate } from "@/types";
import { PriceTicket } from "./PriceTicket";
import type { PerKgRate } from "./HeroSection";

const COMPARISON = [
  { label: "Commission sur le panier", others: "Oui", mine: "0 FCFA" },
  { label: "Frais cachés", others: "Oui", mine: "Aucun" },
  { label: "Taux de change", others: "Variable", mine: `1 € = ${DEVIS_FCFA_PER_EUR} FCFA` },
  { label: "Tarifs", others: "Peu transparents", mine: "100 % transparents" },
];

function ratePrice(rate: ShippingRate): string | null {
  if (rate.pricingType === "PER_KG" && rate.price !== null) return `${formatFcfa(rate.price)} / kg`;
  if (rate.pricingType === "PERCENTAGE" && rate.percentage !== null) return `${rate.percentage} % de la valeur`;
  return null;
}

export function SavingsSection({
  shippingRates,
  perKgRate,
}: {
  shippingRates: ShippingRate[];
  perKgRate: PerKgRate | null;
}) {
  const rates = shippingRates.flatMap((rate) => {
    const price = ratePrice(rate);
    return price ? [{ ...rate, priceLabel: price }] : [];
  });

  return (
    <section aria-labelledby="savings-title" className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep sm:text-sm">Le vrai prix, sans surprise</p>
          <h2 id="savings-title" className="mt-3 text-3xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
            Pourquoi mes clients <span className="font-display font-normal italic text-gold-deep">économisent</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
            Vous payez le prix affiché par la boutique, converti au taux unique de 1 € = {DEVIS_FCFA_PER_EUR} FCFA.
            Pas de commission, pas de frais cachés : faites le calcul.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
          <PriceTicket perKgRate={perKgRate} />

          <div className="space-y-10">
            <div className="overflow-hidden rounded-3xl ring-1 ring-black/10">
              <table className="w-full border-collapse text-left text-sm sm:text-base">
                <caption className="sr-only">Comparaison entre les autres prestataires et mon service</caption>
                <thead>
                  <tr>
                    <td className="bg-white" />
                    <th scope="col" className="bg-white px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 sm:px-5">
                      Ailleurs
                    </th>
                    <th scope="col" className="bg-ink px-3 py-4 text-xs font-bold uppercase tracking-wider text-gold sm:px-5">
                      Avec moi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.label} className="border-t border-black/10">
                      <th scope="row" className="bg-white px-3 py-4 font-semibold text-ink sm:px-5">
                        {row.label}
                      </th>
                      <td className="bg-white px-3 py-4 text-gray-600 sm:px-5">
                        <span className="flex items-start gap-1.5">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                          {row.others}
                        </span>
                      </td>
                      <td className="border-t border-white/10 bg-ink px-3 py-4 font-bold text-white sm:px-5">
                        <span className="flex items-start gap-1.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                          {row.mine}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rates.length > 0 && (
              <div>
                <h3 className="text-xl font-black text-ink">Transport Paris → Abidjan &amp; Dakar</h3>
                <ul className="mt-4 divide-y divide-black/10 rounded-3xl bg-white ring-1 ring-black/10">
                  {rates.map((rate) => (
                    <li key={rate.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 p-5">
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="font-bold text-ink">{rate.name}</p>
                        {rate.description && <p className="mt-1 text-sm text-gray-700">{rate.description}</p>}
                        {rate.estimatedDelivery && (
                          <p className="mt-1 text-sm font-semibold text-gold-deep">{rate.estimatedDelivery}</p>
                        )}
                      </div>
                      <p className="whitespace-nowrap text-xl font-black tabular-nums text-ink">{rate.priceLabel}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/tarifs"
                  className="mt-5 inline-flex items-center gap-2 font-bold text-ink underline underline-offset-4 hover:text-gold-deep"
                >
                  Voir tous les tarifs
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
