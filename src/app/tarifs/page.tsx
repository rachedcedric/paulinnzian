import type { Metadata } from "next";
import { getExchangeRates, getShippingRates } from "@/actions/public";
import { PricingClient } from "./PricingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Consultez nos taux de change et tarifs d'expédition.",
};

export default async function TarifsPage() {
  const [exchangeRates, shippingRates] = await Promise.all([
    getExchangeRates(),
    getShippingRates(),
  ]);

  return <PricingClient exchangeRates={exchangeRates} shippingRates={shippingRates} />;
}
