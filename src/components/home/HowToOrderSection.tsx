"use client";

import { motion } from "framer-motion";
import { Link as LinkIcon, CreditCard, Plane, PackageCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: LinkIcon,
    number: "1",
    title: "Partagez vos liens",
    description: "Envoyez-moi vos paniers ou liens d'articles depuis les boutiques en ligne de votre choix.",
  },
  {
    icon: CreditCard,
    number: "2",
    title: "Je m'occupe des achats",
    description: "Je valide vos commandes avec mon moyen de paiement, sans frais cachés ni commission.",
  },
  {
    icon: Plane,
    number: "3",
    title: "Expédition depuis Paris",
    description: "Vos colis sont regroupés et expédiés vers Abidjan et Dakar en toute sécurité.",
  },
  {
    icon: PackageCheck,
    number: "4",
    title: "Réception de vos colis",
    description: "Vous recevez vos commandes et pouvez suivre leur progression.",
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
    <section className="overflow-hidden bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">Comment ça marche ?</h2>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {/* Steps */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#FAFAF8] rounded-3xl p-6 sm:p-8"
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-16 h-16 bg-white border-2 border-[#D99A12]/30 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <step.icon className="w-7 h-7 text-[#D99A12]" />
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#090B10] text-white text-xs font-black flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-bold text-black text-base mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust sidebar */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#FBF3E1] border border-[#D99A12]/30 rounded-3xl p-6 sm:p-8"
          >
            <h3 className="font-black text-black text-lg mb-5">Pourquoi me faire confiance ?</h3>
            <ul className="space-y-4">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D99A12] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
