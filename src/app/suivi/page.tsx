import type { Metadata } from "next";
import { TrackingClient } from "./TrackingClient";

export const metadata: Metadata = {
  title: "Suivre votre commande",
  description: "Suivez l'avancement de votre commande en temps réel.",
};

export default function SuiviPage() {
  return <TrackingClient />;
}
