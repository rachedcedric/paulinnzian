import type { Metadata } from "next";
import { getShippingRates } from "@/actions/public";
import { PricingClient } from "./PricingClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Consultez nos tarifs d'expédition.",
};

export default async function TarifsPage() {
  const shippingRates = await getShippingRates();

  return <PricingClient shippingRates={shippingRates} />;
}
