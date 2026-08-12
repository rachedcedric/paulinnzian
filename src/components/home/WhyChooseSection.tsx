"use client";

import { motion } from "framer-motion";
import { Tag, ShieldCheck, Zap, Lock, Star } from "lucide-react";

const features = [
  {
    icon: Tag,
    title: "Prix Réel du Panier",
    description: "Vous payez exactement le prix affiché sur la boutique, converti au taux en vigueur. Aucune majoration.",
  },
  {
    icon: Star,
    title: "Zéro Frais Caché",
    description: "Tous les frais sont communiqués avant la commande. Pas de surprises au moment du paiement.",
  },
  {
    icon: ShieldCheck,
    title: "Zéro Commission",
    description: "Contrairement à d'autres services, je ne prends aucune commission sur la valeur de vos achats.",
  },
  {
    icon: Zap,
    title: "Expédition Rapide",
    description: "Vos colis sont expédiés rapidement depuis Paris. Express disponible pour les urgences.",
  },
  {
    icon: Lock,
    title: "Service Sécurisé",
    description: "Vos commandes sont gérées avec soin. Vous recevez un numéro de suivi pour chaque envoi.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">
            POURQUOI CHOISIR{" "}
            <span className="text-[#FF6500]">PAULIN N'ZIAN</span> ?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Un service transparent, fiable et professionnel pour vos achats en Europe.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-all group ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="w-12 h-12 bg-[#FF6500]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6500] transition-colors">
                <feature.icon className="w-6 h-6 text-[#FF6500] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-black text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
