import Image from "next/image";

/** Paris → Dakar / Abidjan flight lines, drawn when no hero image is set in Admin → Paramètres. */
function RouteArt() {
  // Rough geographic placement: Paris top right, Dakar west, Abidjan south.
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="hero-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#ffffff" opacity="0.08" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#hero-dots)" />
      <g fill="none" stroke="#D99A12" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round">
        <path d="M300 80 C 170 90, 80 170, 90 270" />
        <path d="M300 80 C 330 190, 300 280, 235 330" />
      </g>
      <g fill="#D99A12">
        <circle cx="300" cy="80" r="7" />
        <circle cx="90" cy="270" r="6" />
        <circle cx="235" cy="330" r="6" />
      </g>
      <g fill="none" stroke="#D99A12" opacity="0.35">
        <circle cx="300" cy="80" r="16" />
        <circle cx="90" cy="270" r="14" />
        <circle cx="235" cy="330" r="14" />
      </g>
      <g fill="#ffffff" fontWeight="800" fontSize="15" letterSpacing="3">
        <text x="300" y="52" textAnchor="middle">PARIS</text>
        <text x="90" y="305" textAnchor="middle">DAKAR</text>
        <text x="235" y="365" textAnchor="middle">ABIDJAN</text>
      </g>
      {/* Plane on the Paris → Abidjan line */}
      <path
        d="M0 -9 L3 -2 L11 2 L11 4 L3 2 L2 8 L5 10 L5 11 L0 10 L-5 11 L-5 10 L-2 8 L-3 2 L-11 4 L-11 2 L-3 -2 Z"
        fill="#ffffff"
        transform="translate(303 227) rotate(196)"
      />
    </svg>
  );
}

export function HeroVisual({ image }: { image?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-[#121620] ring-1 ring-white/10 aspect-square ${
        image ? "" : "hidden lg:block"
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          loading="eager"
          sizes="(min-width: 1280px) 540px, (min-width: 1024px) 44vw, 92vw"
          className="object-cover"
        />
      ) : (
        <RouteArt />
      )}
    </div>
  );
}
