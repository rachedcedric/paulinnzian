"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";
import { DEVIS_FCFA_PER_EUR, convertEurToFcfa, formatEur, formatFcfa } from "@/lib/devis";
import { getWhatsAppLink } from "@/lib/utils";
import type { PerKgRate } from "./HeroSection";

const QUICK_AMOUNTS = [50, 100, 250];

/** Type a cart total in euros, read the FCFA price at once: the saving made concrete. */
export function PriceTicket({ perKgRate }: { perKgRate: PerKgRate | null }) {
  const { whatsappUrl } = useSiteConfig();
  const id = useId();
  const [amount, setAmount] = useState("100");
  const eur = Number.parseFloat(amount.replace(",", ".")) || 0;
  const fcfa = convertEurToFcfa(eur);
  const message =
    eur > 0
      ? `Bonjour Paulin, je souhaite commander un panier de ${formatEur(eur)} (soit ${formatFcfa(fcfa)} au taux de 1 € = ${DEVIS_FCFA_PER_EUR} FCFA). Voici mes liens :`
      : "Bonjour Paulin, je souhaite passer une commande. Voici mes liens :";

  const rows = [
    { label: "Converti au taux unique", value: `1 € = ${DEVIS_FCFA_PER_EUR} FCFA` },
    { label: "Commission", value: "0 FCFA" },
    { label: "Frais cachés", value: "0 FCFA" },
  ];

  return (
    <div className="overflow-hidden rounded-3xl bg-white text-ink shadow-xl shadow-black/10 ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white sm:px-7">
        <span>Votre ticket</span>
        <span className="text-gold">Zéro commission</span>
      </div>

      <div className="p-5 sm:p-7">
        <label htmlFor={`${id}-amount`} className="block text-base font-bold">
          Total de votre panier
        </label>
        <p id={`${id}-hint`} className="mt-0.5 text-sm text-gray-600">
          Le montant affiché par la boutique, livraison comprise.
        </p>
        <div className="relative mt-3">
          <input
            id={`${id}-amount`}
            inputMode="decimal"
            autoComplete="off"
            maxLength={7}
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ""))}
            aria-describedby={`${id}-hint`}
            className="h-16 w-full rounded-2xl border-2 border-ink bg-cream pl-5 pr-14 text-3xl font-black tabular-nums"
          />
          <span aria-hidden className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-black">
            €
          </span>
        </div>
        <div role="group" aria-label="Montants rapides" className="mt-3 flex gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(String(value))}
              aria-pressed={eur === value}
              className="min-h-11 flex-1 rounded-full border border-ink/25 text-sm font-bold transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white"
            >
              {value} €
            </button>
          ))}
        </div>

        <dl className="mt-6 space-y-2 border-t-2 border-dashed border-ink/15 pt-4 text-sm sm:text-base">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-2">
              <dt className="flex flex-1 items-baseline gap-2 text-gray-700">
                {row.label}
                <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-ink/25" />
              </dt>
              <dd className="font-bold tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t-2 border-ink pt-4">
          <span className="text-sm font-bold sm:text-base">Prix de votre panier</span>
          <output htmlFor={`${id}-amount`} className="text-3xl font-black tabular-nums sm:text-4xl">
            {formatFcfa(fcfa)}
          </output>
        </div>
        {perKgRate && (
          <p className="mt-2 text-sm text-gray-600">
            + transport {perKgRate.name.toLowerCase()} :{" "}
            <strong className="text-ink">{formatFcfa(perKgRate.price)}/kg</strong>, selon le poids de vos colis.
          </p>
        )}

        <a
          href={getWhatsAppLink(whatsappUrl, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-center text-base font-bold text-white transition-colors hover:bg-black"
        >
          <MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" aria-hidden />
          Commander ce panier
          {/* Hidden on small phones so the label stays on one line; the green icon already says WhatsApp. */}
          <span className="sr-only sm:not-sr-only">sur WhatsApp</span>
          <span className="sr-only">(nouvel onglet)</span>
        </a>
        <p className="mt-4 text-center text-sm">
          <Link href="/devis-achat" className="font-semibold underline underline-offset-4 hover:text-gold-deep">
            Plusieurs boutiques ? Faites un devis détaillé
          </Link>
        </p>
      </div>
    </div>
  );
}
