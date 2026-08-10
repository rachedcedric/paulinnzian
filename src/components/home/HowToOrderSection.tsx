"use client";

import { motion } from "framer-motion";
import {
  Link as LinkIcon, Calculator, CreditCard, ShoppingCart, Package, Plane, CheckCircle,
} from "lucide-react";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";

const steps = [
  { icon: LinkIcon, number: "01", title: "Envoyez le lien", description: "Envoyez le lien du produit ou votre panier via WhatsApp." },
  { icon: Calculator, number: "02", title: "Calcul du montant", description: "Je calcule le montant exact avec le taux de change en vigueur." },
  { icon: CreditCard, number: "03", title: "Paiement", description: "Vous effectuez le paiement par Mobile Money ou espèces." },
  { icon: ShoppingCart, number: "04", title: "Achat immédiat", description: "J'achète immédiatement sur la boutique officielle." },
  { icon: Package, number: "05", title: "Réception Paris", description: "Les colis sont réceptionnés à mon bureau de Paris." },
  { icon: Plane, number: "06", title: "Expédition", description: "Expédition vers Abidjan ou votre destination." },
  { icon: CheckCircle, number: "07", title: "Livraison", description: "Vous récupérez votre commande à destination." },
];

export function HowToOrderSection() {
  const { whatsappUrl } = useSiteConfig();
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">
            COMMENT <span className="text-[#FF6500]">COMMANDER</span> ?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Un processus simple et transparent en 7 étapes.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Connection line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gray-200 mx-20" />

          <div className="grid grid-cols-7 gap-2">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center relative"
              >
                {/* Step circle */}
                <div className="w-24 h-24 bg-white border-4 border-[#F5F5F5] rounded-full flex flex-col items-center justify-center mb-4 relative z-10 shadow-sm group hover:border-[#FF6500] transition-colors">
                  <step.icon className="w-7 h-7 text-[#FF6500] mb-1" />
                  <span className="text-xs font-bold text-black">{step.number}</span>
                </div>
                <h3 className="font-bold text-black text-xs mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-[#FF6500]" />
                </div>
                {i < steps.length - 1 && <div className="w-0.5 h-8 bg-gray-200 my-1" />}
              </div>
              <div className="pb-8 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#FF6500]">{step.number}</span>
                  <h3 className="font-bold text-black">{step.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:shadow-lg"
          >
            Démarrer ma commande
          </a>
        </motion.div>
      </div>
    </section>
  );
}
