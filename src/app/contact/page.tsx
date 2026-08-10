import type { Metadata } from "next";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/ui/ContactForm";
import { getSiteSettings } from "@/actions/public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Paulin N'ZIAN, votre Personal Shopper.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsappUrl = settings.whatsapp_link || "https://wa.me/33637036839";
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            NOUS <span className="text-[#FF6500]">CONTACTER</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Disponible 7j/7. Réponse rapide sur WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Info Card */}
          <div className="bg-black rounded-3xl p-8 lg:p-10 text-white">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-1">{settings.site_name || "Paulin N'ZIAN"}</h2>
              <p className="text-[#FF6500] font-semibold">Personal Shopper</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF6500]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#FF6500]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bureau Paris</p>
                  <p className="text-white font-semibold">{settings.address_paris || "Paris 18ème arrondissement"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF6500]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#FF6500]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bureau Abidjan</p>
                  <p className="text-white font-semibold">{settings.address_abidjan || "Cocody Faya, Abidjan"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#25D366]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">WhatsApp</p>
                  <a
                    href={whatsappUrl}
                    className="text-[#25D366] font-semibold hover:underline text-lg"
                  >
                    {settings.whatsapp_number || "+33 6 37 03 68 39"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Appels & SMS CI</p>
                  <p className="text-white font-semibold text-lg">{settings.phone_ci || "+225 07 77 06 13 30"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-white font-bold py-4 rounded-2xl transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                CONTACTER SUR WHATSAPP
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#F5F5F5] rounded-3xl p-8 lg:p-10">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
