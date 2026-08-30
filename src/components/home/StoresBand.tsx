import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Store } from "@/types";

export function StoresBand({ stores }: { stores: Store[] }) {
  if (stores.length === 0) return null;

  return (
    <section className="bg-white py-10 sm:py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">
          Vos boutiques préférées, un seul taux
        </p>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {stores.map((store) => (
            <a
              key={store.id}
              href={store.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-[#FAFAF8] hover:bg-[#090B10] rounded-full px-4 py-2.5 shrink-0 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                {store.logo ? (
                  <Image src={store.logo} alt="" width={18} height={18} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-[10px] font-black text-black">{store.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-sm font-bold text-black group-hover:text-white transition-colors whitespace-nowrap">
                {store.name}
              </span>
            </a>
          ))}
          <Link
            href="/boutiques"
            className="flex items-center gap-1.5 bg-[#D99A12] hover:bg-[#C8912D] text-white rounded-full px-4 py-2.5 shrink-0 text-sm font-bold transition-colors whitespace-nowrap"
          >
            Toutes les boutiques en ligne
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
