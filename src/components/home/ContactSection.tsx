"use client";

import { MapPin, MessageCircle, Phone } from "lucide-react";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";
import { CommunityLinks } from "@/components/layout/CommunityLinks";

/** Closing call to action, with every contact detail set in Admin → Paramètres. */
export function ContactSection() {
  const { whatsappUrl, whatsappNumber, phoneCi, addressParis, addressAbidjan } = useSiteConfig();
  const details = [
    { icon: MessageCircle, label: "WhatsApp", value: whatsappNumber, href: whatsappUrl, external: true },
    { icon: Phone, label: "Appels & SMS Côte d'Ivoire", value: phoneCi, href: `tel:${phoneCi.replace(/[^\d+]/g, "")}` },
    { icon: MapPin, label: "Bureau Paris", value: addressParis },
    { icon: MapPin, label: "Bureau Abidjan", value: addressAbidjan },
  ];

  return (
    <section
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-ink py-16 text-white sm:py-24 [--focus-ring:var(--gold)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-40 h-[30rem] w-[30rem] rounded-full bg-gold/15 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold sm:text-sm">Disponible 7j/7</p>
          <h2 id="contact-title" className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Envoyez vos liens, <span className="font-display font-normal italic text-gold">je m&apos;occupe du reste.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-300">
            Un message suffit : je vous donne le montant exact en FCFA, j&apos;achète, puis j&apos;expédie vos colis
            vers Abidjan et Dakar.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-ink transition hover:bg-gold-premium sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Écrire sur WhatsApp
            <span className="sr-only">(nouvel onglet)</span>
          </a>
          <CommunityLinks className="mt-4 max-w-xl sm:flex-row" />
        </div>

        <ul className="space-y-6 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          {details.map(({ icon: Icon, label, value, href, external }) => (
            <li key={label} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15">
                <Icon className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                {href ? (
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="font-semibold text-white underline-offset-4 hover:underline"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="font-semibold text-white">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
