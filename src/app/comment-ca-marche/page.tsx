import type { Metadata } from "next";
import { motion } from "framer-motion";
import {
  Link, Calculator, CreditCard, ShoppingCart, Package, Plane, CheckCircle, Store, Smartphone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description: "Découvrez comment fonctionne notre service de personal shopping.",
};

const steps = [
  {
    icon: Smartphone,
    number: "01",
    title: "Choisissez vos produits",
    description: "Naviguez sur vos boutiques préférées et sélectionnez vos articles.",
  },
  {
    icon: Link,
    number: "02",
    title: "Envoyez les liens",
    description: "Partagez les liens de vos produits ou votre panier via WhatsApp.",
  },
  {
    icon: Calculator,
    number: "03",
    title: "Montant calculé",
    description: "Je vous communique le montant exact avec le taux de change en vigueur.",
  },
  {
    icon: CreditCard,
    number: "04",
    title: "Effectuez le paiement",
    description: "Payez par Mobile Money ou espèces selon les modalités convenues.",
  },
  {
    icon: ShoppingCart,
    number: "05",
    title: "J'effectue les achats",
    description: "Je commande immédiatement sur les boutiques officielles.",
  },
  {
    icon: Package,
    number: "06",
    title: "Réception à Paris",
    description: "Vos colis sont réceptionnés à mon bureau de Paris 18ème.",
  },
  {
    icon: Plane,
    number: "07",
    title: "Expédition",
    description: "Les colis sont expédiés vers votre destination (Abidjan, etc.).",
  },
  {
    icon: CheckCircle,
    number: "08",
    title: "Livraison",
    description: "Vous récupérez votre commande à destination.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            COMMENT ÇA <span className="text-[#FF6500]">MARCHE</span> ?
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Un service simple, transparent et sécurisé en 8 étapes.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex gap-6 items-start"
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-6 h-6 text-[#FF6500]" />
                </div>
                {i < steps.length - 1 && <div className="w-0.5 h-6 bg-gray-200 my-2" />}
              </div>
              <div className="pt-2 pb-6">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-[#FF6500]">{step.number}</span>
                  <h3 className="font-black text-black text-lg">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="bg-[#F5F5F5] rounded-3xl p-8 lg:p-10">
          <h2 className="text-2xl font-black text-black mb-6">
            MODES DE <span className="text-[#FF6500]">PAIEMENT</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {["ESPÈCES", "MOBILE MONEY"].map((method) => (
              <div key={method} className="bg-white rounded-xl p-5 text-center">
                <p className="font-black text-xl text-black">{method}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Les modalités exactes sont communiquées au moment de la validation de votre commande.
            Ne transmettez jamais d'informations financières sensibles par d'autres canaux.
          </p>
        </div>

        {/* Physical store service */}
        <div className="bg-black rounded-3xl p-8 lg:p-10 text-white">
          <Store className="w-10 h-10 text-[#FF6500] mb-4" />
          <h2 className="text-2xl font-black text-white mb-3">
            ACHATS EN <span className="text-[#FF6500]">MAGASIN</span>
          </h2>
          <p className="text-gray-400 mb-6">
            Pour certains articles, nous pouvons nous déplacer directement en boutique en France.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-bold text-white mb-2">Luxe</h3>
              <p className="text-gray-400 text-sm">Gucci, Chanel, Louis Vuitton, etc.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-bold text-white mb-2">High-Tech</h3>
              <p className="text-gray-400 text-sm">Apple, Samsung et autres marques.</p>
            </div>
          </div>
          <a
            href={`https://wa.me/33637036839?text=${encodeURIComponent("Bonjour Paulin, je souhaite effectuer un achat directement en magasin.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF6500] hover:bg-[#e55a00] text-white font-bold px-8 py-4 rounded-full transition-all"
          >
            DEMANDER UN ACHAT EN MAGASIN
          </a>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="https://wa.me/33637036839"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-white font-bold px-12 py-5 rounded-full text-lg transition-all hover:shadow-lg"
          >
            Commander maintenant sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
