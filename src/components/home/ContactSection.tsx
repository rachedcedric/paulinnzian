"use client";

import { motion } from "framer-motion";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/ui/ContactForm";

export function ContactSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">
            NOUS <span className="text-[#FF6500]">CONTACTER</span>
          </h2>
          <p className="text-gray-600">Disponible 7j/7 pour répondre à vos questions.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black rounded-3xl p-8 lg:p-10 text-white"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-1">Paulin N'ZIAN</h3>
              <p className="text-[#FF6500] font-semibold">Personal Shopper</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF6500]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#FF6500]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bureau Paris</p>
                  <p className="text-white font-semibold">Paris 18ème arrondissement</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF6500]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#FF6500]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bureau Abidjan</p>
                  <p className="text-white font-semibold">Cocody Faya, Abidjan</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#25D366]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">WhatsApp</p>
                  <a href="https://wa.me/33637036839" className="text-[#25D366] font-semibold hover:underline">
                    +33 6 37 03 68 39
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Appels & SMS CI</p>
                  <p className="text-white font-semibold">+225 07 77 06 13 30</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="https://wa.me/33637036839"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-white font-bold py-4 rounded-2xl transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                CONTACTER SUR WHATSAPP
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
