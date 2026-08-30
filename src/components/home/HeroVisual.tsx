import Image from "next/image";
import { Plane } from "lucide-react";
import { DEVIS_FCFA_PER_EUR } from "@/lib/devis";
import type { Store } from "@/types";

const FEATURED_NAMES = ["SHEIN", "Zara", "H&M", "Nike", "Sephora", "Amazon"];
const BAG_COLORS = [
  "bg-[#090B10] text-white",
  "bg-white text-black border border-gray-200",
  "bg-[#D99A12] text-white",
  "bg-white text-black border border-gray-200",
  "bg-[#071225] text-white",
  "bg-white text-black border border-gray-200",
];

function EiffelTower() {
  return (
    <svg viewBox="0 0 200 340" className="absolute inset-x-0 bottom-10 mx-auto h-[85%] w-auto opacity-90" aria-hidden="true">
      <g fill="#090B10">
        <path d="M15,330 L42,330 L96,46 L88,46 Z" />
        <path d="M158,330 L185,330 L112,46 L104,46 Z" />
        <path d="M88,46 L96,46 L100,10 L104,46 L112,46 L100,26 Z" />
        <rect x="50" y="206" width="100" height="7" rx="2" />
        <rect x="72" y="106" width="56" height="6" rx="2" />
      </g>
      <g stroke="#D99A12" strokeWidth="1.5" opacity="0.7">
        <path d="M42,330 L100,206 M158,330 L100,206" fill="none" />
        <path d="M50,213 L100,106 M150,213 L100,106" fill="none" />
      </g>
    </svg>
  );
}

export function HeroVisual({ stores, image }: { stores: Store[]; image?: string }) {
  const featured = FEATURED_NAMES.map((name) =>
    stores.find((s) => s.name.toLowerCase() === name.toLowerCase())
  ).filter((s): s is Store => Boolean(s));

  return (
    <div className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] xl:aspect-[16/12]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          {/* Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#BFE3F5] via-[#DCEEF7] to-[#FAFAF8]" />
          <div className="absolute top-6 right-10 w-24 h-24 rounded-full bg-white/50 blur-2xl" />
          <div className="absolute top-16 left-8 w-16 h-16 rounded-full bg-white/60 blur-xl" />

          {/* Plane + trail */}
          <div className="absolute top-10 left-6 sm:top-14 sm:left-10 flex items-center gap-2">
            <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-white/80" />
            <Plane className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-md rotate-[35deg]" fill="white" />
          </div>

          <EiffelTower />
        </>
      )}

      {/* Bottom scrim for legibility of the shopping bags row */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-[#071225]/80 to-transparent" />

      {/* Shopping bags row */}
      {featured.length > 0 && (
        <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 flex items-end justify-center gap-1.5 sm:gap-2.5 px-3">
          {featured.map((store, i) => (
            <div
              key={store.id}
              className={`flex flex-col items-center gap-1 rounded-xl sm:rounded-2xl shadow-lg px-2 sm:px-3 py-2 sm:py-3 ${BAG_COLORS[i % BAG_COLORS.length]}`}
              style={{ transform: `translateY(${i % 2 === 0 ? "0px" : "-8px"})` }}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 flex items-center justify-center overflow-hidden shrink-0">
                {store.logo ? (
                  <Image src={store.logo} alt="" width={20} height={20} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-[10px] font-black text-black">{store.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-[9px] sm:text-[11px] font-black tracking-tight whitespace-nowrap">
                {store.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Rate badge */}
      <div className="absolute top-4 right-3 sm:top-6 sm:right-6 rotate-3">
        <div className="relative bg-white rounded-2xl shadow-xl border-2 border-[#D99A12] px-4 py-3 sm:px-5 sm:py-4">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D99A12] text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap">
            Taux unique
          </span>
          <p className="text-lg sm:text-2xl font-black text-[#090B10] leading-none mt-1.5 whitespace-nowrap">
            1 € = {DEVIS_FCFA_PER_EUR}
            <span className="text-xs sm:text-sm font-bold"> FCFA</span>
          </p>
          <p className="text-[9px] sm:text-[11px] text-gray-500 mt-1 whitespace-nowrap">Toutes les boutiques incluses</p>
        </div>
      </div>
    </div>
  );
}
