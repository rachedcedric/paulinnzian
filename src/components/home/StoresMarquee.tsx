"use client";

import Image from "next/image";
import type { Store } from "@/types";

interface Props {
  stores: Store[];
}

export function StoresMarquee({ stores }: Props) {
  const active = stores.filter((s) => s.isActive);
  // Tripler pour un défilement parfaitement continu quelle que soit la vitesse
  const items = [...active, ...active, ...active];

  return (
    <div className="bg-black py-5 overflow-hidden border-y border-gray-800">
      <p className="text-center text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">
        Nos boutiques partenaires
      </p>
      <div className="relative flex">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {items.map((store, i) => (
            <div
              key={`${store.id}-${i}`}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={store.name}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="font-black text-sm text-black">
                    {store.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-white text-[10px] font-semibold">{store.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
