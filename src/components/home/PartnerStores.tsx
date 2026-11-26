import Image from "next/image";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { Store } from "@/types";

// shortcut: partner (affiliate) stores are matched by name, add an "isFeatured" column if the list must become editable.
const PARTNER_NAMES = ["temu", "shein"];

/** Highlights the affiliate stores; each card opens the store URL set in Admin → Boutiques. */
export function PartnerStores({ stores }: { stores: Store[] }) {
  const partners = PARTNER_NAMES.flatMap((name) =>
    stores.filter((store) => store.name.trim().toLowerCase().startsWith(name)).slice(0, 1),
  );
  if (partners.length === 0) return null;

  return (
    <section aria-labelledby="partner-stores-title" className="bg-cream py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold-deep mb-2">
          Boutiques partenaires · France
        </p>
        <h2 id="partner-stores-title" className="text-center text-3xl sm:text-4xl font-black tracking-tight text-ink mb-8">
          Commandez sur {partners.map((store) => store.name).join(" & ")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {partners.map((store) => (
            <a
              key={store.id}
              href={store.websiteUrl}
              target="_blank"
              rel="sponsored noopener"
              className="group flex items-center gap-4 rounded-3xl border-2 border-gold/40 bg-white p-5 transition-all hover:border-ink hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-xl bg-[#FAFAF8] flex items-center justify-center overflow-hidden shrink-0">
                {store.logo ? (
                  <Image src={store.logo} alt="" width={56} height={56} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-xl font-black text-black">{store.name.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-lg font-black text-black">
                  {store.name}
                  <BadgeCheck className="w-4 h-4 text-gold-deep" aria-hidden />
                </p>
                <p className="text-sm text-gray-600">
                  {store.description || "Faites votre panier, je m'occupe de l'achat et de la livraison."}
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 shrink-0 text-gray-500 transition-colors group-hover:text-ink" aria-hidden />
              <span className="sr-only">(ouvre le site dans un nouvel onglet)</span>
            </a>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          Liens partenaires : une commission peut m&apos;être versée, sans frais supplémentaires pour vous.
        </p>
      </div>
    </section>
  );
}
