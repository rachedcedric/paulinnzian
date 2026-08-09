import { adminGetClients } from "@/actions/admin";
import { ClientsAdmin } from "@/components/admin/ClientsAdmin";

export default async function AdminClientsPage() {
  const clients = await adminGetClients();
  return <ClientsAdmin initialClients={clients} />;
}