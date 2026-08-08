"use client";

import { motion } from "framer-motion";
import { XCircle, CheckCircle } from "lucide-react";

export function ComparisonSection() {
  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">
            POURQUOI MES CLIENTS{" "}
            <span className="text-[#FF6500]">ÉCONOMISENT</span> ?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {/* Others */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-7 border-2 border-gray-200"
          >
            <h3 className="font-black text-gray-500 text-center text-lg mb-6">AUTRES PRESTATAIRES</h3>
            <ul className="space-y-4">
              {[
                "Commission sur le panier",
                "Frais cachés",
                "Prix variables",
                "Manque de transparence",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-500">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* VS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-[#FF6500] rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-black text-2xl">VS</span>
            </div>
          </motion.div>

          {/* Us */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black rounded-2xl p-7 border-2 border-[#FF6500]"
          >
            <h3 className="font-black text-white text-center text-lg mb-6">
              AVEC PAULIN N'ZIAN
            </h3>
            <ul className="space-y-4">
              {[
                "Prix réel du panier",
                "Aucun frais caché",
                "Zéro commission",
                "Tarifs 100% transparents",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white">
                  <CheckCircle className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
