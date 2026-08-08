import { adminGetStores } from "@/actions/admin";
import { StoresAdmin } from "@/components/admin/StoresAdmin";

export default async function AdminBoutiquesPage() {
  const stores = await adminGetStores();
  return <StoresAdmin initialStores={stores} />;
}
