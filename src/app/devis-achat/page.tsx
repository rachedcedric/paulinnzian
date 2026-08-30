import type { Metadata } from "next";
import { DevisClient } from "./DevisClient";

export const metadata: Metadata = {
  title: "Devis d'achat",
  description:
    "Simulez gratuitement le montant en FCFA de vos paniers d'achat en Europe (SHEIN, Zara, Amazon, Nike...) au taux fixe de 670 FCFA/€.",
};

export default function DevisAchatPage() {
  return <DevisClient />;
}
