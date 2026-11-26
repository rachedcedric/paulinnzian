import Link from "next/link";
import { Link as LinkIcon, CreditCard, Plane, PackageCheck, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: LinkIcon,
    title: "Partagez vos liens",
    description: "Envoyez-moi sur WhatsApp vos paniers ou liens d'articles, depuis les boutiques de votre choix.",
  },
  {
    icon: CreditCard,
    title: "J'achète pour vous",
    description: "Je valide vos commandes avec mon moyen de paiement, sans frais cachés ni commission.",
  },
  {
    icon: Plane,
    title: "Expédition depuis Paris",
    description: "Vos colis sont regroupés et expédiés vers Abidjan et Dakar en toute sécurité.",
  },
  {
    icon: PackageCheck,
    title: "Vous recevez",
    description: "Vous suivez votre commande en ligne jusqu'à la réception de vos colis.",
  },
];

const trustPoints = [
  "Plus de 6 ans d'expérience",
  "De nombreux clients accompagnés",
  "Service rapide et professionnel",
  "Votre satisfaction est une priorité",
];

export function HowToOrderSection() {
  return (
    <section aria-labelledby="how-title" className="bg-ink py-16 text-white sm:py-20 [--focus-ring:var(--gold)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold sm:text-sm">Simple comme un message</p>
            <h2 id="how-title" className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Comment ça marche ?
            </h2>
          </div>
          <Link
            href="/comment-ca-marche"
            className="inline-flex items-center gap-2 font-semibold text-gray-300 underline underline-offset-4 hover:text-white"
          >
            Tout le détail
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex gap-5 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 sm:block sm:p-6">
              <span aria-hidden className="w-8 shrink-0 font-display text-5xl italic leading-none text-gold sm:text-6xl">
                {i + 1}
              </span>
              <step.icon className="absolute right-6 top-7 hidden h-6 w-6 text-gray-400 sm:block" aria-hidden />
              <div>
                <h3 className="text-lg font-bold sm:mt-4">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <ul className="mt-10 grid gap-3 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-center gap-2.5 text-sm font-semibold text-gray-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
