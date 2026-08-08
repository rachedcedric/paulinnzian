import { adminGetExchangeRates, adminGetShippingRates } from "@/actions/admin";
import { TarifsAdmin } from "@/components/admin/TarifsAdmin";

export default async function AdminTarifsPage() {
  const [exchangeRates, shippingRates] = await Promise.all([
    adminGetExchangeRates(),
    adminGetShippingRates(),
  ]);
  return <TarifsAdmin exchangeRates={exchangeRates} shippingRates={shippingRates} />;
}
