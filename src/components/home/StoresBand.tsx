import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEVIS_FCFA_PER_EUR } from "@/lib/devis";
import type { Store } from "@/types";

export function StoresBand({ stores }: { stores: Store[] }) {
  if (stores.length === 0) return null;

  return (
    <section aria-labelledby="stores-title" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep sm:text-sm">
            {stores.length} boutiques, un seul taux
          </p>
          <h2 id="stores-title" className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Toutes vos boutiques préférées
          </h2>
          <p className="mt-3 text-gray-700">
            Mode, beauté, sport, high-tech, maison : commandez sur vos sites préférés en Europe, toujours au même
            taux de 1 € = {DEVIS_FCFA_PER_EUR} FCFA.
          </p>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
          {stores.map((store) => (
            <li key={store.id}>
              <a
                href={store.websiteUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="group flex min-h-11 items-center gap-2 rounded-full bg-cream px-4 py-2 ring-1 ring-black/10 transition-colors hover:bg-ink"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                  {store.logo ? (
                    <Image src={store.logo} alt="" width={18} height={18} className="h-full w-full object-contain" />
                  ) : (
                    <span aria-hidden className="text-[11px] font-black text-ink">
                      {store.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap text-sm font-bold text-ink transition-colors group-hover:text-white">
                  {store.name}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/boutiques"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-gold-premium"
          >
            Voir toutes les boutiques
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
