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
    <section aria-labelledby="partner-stores-title" className="bg-[#FAFAF8] py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#D99A12] mb-2">
          Boutiques partenaires · France
        </p>
        <h2 id="partner-stores-title" className="text-center text-2xl sm:text-3xl font-black text-black mb-8">
          Commandez sur {partners.map((store) => store.name).join(" & ")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {partners.map((store) => (
            <a
              key={store.id}
              href={store.websiteUrl}
              target="_blank"
              rel="sponsored noopener"
              className="group flex items-center gap-4 rounded-2xl border-2 border-[#D99A12]/30 bg-white p-5 transition-all hover:border-[#D99A12] hover:shadow-lg"
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
                  <BadgeCheck className="w-4 h-4 text-[#D99A12]" aria-hidden />
                </p>
                <p className="text-sm text-gray-500">
                  {store.description || "Faites votre panier, je m'occupe de l'achat et de la livraison."}
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 shrink-0 text-gray-400 transition-colors group-hover:text-[#D99A12]" aria-hidden />
              <span className="sr-only">(ouvre le site dans un nouvel onglet)</span>
            </a>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Liens partenaires : une commission peut m&apos;être versée, sans frais supplémentaires pour vous.
        </p>
      </div>
    </section>
  );
}
