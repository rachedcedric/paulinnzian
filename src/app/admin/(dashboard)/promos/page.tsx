import { adminGetPromoProducts, adminGetStores } from "@/actions/admin";
import { PromosAdmin } from "@/components/admin/PromosAdmin";

export default async function AdminPromosPage() {
  const [products, stores] = await Promise.all([adminGetPromoProducts(), adminGetStores()]);
  return <PromosAdmin products={products} stores={stores.map((store) => ({ id: store.id, name: store.name }))} />;
}
