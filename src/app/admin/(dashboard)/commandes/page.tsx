import { adminGetOrders } from "@/actions/admin";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";

export default async function AdminCommandesPage() {
  const orders = await adminGetOrders();
  return <OrdersAdmin initialOrders={orders} />;
}
