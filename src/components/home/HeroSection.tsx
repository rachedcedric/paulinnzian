"use client";

import Link from "next/link";
import { MessageCircle, Calculator, PackageSearch } from "lucide-react";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";
import { DEVIS_FCFA_PER_EUR, formatFcfa } from "@/lib/devis";
import { HeroVisual } from "./HeroVisual";

export interface PerKgRate {
  name: string;
  price: number;
}

/** The three numbers that make the price: shown as a receipt so the saving reads in one glance. */
function PriceReceipt({ perKgRate }: { perKgRate: PerKgRate | null }) {
  const lines = [
    { label: "Commission sur votre panier", value: "0 FCFA" },
    { label: "Taux unique, toutes boutiques", value: `1 € = ${DEVIS_FCFA_PER_EUR} FCFA` },
    ...(perKgRate
      ? [{ label: `Transport ${perKgRate.name.toLowerCase()} vers Abidjan & Dakar`, value: `${formatFcfa(perKgRate.price)}/kg` }]
      : []),
  ];

  return (
    <dl className="mt-7 max-w-xl border-y border-dashed border-white/25 py-3">
      {lines.map((line) => (
        <div key={line.label} className="flex items-baseline gap-2 py-1.5">
          <dt className="flex flex-1 items-baseline gap-2 text-sm text-gray-300 sm:text-base">
            {line.label}
            <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-white/30" />
          </dt>
          <dd className="shrink-0 text-base font-black tabular-nums text-gold sm:text-lg">{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HeroSection({ perKgRate }: { perKgRate: PerKgRate | null }) {
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
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-ink pt-20 text-white [--focus-ring:var(--gold)]"
    >
      {/* Soft gold glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-20 lg:pt-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold sm:text-sm">{heroEyebrow}</p>

          <h1
            id="hero-title"
            className="mt-4 text-[2.5rem] font-black leading-[1.04] tracking-tight sm:text-6xl xl:text-7xl"
          >
            {heroTitle} <span className="font-display font-normal italic text-gold">{heroTitleHighlight}</span>{" "}
            {heroTitleAfter}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">{heroSubtitle}</p>

          <PriceReceipt perKgRate={perKgRate} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-bold text-ink transition hover:bg-gold-premium hover:shadow-lg hover:shadow-gold/20"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              {heroCtaPrimary}
              <span className="sr-only">(WhatsApp, nouvel onglet)</span>
            </a>
            <Link
              href="/devis-achat"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-white/80 px-7 py-4 text-base font-bold text-white transition hover:bg-white hover:text-ink"
            >
              <Calculator className="h-5 w-5" aria-hidden />
              {heroCtaSecondary}
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <p className="font-script text-2xl font-semibold leading-tight text-gold">{heroTagline}</p>
            <Link
              href="/suivi"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gray-300 underline underline-offset-4 hover:text-white"
            >
              <PackageSearch className="h-4 w-4" aria-hidden />
              Déjà client ? Suivre mon colis
            </Link>
          </div>
        </div>

        <HeroVisual image={heroImage} />
      </div>
    </section>
  );
}
